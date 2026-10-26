import { Section, type SectionVariant } from "@/components/ui/section";
import { AchievementsTimelineAceternity } from "@/components/ui/achievements-timeline-aceternity";
import { AWARDS } from "@/content/achievements";

/**
 * Awards, hackathon results, and certifications. Rendered with Aceternity-style timeline.
 */
export function AchievementsSection({ variant }: { variant?: SectionVariant }) {
  return (
    <Section
      id="achievements"
      title="Achievements and Certifications"
      variant={variant}
    >
      <AchievementsTimelineAceternity awards={AWARDS} />
    </Section>
  );
}
