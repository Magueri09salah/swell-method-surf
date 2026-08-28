"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validation/admin";
import { verifyCredentials, setSessionCookie, clearSessionCookie } from "@/server/auth";
import { checkRateLimit, clientIp, RATE_LIMITS } from "@/server/rate-limit";
import { fail, type ActionResult } from "@/server/services/types";

export async function loginAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData,
): Promise<ActionResult<undefined>> {
  const requestHeaders = await headers();
  const ip = clientIp(requestHeaders);

  const limit = checkRateLimit(`login:${ip}`, RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMs);
  if (!limit.ok) {
    const minutes = Math.ceil(limit.retryAfter / 60);
    return fail(`Too many attempts. Please wait ${minutes} minute${minutes === 1 ? "" : "s"} and try again.`);
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("Enter your email address and password.");
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);

  // One message for both "no such account" and "wrong password" — anything more
  // specific lets an attacker enumerate valid addresses.
  if (!user) {
    return fail("Those details are not correct.");
  }

  await setSessionCookie(user);

  // redirect() throws a control-flow signal, so it must be the last statement
  // and must sit outside any try/catch.
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}
