import { serializeJsonLd, type JsonLd as JsonLdDocument } from "@/content/json-ld";

/**
 * One `<script type="application/ld+json">` per document.
 *
 * The first version joined the documents with a newline into a single tag,
 * which produces a file whose content is `{...}\n{...}` — not valid JSON, and a
 * crawler parses it as one malformed block and discards the lot. Each document
 * has to be independently valid JSON in its own tag.
 *
 * `suppressHydrationWarning` is kept even though the dates now come from
 * `SITE.updated` rather than the clock: JSON-LD is machine-read only, and a
 * mismatch here cannot affect a human.
 */
export function JsonLd({ documents }: { documents: readonly JsonLdDocument[] }) {
  return (
    <>
      {documents.map((document, index) => (
        <script
          key={index}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(document) }}
        />
      ))}
    </>
  );
}
