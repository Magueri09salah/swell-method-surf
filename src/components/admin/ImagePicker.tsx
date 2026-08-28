"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ImageUp, Images, Link2, Loader2, Trash2, X } from "lucide-react";
import { ErrorBanner } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import type { MediaAssetDTO } from "@/server/services/media";

/**
 * Image chooser for the admin.
 *
 * Three ways in, because the coach will be at a laptop sometimes and on a phone
 * at the beach other times:
 *
 *   1. Upload — a native file input with `accept="image/*"`, which on iOS and
 *      Android opens the system sheet: Photo Library / Take Photo / Browse.
 *      `capture` is deliberately NOT set: that would force the camera and
 *      remove the gallery option, which is the opposite of what is wanted.
 *   2. Library — re-use something already uploaded.
 *   3. Paste a URL — the escape hatch for an image hosted elsewhere.
 *
 * PHONE PHOTOS ARE HUGE. A modern phone JPEG is 3-6MB at 4000px, which is
 * wasteful to store and slow to serve. Anything large is downscaled to 2000px
 * and re-encoded in the browser BEFORE upload, typically 3-5MB down to ~300KB.
 * Small images are passed through untouched, so a compact PNG keeps its
 * transparency instead of being flattened onto black.
 *
 * Alt text is captured here, at the moment of upload, rather than left to a
 * separate field someone can skip. An image cannot enter the library without it.
 */

const MAX_DIMENSION = 2000;
const PASSTHROUGH_BYTES = 600 * 1024;
const JPEG_QUALITY = 0.82;

type Prepared = { blob: Blob; width: number; height: number; filename: string };

async function prepare(file: File): Promise<Prepared> {
  const fallback: Prepared = {
    blob: file,
    width: 0,
    height: 0,
    filename: file.name,
  };

  if (typeof createImageBitmap !== "function") return fallback;

  let bitmap: ImageBitmap;
  try {
    // `from-image` applies EXIF orientation, so portrait phone photos are not
    // stored sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return fallback;
  }

  const { width: sourceWidth, height: sourceHeight } = bitmap;
  const longest = Math.max(sourceWidth, sourceHeight);

  // Already small and reasonably sized — keep the original bytes and format.
  if (file.size <= PASSTHROUGH_BYTES && longest <= MAX_DIMENSION) {
    bitmap.close();
    return { blob: file, width: sourceWidth, height: sourceHeight, filename: file.name };
  }

  const scale = Math.min(1, MAX_DIMENSION / longest);
  const width = Math.round(sourceWidth * scale);
  const height = Math.round(sourceHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { ...fallback, width: sourceWidth, height: sourceHeight };
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );

  if (!blob) return { ...fallback, width: sourceWidth, height: sourceHeight };

  const filename = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return { blob, width, height, filename };
}

