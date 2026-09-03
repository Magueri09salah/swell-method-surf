import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container, EyebrowInverse } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import type { TestimonialDTO } from "@/server/services/types";

export function TestimonialsSection({ testimonials }: { testimonials: TestimonialDTO[] }) {
  // Nothing published → show nothing. A designed empty state is the right call
  // for an admin list the coach is about to fill; on the public homepage it
  // just draws a box around the fact that there are no reviews yet. The
  // section returns by itself as soon as one is published.
  if (testimonials.length === 0) return null;

  return (
    <section className="section-y bg-[var(--surface-inverse)] text-[var(--text-on-inverse)] relative overflow-hidden">
      <Container size="wide">
        <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-[40ch] flex-col gap-4">
            <EyebrowInverse>In their words</EyebrowInverse>
            <h2 className="type-display-l">What surfers say afterwards.</h2>
          </div>

          <ButtonLink href="/reviews" variant="inverse" className="w-fit shrink-0">
            Read all reviews
            <ArrowRight aria-hidden="true" className="size-4" />
          </ButtonLink>
        </Reveal>

        <div className="mt-12">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={Math.min(index, 5) * 60}>
                <TestimonialCard testimonial={testimonial} inverse />
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Light-surface variant used on the dedicated /reviews page. */
export function TestimonialsGrid({ testimonials }: { testimonials: TestimonialDTO[] }) {
  // No empty state here: /reviews returns a 404 when there is nothing to list,
  // so this only ever renders with at least one testimonial in hand.
  return (
    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
      {testimonials.map((testimonial, index) => (
        <Reveal key={testimonial.id} delay={Math.min(index, 5) * 60}>
          <TestimonialCard testimonial={testimonial} />
        </Reveal>
      ))}
    </div>
  );
}
