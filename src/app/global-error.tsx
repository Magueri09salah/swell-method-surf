"use client";

/**
 * Root error boundary. Replaces the whole document, so it must render its own
 * <html> and <body> and cannot rely on the root layout's fonts or styles.
 *
 * The error `message` is deliberately NOT rendered — it can contain internal
 * detail. The `digest` is safe and is what correlates with the server log.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "2rem 1.25rem",
          backgroundColor: "#FAEADB",
          color: "#2B211C",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ maxWidth: "44ch", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#BF7047",
            }}
          >
            Something went wrong
          </p>

          <h1 style={{ margin: 0, fontSize: "2.25rem", lineHeight: 1.1, fontWeight: 400 }}>
            We hit a flat spell.
          </h1>

          <p style={{ margin: 0, lineHeight: 1.7, color: "#72594A" }}>
            An unexpected error stopped this page loading. Trying again usually resolves it. If it
            keeps happening, please get in touch and we will sort it out.
          </p>

          {error.digest && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#72594A" }}>
              Reference: <code>{error.digest}</code>
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                height: "44px",
                padding: "0 1.25rem",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#8A4E35",
                color: "#FFF9F2",
                fontWeight: 600,
                fontSize: "0.9375rem",
                cursor: "pointer",
              }}
            >
              Try again
            </button>

            {/* A plain <a> is deliberate here. global-error replaces the whole
                document when the app shell itself has failed, so a client-side
                Link navigation cannot be trusted — a full page load is the
                reliable way out. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                height: "44px",
                padding: "0 1.25rem",
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid #DCC0A6",
                borderRadius: "4px",
                color: "#2B211C",
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
