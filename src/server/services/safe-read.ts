import "server-only";

/**
 * Resilient public reads.
 *
 * PROBLEM: every public page reads from the database. Without this, an
 * unreachable database means the production BUILD fails (prerendering throws)
 * and a transient outage means visitors get a 500 on the marketing site — the
 * one part of the product that has no business depending on live data.
 *
 * SOLUTION: public read paths return a documented fallback instead of throwing.
 * Every section on the site already has a designed empty state, and every
 * content key already ships a default, so a degraded page still looks finished
 * rather than broken.
 *
 * SCOPE — deliberately narrow:
 *   - USE for public, read-only queries.
 *   - NEVER use for admin reads: the coach must see a real error, not silently
 *     empty lists that could lead them to re-create data that already exists.
 *   - NEVER use for writes: a failed write must surface.
 *
 * Failures are logged at error level with the label, so a degraded page is
 * loud in the logs even though it is quiet in the UI.
 */
export async function safeRead<T>(
  label: string,
  read: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await read();
  } catch (error) {
    console.error(
      `[safe-read] "${label}" failed; serving fallback. The page will self-heal once the database is reachable.`,
      error,
    );
    return fallback;
  }
}
