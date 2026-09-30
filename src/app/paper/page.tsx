import { PageShell } from "@/components/layout/page-shell";
import { PaperHeader } from "@/components/layout/paper-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ConnectThreeDPaper } from "@/components/three-d-paper/connect-three-d-paper";
import { ExternalLink } from "@/components/ui/external-link";
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
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-16 sm:px-6 sm:py-20">
        <ConnectThreeDPaper variant="estrel" className="aspect-[4/5] w-full max-w-2xl" />
        <p className="text-sm text-muted-foreground">
          {PAPER_CREDIT.text}{" "}
          <ExternalLink href={PAPER_CREDIT.href}>{PAPER_CREDIT.label}</ExternalLink>
        </p>
      </section>
    </PageShell>
  );
}