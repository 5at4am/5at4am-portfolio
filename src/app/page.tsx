import { PageShell } from "@/components/layout/page-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { AboutSection } from "@/components/sections/about-section";
import { AchievementsSection } from "@/components/sections/achievements-section";
import { ContactSection } from "@/components/sections/contact-section";
import { CredentialsSection } from "@/components/sections/credentials-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { StorySection } from "@/components/sections/story-section";
import { homeMetadata } from "@/content/metadata";

export const metadata = homeMetadata;

/**
 * Resume home page. Pure composition — every block is a section component and
 * every string comes from `src/content`.
 *
 * Order matters in two places: `StorySection` is the full-bleed scroll-story band
 * that breaks up the projects → skills run of dense text, so it has to stay
 * between those two. `CredentialsSection` is the proof-of-work recap of the
 * papers the reader has just finished reading, so it sits after achievements
 * and leads into the contact CTA. The rest of the order is the resume reading
 * order and matches `NAV_SECTIONS` (plus the hero and the credentials band,
 * which are deliberately not in the nav).
 */
export default function HomePage() {
  return (
    <PageShell header={<SiteHeader />} footer={<SiteFooter />}>
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <StorySection />
      <SkillsSection />
      <AchievementsSection />
      <CredentialsSection />
      <ContactSection />
    </PageShell>
  );
}
