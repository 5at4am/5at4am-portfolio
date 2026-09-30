import { PageShell } from "@/components/layout/page-shell";
import { ProfileHeader } from "@/components/layout/profile-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AboutSection } from "@/components/sections/about-section";
import { AchievementsSection } from "@/components/sections/achievements-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { ProfileConnectSection } from "@/components/sections/profile-connect-section";
import { ProfileIdentity } from "@/components/sections/profile-identity";
import { ProfilePinnedSection } from "@/components/sections/profile-pinned-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { profileMetadata } from "@/content/metadata";

export const metadata = profileMetadata;

/**
 * GitHub-style profile page. Reuses the same section components as the home
 * page — the experience, skills, and achievements blocks are identical because
 * they read from the shared content layer.
 */
export default function ProfilePage() {
  return (
    <PageShell header={<ProfileHeader />} footer={<SiteFooter />}>
      <ProfileIdentity />
      <ProfilePinnedSection />
      <AboutSection variant="terminal" />
      <ExperienceSection variant="terminal" />
      <SkillsSection variant="terminal" />
      <AchievementsSection variant="terminal" />
      <ProfileConnectSection />
    </PageShell>
  );
}
