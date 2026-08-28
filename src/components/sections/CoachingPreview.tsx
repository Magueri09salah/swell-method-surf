import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container, EmptyState, Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { CoachingCard } from "@/components/coaching/CoachingCard";
import type { CoachingOfferDTO } from "@/server/services/types";

export function CoachingPreview({ offers }: { offers: CoachingOfferDTO[] }) {
  return (
    <section className="section-y">
      <Container size="wide">
        <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-[46ch] flex-col gap-4">
            <Eyebrow>Coaching</Eyebrow>
            <h2 className="type-display-l text-[var(--text-primary)]">
              Choose how you want to be coached.
            </h2>
          </div>

          <ButtonLink href="/coaching" variant="secondary" className="w-fit shrink-0">
            All coaching options
            <ArrowRight aria-hidden="true" className="size-4" />
          </ButtonLink>
        </Reveal>

        <div className="mt-12">
          {offers.length === 0 ? (
            <EmptyState
              title="Coaching options are being finalised"
              description="Session formats and pricing are being confirmed for the season. Send a request and we will come back to you with what is available."
              action={<ButtonLink href="/contact">Get in touch</ButtonLink>}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {offers.map((offer, index) => (
                <Reveal key={offer.id} delay={Math.min(index, 5) * 60}>
                  <CoachingCard offer={offer} index={index} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
