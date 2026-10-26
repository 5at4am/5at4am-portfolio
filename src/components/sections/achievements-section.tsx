import { AchievementsBento } from "@/components/ui/achievements-bento";
import { Section, type SectionVariant } from "@/components/ui/section";
import { AWARDS } from "@/content/achievements";

/**
 * Awards, hackathon results, and certifications as an issuer-grouped bento:
 * the top result is a wide feature, multi-credential programmes take more room,
 * and a summary band closes with the counts.
 */
export function AchievementsSection({ variant }: { variant?: SectionVariant }) {
  return (
    <Section
      id="achievements"
      title="Achievements and Certifications"
      variant={variant}
    >
      <AchievementsBento awards={AWARDS} />
    </Section>
  );
}
