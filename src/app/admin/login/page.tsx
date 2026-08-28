import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { WaveRule } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Sign in",
  // The admin must never be indexed.
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="flex w-full max-w-[26rem] flex-col gap-8">
        <div className="flex flex-col items-start gap-5">
          <Logo />
          <WaveRule />
          <div className="flex flex-col gap-2">
            <h1 className="type-h1">Sign in</h1>
            <p className="type-body-sm text-[var(--text-secondary)]">
              This area is private. It is where bookings, coaching options and site content are
              managed.
            </p>
          </div>
        </div>

        <LoginForm />

        <Link
          href="/"
          className="type-caption font-semibold text-[var(--text-secondary)] underline-offset-4 transition-colors duration-200 hover:text-[var(--color-ink)] hover:underline"
        >
          ← Back to the website
        </Link>
      </div>
    </main>
  );
}
