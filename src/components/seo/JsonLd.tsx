/**
 * Renders a JSON-LD <script> safely.
 *
 * Structured data embeds admin-authored strings (testimonial quotes, settings,
 * offer descriptions). Serialising those straight into a <script> body is a
 * classic injection vector: a value containing `</script>` terminates the
 * element early and everything after it is parsed as HTML.
 *
 * `JSON.stringify` does not escape `<`, so we escape the three characters that
 * matter into their `\uXXXX` forms. These remain valid JSON and parse back to
 * the identical string, so consumers see the original value.
 *
 * Every JSON-LD block in the app goes through this component — no route calls
 * dangerouslySetInnerHTML directly.
 */
function serialise(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialise(data) }}
    />
  );
}
