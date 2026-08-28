import { notFound } from "next/navigation";
import { AdminHeading } from "@/components/admin/ui";
import { CoachingForm } from "@/components/admin/CoachingForm";
import { getOfferById } from "@/server/services/coaching";

export default async function EditCoachingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await getOfferById(id);

  if (!offer) notFound();

  return (
    <>
      <AdminHeading
        back={{ href: "/admin/coaching", label: "Coaching" }}
        title={offer.title}
        description="Changes appear on the website as soon as you save."
      />
      <CoachingForm offer={offer} />
    </>
  );
}
