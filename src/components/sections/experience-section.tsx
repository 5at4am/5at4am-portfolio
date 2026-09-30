import { BulletList } from "@/components/ui/bullet-list";
import { Section, type SectionVariant } from "@/components/ui/section";
import { EXPERIENCE } from "@/content/experience";
import type { ExperienceItem } from "@/content/types";

function ExperienceEntry({ item }: { item: ExperienceItem }) {
  return (
    <article>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-lg font-medium text-foreground">{item.role}</h3>
        <p className="text-sm text-muted-foreground">{item.org}</p>
      </div>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{item.meta}</p>
      <BulletList items={item.bullets} />
    </article>
  );
}

/**
 * Internship history, most recent first. Rendered on both the home resume and
 * the profile page from the same `EXPERIENCE` data.
 */
export function ExperienceSection({
  variant,
}: {
  variant?: SectionVariant;
}) {
  return (
    <Section id="experience" title="Experience" variant={variant}>
      <div className="space-y-10">
        {EXPERIENCE.map((item) => (
          <ExperienceEntry key={item.role} item={item} />
        ))}
      </div>
    </Section>
  );
}
