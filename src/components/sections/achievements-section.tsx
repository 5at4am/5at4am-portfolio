import { Section, type SectionVariant } from "@/components/ui/section";
import { AWARDS } from "@/content/achievements";

/**
 * Awards, hackathon results, and certifications. Rendered on both the home
 * resume and the profile page from the same `AWARDS` data.
 */
export function AchievementsSection({ variant }: { variant?: SectionVariant }) {
  return (
    <Section
      id="achievements"
      title="Achievements and Certifications"
      variant={variant}
    >
      <ul className="space-y-5">
        {AWARDS.map((award) => (
          <li key={award.title} className="border-l-2 border-border pl-4">
            <p className="font-medium text-foreground">{award.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{award.org}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
