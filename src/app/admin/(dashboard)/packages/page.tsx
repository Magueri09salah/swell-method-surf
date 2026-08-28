import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { AdminHeading } from "@/components/admin/ui";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { ConfirmSubmit, InlineSubmit } from "@/components/admin/ConfirmSubmit";
import { listAllPackages } from "@/server/services/package";
import { deletePackage, reorderPackageAction, togglePackageFlag } from "@/server/actions/admin";
import { formatPrice } from "@/lib/utils";

export default async function PackagesAdminPage() {
  const packages = await listAllPackages();

  return (
    <>
      <AdminHeading
        title="Packages"
        description="Multi-day bundles shown in the Our Packages section. Order here is the order visitors see."
        action={
          <ButtonLink href="/admin/packages/new" size="sm">
            <Plus aria-hidden="true" className="size-3.5" />
            New package
          </ButtonLink>
        }
      />

      {packages.length === 0 ? (
        <EmptyState
          title="No packages yet"
          description="Add your multi-day bundles — three days, five days, a full week — so visitors can book a whole trip rather than a single session."
          action={<ButtonLink href="/admin/packages/new">Add the first package</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <li
              key={pkg.id}
              className="flex flex-col overflow-hidden rounded-[12px] border border-[var(--color-line)] bg-[var(--surface-raised)]"
            >
              {pkg.imageUrl && (
                <div className="relative aspect-[16/10] border-b border-[var(--color-line)]">
                  {/* Decorative: the title and features below carry the meaning. */}
                  <Image
                    src={pkg.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/admin/packages/${pkg.id}`}
                    className="type-h3 text-[var(--color-ink)] underline-offset-4 hover:underline"
                  >
                    {pkg.title}
                  </Link>
                  <span data-numeric className="shrink-0 type-body-sm font-semibold">
                    {formatPrice(pkg.price, pkg.currency)}
                  </span>
                </div>

                <p className="type-caption text-[var(--text-secondary)]">
                  {pkg.days} {pkg.days === 1 ? "day" : "days"} · {pkg.features.length}{" "}
                  {pkg.features.length === 1 ? "item" : "items"} listed
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={pkg.active ? "success" : "muted"}>
                    {pkg.active ? "Active" : "Hidden"}
                  </Badge>
                  {pkg.featured && <Badge tone="warning">Featured</Badge>}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-[var(--color-line-subtle)] pt-2">
                  <div className="flex items-center gap-0.5">
                    <form action={reorderPackageAction}>
                      <input type="hidden" name="id" value={pkg.id} />
                      <input type="hidden" name="direction" value="up" />
                      <InlineSubmit label={`Move ${pkg.title} earlier`}>
                        <ArrowUp aria-hidden="true" className="size-4" />
                      </InlineSubmit>
                    </form>
                    <form action={reorderPackageAction}>
                      <input type="hidden" name="id" value={pkg.id} />
                      <input type="hidden" name="direction" value="down" />
                      <InlineSubmit label={`Move ${pkg.title} later`}>
                        <ArrowDown aria-hidden="true" className="size-4" />
                      </InlineSubmit>
                    </form>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <form action={togglePackageFlag}>
                      <input type="hidden" name="id" value={pkg.id} />
                      <input type="hidden" name="field" value="active" />
                      <input type="hidden" name="value" value={pkg.active ? "false" : "true"} />
                      <button
                        type="submit"
                        className="h-11 cursor-pointer rounded-[8px] px-3 type-caption font-semibold text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--color-line-subtle)] hover:text-[var(--color-ink)]"
                      >
                        {pkg.active ? "Hide" : "Show"}
                      </button>
                    </form>

                    <form action={deletePackage}>
                      <input type="hidden" name="id" value={pkg.id} />
                      <ConfirmSubmit
                        iconOnly
                        label={`Delete ${pkg.title}`}
                        message={`Delete "${pkg.title}"? This cannot be undone.`}
                      />
                    </form>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
