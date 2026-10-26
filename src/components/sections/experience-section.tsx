import { Section, type SectionVariant } from "@/components/ui/section";
import { ExperienceTimelineBeam } from "@/components/ui/experience-timeline-beam";
import { EXPERIENCE } from "@/content/experience";

/**
 * Internship history as a scroll-beam timeline: sticky start dates on a rail
 * whose fill follows the reader, with a Bencho edge light on each role card.
 */
export function ExperienceSection({
  variant,
}: {
  variant?: SectionVariant;
}) {
  return (
    <Section id="experience" title="Experience" variant={variant}>
      <ExperienceTimelineBeam items={EXPERIENCE} />
    </Section>
  );
}