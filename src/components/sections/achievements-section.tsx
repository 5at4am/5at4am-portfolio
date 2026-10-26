import { Section, type SectionVariant } from "@/components/ui/section";
import { AchievementsGrid } from "@/components/ui/achievements-grid";
import { AWARDS } from "@/content/achievements";

/**
 * Awards, hackathon results, and certifications. Rendered as a spotlight grid
 * with combined Aceternity-style hover effects.
 */
export function AchievementsSection({ variant }: { variant?: SectionVariant }) {
  return (
    <Section
      id="achievements"
      title="Achievements and Certifications"
      variant={variant}
    >
      <AchievementsGrid awards={AWARDS} />
    </Section>
  );
}
