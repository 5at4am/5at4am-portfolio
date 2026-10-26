import { Section, type SectionVariant } from "@/components/ui/section";
import { ExperienceTimelineAceternity } from "@/components/ui/experience-timeline-aceternity";
import { EXPERIENCE } from "@/content/experience";

/**
 * Internship history rendered with Aceternity-style timeline.
 */
export function ExperienceSection({
  variant,
}: {
  variant?: SectionVariant;
}) {
  return (
    <Section id="experience" title="Experience" variant={variant}>
      <ExperienceTimelineAceternity items={EXPERIENCE} />
    </Section>
  );
}