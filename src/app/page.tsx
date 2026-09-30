import { PageShell } from "@/components/layout/page-shell";
import { ContactBall } from "@/components/layout/contact-ball";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { AboutSection } from "@/components/sections/about-section";
import { AchievementsSection } from "@/components/sections/achievements-section";
import { ContactSection } from "@/components/sections/contact-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { homeMetadata } from "@/content/metadata";

export const metadata = homeMetadata;

/**
 * Resume home page. Pure composition — every block is a section component and
 * every string comes from `src/content`.
 *
 * Order is the resume reading order and matches `NAV_SECTIONS` (plus the hero,
 * which is deliberately not in the nav).
 *
 * `ContactBall` is last and outside `<main>`: it is a fixed overlay that floats
 * over all of it and can be dragged anywhere on screen, so it belongs to the
 * page rather than to any one section — most of all not to the contact
 * section, which carries the same three channels as an ordinary link list.
 */
export default function HomePage() {
  return (
    <PageShell header={<SiteHeader />} footer={<SiteFooter />}>
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <AchievementsSection />
      <ContactSection />
      <ContactBall />
    </PageShell>
  );
}
