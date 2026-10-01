import { ContactBall } from "@/components/layout/contact-ball";
import { PageShell } from "@/components/layout/page-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { AboutSection } from "@/components/sections/about-section";
import { AchievementsSection } from "@/components/sections/achievements-section";
import { ContactSection } from "@/components/sections/contact-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { WordsPreloader } from "@/components/ui/words-preloader";
import { homeMetadata } from "@/content/metadata";

export const metadata = homeMetadata;

/**
 * Resume home page. Pure composition — every block is a section component and
 * every string comes from `src/content`.
 *
 * Order is the resume reading order and matches `NAV_SECTIONS` (plus the hero,
 * which is deliberately not in the nav).
 *
 * `ContactBall` is passed as `overlay`, not as a child. It is a fixed
 * layer over the whole page and can be dragged anywhere, and the curtain
 * transform on `<main>` would otherwise make `<main>` its containing block —
 * a `fixed` element inside a transformed ancestor stops being viewport-relative
 * and scrolls off with the page. It is also genuinely page chrome rather than
 * section content: the contact section carries the same three channels as an
 * ordinary link list.
 */
export default function HomePage() {
  return (
    <PageShell
      header={<SiteHeader />}
      footer={<SiteFooter />}
      overlay={
        <>
          {/*
            The preloader goes here, NOT among the children below, and not in the
            root layout either — it is the home page's introduction and only the
            home page's, but it must render outside `<main>`.

            The preloader is `position: fixed`, and the curtain puts a transform
            on `<main>`. A transformed element becomes the containing block for
            its fixed descendants, so a preloader mounted inside `<main>` is
            positioned against `<main>` rather than the viewport. Measured on the
            real page: its box came out 8206px tall and offset 48px down,
            matching `<main>` exactly. It covered only the first viewport of an
            eight-screen document, so the words animated down there where
            nothing was looking, and the counter, progress bar and Skip button
            rendered at the bottom of the *document* instead of the bottom of
            the screen. Same trap `PageShell.overlay` documents for
            `ContactBall`; this is that prop doing its second job.
          */}
          <WordsPreloader />
          <ContactBall />
        </>
      }
    >
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <AchievementsSection />
      <ContactSection />
    </PageShell>
  );
}