type Props = {
  /** Current image reference — an /api/media/… path, a /public path, or a URL. */
  value: string;
  onChange: (url: string) => void;
  /** Kept in step with the form's own alt field. */
  altText: string;
  onAltTextChange: (alt: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /**
   * Show the alt-text field.
   *
   * Off where the image is DECORATIVE — a coaching or package card, where the
   * title, description and price beside it already carry the meaning. WCAG
   * 1.1.1 is explicit that such images take `alt=""`; asking for alt text there
   * produces redundant announcements, not accessible ones. The gallery keeps it
   * on, because there the photograph IS the content.
   */
  showAltText?: boolean;
  /** Show the "Library" button (re-use a previous upload). */
  showLibrary?: boolean;
  /** Show the "Use a link" escape hatch. */
  showUrlInput?: boolean;
  /**
   * Alt text recorded against the uploaded asset when `showAltText` is off.
   * The library still needs something to identify a file by.
   */
  uploadAltFallback?: string;
};

export function ImagePicker({
  value,
  onChange,
  altText,
  onAltTextChange,
  label = "Image",
  hint,
  error,
  required = false,
  showAltText = true,
  showLibrary = true,
  showUrlInput = true,
  uploadAltFallback = "",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState<{ file: File; preview: string } | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [urlMode, setUrlMode] = useState(false);

  // Object URLs are a real leak if not revoked.
  useEffect(() => {
    return () => {
      if (pending) URL.revokeObjectURL(pending.preview);
    };
  }, [pending]);

  const choose = () => {
    setFailure(null);
    fileRef.current?.click();
  };

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so picking the same file twice still fires a change event.
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFailure("That file is not an image.");
      return;
    }

    setFailure(null);
    setPending({ file, preview: URL.createObjectURL(file) });
  };

  const upload = useCallback(async () => {
    if (!pending) return;

    const effectiveAlt = showAltText
      ? altText.trim()
      : altText.trim() || uploadAltFallback.trim() || `Photograph — ${label}`;

    if (showAltText && effectiveAlt.length < 4) {
      setFailure("Describe the photograph first — alt text is required.");
      return;
    }

    setBusy(true);
    setFailure(null);

    try {
      const prepared = await prepare(pending.file);

      const body = new FormData();
      body.append("file", prepared.blob, prepared.filename);
      body.append("altText", effectiveAlt);
      body.append("width", String(prepared.width));
      body.append("height", String(prepared.height));

      const response = await fetch("/api/media/upload", { method: "POST", body });
      const result = (await response.json()) as
        { ok: true; asset: MediaAssetDTO } | { ok: false; error: string };

      if (!result.ok) {
        setFailure(result.error);
        return;
      }

      onChange(result.asset.url);
      URL.revokeObjectURL(pending.preview);
      setPending(null);
    } catch {
      setFailure("The upload did not complete. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }, [pending, altText, onChange, showAltText, uploadAltFallback, label]);

  const previewSrc = pending?.preview ?? value;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="type-caption font-semibold text-[var(--text-primary)]">
          {label}
          {required && (
            <>
              <span aria-hidden="true" className="ml-1 text-[var(--color-danger)]">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </span>
        {hint && <p className="type-caption text-[var(--text-secondary)]">{hint}</p>}
      </div>

      {failure && <ErrorBanner>{failure}</ErrorBanner>}
      {error && !failure && <ErrorBanner>{error}</ErrorBanner>}

      {previewSrc ? (
        <div className="relative w-full max-w-sm overflow-hidden rounded-[12px] border border-[var(--color-line)] bg-[var(--surface-soft)]">
          <div className="relative aspect-[4/3]">
            {/* Unoptimised: this is a local blob preview or an already-sized
                upload, and running it through the optimiser buys nothing. */}
            <Image
              src={previewSrc}
              alt=""
              fill
              sizes="384px"
              unoptimized
              className="object-cover"
            />
          </div>

          {pending && (
            <p className="border-t border-[var(--color-line)] px-3 py-2 type-caption text-[var(--text-secondary)]">
              Ready to upload · {(pending.file.size / 1024 / 1024).toFixed(1)}MB
              {pending.file.size > PASSTHROUGH_BYTES && " · will be resized"}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={choose}
          className="flex aspect-[4/3] w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-[var(--color-line-strong)] bg-[var(--surface-soft)] p-6 text-center transition-colors duration-200 hover:border-[var(--color-ink)]"
        >
          <ImageUp aria-hidden="true" className="size-7 text-[var(--text-tertiary)]" />
          <span className="type-body-sm font-medium">Choose a photograph</span>
          <span className="type-caption text-[var(--text-secondary)]">
            From this device, your photo library, or the camera
          </span>
        </button>
      )}

      {/* accept="image/*" without `capture` gives the full system sheet on a
          phone: Photo Library, Take Photo, or Browse. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onFile}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {pending ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={upload}
            disabled={busy}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[9999px] bg-[var(--color-ink)] px-5 type-label text-white transition-colors duration-200 hover:bg-[var(--interactive-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <ImageUp aria-hidden="true" className="size-4" />
                Upload this image
              </>
            )}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => {
              URL.revokeObjectURL(pending.preview);
              setPending(null);
              setFailure(null);
            }}
            className="inline-flex h-11 cursor-pointer items-center rounded-[9999px] border border-[var(--color-line-strong)] px-5 type-label transition-colors duration-200 hover:border-[var(--color-ink)] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={choose}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[9999px] border border-[var(--color-ink)] px-5 type-label transition-colors duration-200 hover:bg-[var(--color-ink)] hover:text-white"
          >
            <ImageUp aria-hidden="true" className="size-4" />
            {value ? "Replace" : "Choose image"}
          </button>

          {showLibrary && (
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[9999px] border border-[var(--color-line-strong)] px-5 type-label transition-colors duration-200 hover:border-[var(--color-ink)]"
            >
              <Images aria-hidden="true" className="size-4" />
              Library
            </button>
          )}

          {showUrlInput && (
            <button
              type="button"
              onClick={() => setUrlMode((v) => !v)}
              aria-expanded={urlMode}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[9999px] px-4 type-label text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--color-line-subtle)]"
            >
              <Link2 aria-hidden="true" className="size-4" />
              Use a link
            </button>
          )}

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[9999px] px-4 type-label text-[var(--color-danger)] transition-colors duration-200 hover:bg-[rgba(179,38,30,0.08)]"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Remove
            </button>
          )}
        </div>
      )}

      {showUrlInput && urlMode && (
        <label className="flex flex-col gap-1.5">
          <span className="type-caption font-semibold">Image address</span>
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/photography/example.jpg or https://…"
            className="h-11 w-full max-w-sm rounded-[8px] border border-[var(--color-line)] bg-white px-3.5 text-base transition-colors duration-200 hover:border-[var(--color-line-strong)] focus:border-[var(--color-ink)]"
          />
          <span className="type-caption text-[var(--text-secondary)]">
            A path inside this site, or a full URL on an allow-listed host.
          </span>
        </label>
      )}

      {/* Alt text lives with the picker so an image cannot be chosen without
          describing it — where the image carries meaning. */}
      {showAltText && (
        <label className="flex max-w-2xl flex-col gap-1.5">
          <span className="type-caption font-semibold">
            Alt text
            <span aria-hidden="true" className="ml-1 text-[var(--color-danger)]">
              *
            </span>
          </span>
          <textarea
            value={altText}
            onChange={(event) => onAltTextChange(event.target.value)}
            rows={2}
            className="w-full rounded-[8px] border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-base leading-relaxed transition-colors duration-200 hover:border-[var(--color-line-strong)] focus:border-[var(--color-ink)]"
            placeholder="Describe what is in the photograph"
          />
          <span className="type-caption text-[var(--text-secondary)]">
            What someone would miss if they could not see it. Required.
          </span>
        </label>
      )}

      {showLibrary && (
        <MediaLibrary
          open={libraryOpen}
          onOpenChange={setLibraryOpen}
          onSelect={(asset) => {
            onChange(asset.url);
            if (!altText.trim()) onAltTextChange(asset.altText);
            setLibraryOpen(false);
          }}
        />
      )}
    </div>
  );
}

function MediaLibrary({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: MediaAssetDTO) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(20,20,20,0.6)]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[min(92vw,60rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[12px] border border-[var(--color-line)] bg-[var(--surface-raised)]">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3.5">
            <Dialog.Title className="type-h3">Your uploads</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="grid size-11 cursor-pointer place-items-center rounded-[8px] transition-colors duration-200 hover:bg-[var(--color-line-subtle)]"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">
            Choose an image you have already uploaded.
          </Dialog.Description>

          {/* Radix unmounts Dialog.Content when closed, so LibraryGrid mounts
              fresh each time it opens. That is why it can fetch on mount
              without resetting state synchronously inside an effect. */}
          <LibraryGrid onSelect={onSelect} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function LibraryGrid({ onSelect }: { onSelect: (asset: MediaAssetDTO) => void }) {
  const [assets, setAssets] = useState<MediaAssetDTO[] | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/media")
      .then((r) => r.json())
      .then((data: { ok: boolean; assets?: MediaAssetDTO[] }) => {
        if (cancelled) return;
        if (data.ok && data.assets) setAssets(data.assets);
        else setFailure("Could not load the library.");
      })
      .catch(() => {
        if (!cancelled) setFailure("Could not load the library.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="overflow-y-auto p-5">
      {failure && <ErrorBanner>{failure}</ErrorBanner>}

      {assets === null && !failure && (
        <p role="status" className="type-body-sm text-[var(--text-secondary)]">
          Loading…
        </p>
      )}

      {assets?.length === 0 && (
        <p className="type-body-sm text-[var(--text-secondary)]">
          Nothing uploaded yet. Use <strong>Choose image</strong> to add the first one.
        </p>
      )}

      {assets && assets.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <li key={asset.id}>
              <button
                type="button"
                onClick={() => onSelect(asset)}
                className={cn(
                  "group block w-full cursor-pointer overflow-hidden rounded-[8px] border border-[var(--color-line)]",
                  "transition-colors duration-200 hover:border-[var(--color-ink)]",
                )}
              >
                <span className="relative block aspect-[4/3]">
                  <Image
                    src={asset.url}
                    alt={asset.altText}
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                </span>
                <span className="block truncate px-2 py-1.5 text-left type-caption text-[var(--text-secondary)]">
                  {asset.filename}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
