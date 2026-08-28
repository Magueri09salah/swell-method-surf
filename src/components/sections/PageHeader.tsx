import type { ReactNode } from "react";
import { Container, Eyebrow, WaveRule } from "@/components/ui/primitives";

/**
 * Shared page opener. Keeps every interior page starting on the same rhythm,
 * which is what makes a multi-page site feel like one designed object rather
 * than a set of templates.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-[var(--color-line)] pb-12 pt-12 md:pb-16 md:pt-16 lg:pb-20 lg:pt-24">
      <Container size="wide">
        <div className="flex max-w-[64ch] flex-col gap-5">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="type-display-l text-[var(--text-primary)]">{title}</h1>
          <WaveRule />
          {lead && <p className="measure type-body-lg text-[var(--text-secondary)]">{lead}</p>}
          {children}
        </div>
      </Container>
    </header>
  );
}
