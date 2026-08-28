import { AdminHeading } from "@/components/admin/ui";
import { GalleryForm } from "@/components/admin/GalleryForm";

export default function NewGalleryImagePage() {
  return (
    <>
      <AdminHeading back={{ href: "/admin/gallery", label: "Gallery" }} title="Add an image" />
      <GalleryForm />
    </>
  );
}
