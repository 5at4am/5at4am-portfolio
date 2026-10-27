import { PageShell } from "@/components/layout/page-shell";
import { PaperHeader } from "@/components/layout/paper-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { ConnectThreeDPaper } from "@/components/three-d-paper/connect-three-d-paper";
import { ExternalLink } from "@/components/ui/external-link";
import { paperJsonLd } from "@/content/json-ld";
import { paperMetadata } from "@/content/metadata";
import { PAPER_CREDIT } from "@/content/paper";

export const metadata = paperMetadata;

/**
 * The certificate as a standalone interactive 3D paper document.
 *
 * The copy lives nowhere else: the certificate strip was dropped from the home
 * page and this route is the only place the Estrel capstone paper renders. The
 * paper is lazy-mounting, so the Three.js bundle is only fetched once the frame
 * is near the viewport.
 */
export default function PaperPage() {
  return (
    <PageShell header={<PaperHeader />} footer={<SiteFooter />}>
      {/*
        The paper route describes its own page and breadcrumb. It deliberately
        does not inherit the home ProfilePage or work-history ItemList.
      */}
      <JsonLd documents={paperJsonLd()} />
      <section
        /* Named by the heading below, so this becomes a real `region` landmark.
           It was an unnamed `<section>` before, which means it was not exposed as
           a landmark at all. */
        aria-labelledby="paper-heading"
        className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-16 sm:px-6 sm:py-20"
      >
        {/*
          This route shipped with zero `<h1>`, `<h2>` and `<h3>` — verified in the
          built HTML. The only title-ish string was a `<p>` in the header, and the
          certificate's own text is painted with `ctx.fillText` onto a canvas
          inside the iframe, so the route's substantive content existed only as
          pixels with no text alternative at all.

          The heading is visually hidden rather than shown because the document
          itself is the hero and a caption above it would compete with it. It is
          still a real `h1` in the outline, so the page has a document title for
          assistive tech and for the heading outline.
        */}
        <h1 id="paper-heading" className="sr-only">
          3D paper certificate for the Estrel.ai capstone
        </h1>

        <ConnectThreeDPaper variant="estrel" className="aspect-[4/5] w-full max-w-2xl" />

        {/*
          The text alternative for the canvas. The certificate is drawn rather
          than typeset, so nothing inside the iframe is selectable or readable by
          a screen reader; this says what it is, and the credit line below it
          keeps the attribution visible either way.
        */}
        <p className="max-w-2xl text-center text-sm text-muted-foreground">
          An interactive translucent 3D paper certificate, drawn on canvas. Drag to
          turn it and hover to light it.
        </p>

        <p className="text-sm text-muted-foreground">
          {PAPER_CREDIT.text}{" "}
          <ExternalLink href={PAPER_CREDIT.href}>{PAPER_CREDIT.label}</ExternalLink>
        </p>
      </section>
    </PageShell>
  );
}