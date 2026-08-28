import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AdminHeading } from "@/components/admin/ui";
import { listContentSections } from "@/server/services/content";
import { formatRelative } from "@/lib/utils";

export default async function ContentPage() {
  const sections = await listContentSections();

  return (
    <>
      <AdminHeading
        title="Content"
        description="The words on the public website. Editing here updates the live site immediately."
      />

      <ul className="flex flex-col gap-2">
        {sections.map((section) => (
          <li key={section.key}>
            <Link
              href={`/admin/content/${encodeURIComponent(section.key)}`}
              className="flex min-h-16 items-center justify-between gap-4 rounded-[8px] border border-[var(--color-line)] bg-[var(--surface-raised)] px-5 py-3 transition-colors duration-200 hover:border-[var(--color-ink)]"
            >
              <span className="flex flex-col gap-0.5">
                <span className="type-body-sm font-semibold">{section.label}</span>
                <span className="type-caption text-[var(--text-secondary)]">
                  {section.updatedAt
                    ? `Edited ${formatRelative(section.updatedAt)}`
                    : "Using the default text"}
                </span>
              </span>
              <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-[var(--text-tertiary)]" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
