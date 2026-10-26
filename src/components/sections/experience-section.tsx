import { Section, type SectionVariant } from "@/components/ui/section";
import { ExperienceCards } from "@/components/ui/experience-cards";
import { EXPERIENCE } from "@/content/experience";

/**
 * Internship history rendered as spotlight cards combining timeline-style
 * outcome highlights with stack and bullets.
 */
export function ExperienceSection({
  variant,
}: {
  variant?: SectionVariant;
}) {
  return (
    <Section id="experience" title="Experience" variant={variant}>
      <ExperienceCards items={EXPERIENCE} />
    </Section>
  );
}