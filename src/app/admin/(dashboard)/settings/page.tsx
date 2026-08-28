import { AdminHeading } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettingsForEdit } from "@/server/services/settings";

export default async function SettingsPage() {
  const settings = await getSettingsForEdit();

  return (
    <>
      <AdminHeading
        title="Settings"
        description="Business details, contact information and search-engine defaults."
      />
      <SettingsForm settings={settings} />
    </>
  );
}
