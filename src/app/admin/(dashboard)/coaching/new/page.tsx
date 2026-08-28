import { AdminHeading } from "@/components/admin/ui";
import { CoachingForm } from "@/components/admin/CoachingForm";

export default function NewCoachingPage() {
  return (
    <>
      <AdminHeading
        back={{ href: "/admin/coaching", label: "Coaching" }}
        title="New coaching option"
        description="This appears on the coaching page and, if featured, on the homepage."
      />
      <CoachingForm />
    </>
  );
}
