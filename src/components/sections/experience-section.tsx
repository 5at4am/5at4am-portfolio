import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { Section, type SectionVariant } from "@/components/ui/section";
import { EXPERIENCE } from "@/content/experience";

/**
 * Internship history, most recent first in the data and oldest first on the
 * rail, which is the direction a timeline reads. Rendered on both the home
 * resume and the profile page from the same `EXPERIENCE` data.
 */
export function ExperienceSection({
  variant,
}: {
  variant?: SectionVariant;
}) {
  return (
    <Section id="experience" title="Experience" variant={variant}>
      <ExperienceTimeline items={EXPERIENCE} />
    </Section>
  );
}