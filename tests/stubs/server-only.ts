/**
 * Test stub for the `server-only` package.
 *
 * `server-only` throws if a module is pulled into a client bundle — that is the
 * mechanism enforcing the "Prisma lives behind the service layer" boundary from
 * docs/ARCHITECTURE.md §2. Vitest runs in Node, where that guard is neither
 * meaningful nor resolvable, so it is aliased to this empty module.
 *
 * This does NOT weaken the real boundary: the production build still resolves
 * the genuine package and still fails if a server module is imported by a
 * client component.
 */
export {};
