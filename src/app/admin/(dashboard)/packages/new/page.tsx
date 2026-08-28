import { AdminHeading } from "@/components/admin/ui";
import { PackageForm } from "@/components/admin/PackageForm";

export default function NewPackagePage() {
  return (
    <>
      <AdminHeading
        back={{ href: "/admin/packages", label: "Packages" }}
        title="New package"
        description="A multi-day bundle, shown in the Our Packages section."
      />
      <PackageForm />
    </>
  );
}
