import { notFound } from "next/navigation";
import { AdminHeading } from "@/components/admin/ui";
import { GalleryForm } from "@/components/admin/GalleryForm";
import { getGalleryImageById } from "@/server/services/gallery";

export default async function EditGalleryImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const image = await getGalleryImageById(id);

  if (!image) notFound();

  return (
    <>
      <AdminHeading back={{ href: "/admin/gallery", label: "Gallery" }} title={image.title} />
      <GalleryForm image={image} />
    </>
  );
}
