import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Swell Method Admin" },
  robots: { index: false, follow: false },
};

/**
 * Every authenticated admin page is a child of this layout, so `requireAdmin()`
 * runs before any of them render. This is guard layer 2 of 3 — middleware is
 * layer 1 (UX), and each server action re-checks independently as layer 3
 * (the real boundary). See docs/ARCHITECTURE.md §5.
 *
 * `force-dynamic` because every response is user- and request-specific and must
 * never be cached or statically prerendered.
 */
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return <AdminShell userName={user.name}>{children}</AdminShell>;
}
