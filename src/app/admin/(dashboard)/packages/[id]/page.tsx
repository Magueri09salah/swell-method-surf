import { notFound } from "next/navigation";
import { AdminHeading } from "@/components/admin/ui";
import { PackageForm } from "@/components/admin/PackageForm";
import { getPackageById } from "@/server/services/package";

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await getPackageById(id);

  if (!pkg) notFound();

  return (
    <>
      <AdminHeading
        back={{ href: "/admin/packages", label: "Packages" }}
        title={pkg.title}
        description="Changes appear on the website as soon as you save."
      />
      <PackageForm pkg={pkg} />
    </>
  );
}
