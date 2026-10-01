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
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-medium text-foreground">{award.title}</p>
              {award.date ? (
                <p className="font-mono text-xs text-muted-foreground">
                  {award.date}
                </p>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {award.scope === "team" ? (
                <span className="font-mono text-xs uppercase tracking-[0.14em]">
                  Team award.{" "}
                </span>
              ) : null}
              {award.org}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
