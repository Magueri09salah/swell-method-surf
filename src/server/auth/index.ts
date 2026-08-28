import "server-only";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { getSession, type SessionUser } from "./session";

export { getSession, setSessionCookie, clearSessionCookie, SESSION_COOKIE } from "./session";
export type { SessionUser } from "./session";

const BCRYPT_COST = 12;

/**
 * A pre-computed hash of a throwaway value.
 *
 * Compared against when no user matches, so an unknown email costs the same
 * wall-clock time as a known one. Without this, response timing leaks which
 * addresses have accounts.
 */
const DUMMY_HASH = "$2b$12$JDJg48M//org03hePBtmdO2pZ8GTq3q0LowLjhz4hmNJDO4iAohzG";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

/**
 * Verifies credentials. Returns null for BOTH "no such user" and "wrong
 * password" — the caller must not distinguish them in any user-facing message.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, name: true, role: true, passwordHash: true },
  });

  const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !matches) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/**
 * THE security boundary.
 *
 * Every admin page and every mutating server action calls this. Middleware is
 * treated as UX only — a server action can be invoked directly and does not
 * necessarily traverse a page's middleware, so authorisation must be re-checked
 * at the point of work. See docs/ARCHITECTURE.md §5.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/**
 * Non-redirecting variant for server actions, which should return a typed
 * failure rather than throw a redirect mid-mutation.
 */
export async function requireAdminOrFail(): Promise<
  { ok: true; user: SessionUser } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Your session has expired. Please sign in again." };
  return { ok: true, user: session };
}
