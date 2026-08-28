import { notFound } from "next/navigation";
import { AdminHeading } from "@/components/admin/ui";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { getContentForEdit } from "@/server/services/content";
import { CONTENT_LABELS, CONTENT_SCHEMAS, type ContentKey } from "@/lib/validation/content";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key: rawKey } = await params;
  const key = decodeURIComponent(rawKey);

  // Route params are untrusted — only known content keys are addressable.
  if (!(key in CONTENT_SCHEMAS)) notFound();

  const contentKey = key as ContentKey;
  const data = await getContentForEdit(contentKey);
  const label = CONTENT_LABELS[contentKey];

  return (
    <>
      <AdminHeading
        back={{ href: "/admin/content", label: "Content" }}
        title={label}
        description="Changes go live as soon as you save."
      />
      <ContentEditor
        contentKey={contentKey}
        title={label}
        initial={data as never}
      />
    </>
  );
}
