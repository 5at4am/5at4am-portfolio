import { Section } from "@/components/ui/section";
import { ABOUT, EDUCATION } from "@/content/site";

export type AboutSectionProps = {
  /**
   * - `default` — resume page: education gets its own subheading and CGPA.
   * - `terminal` — profile page: education continues the bio as a paragraph,
   *   since the score already appears in the profile meta row.
   */
  variant?: "default" | "terminal";
};

/**
 * Bio and education. Shared by the home resume and the profile page; both read
 * from `ABOUT` / `EDUCATION` in the content layer.
 */
export function AboutSection({ variant = "default" }: AboutSectionProps) {
  return (
    <Section id="about" title="About" variant={variant}>
      {variant === "terminal" ? (
        <div className="max-w-2xl space-y-5">
          <p className="leading-relaxed text-muted-foreground">{ABOUT.bio}</p>
          <p className="leading-relaxed text-muted-foreground">
            <strong className="font-medium text-foreground">
              {EDUCATION.degree}
            </strong>
            , {EDUCATION.institution}, {EDUCATION.period.replace("-", " to ")}.
          </p>
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">
          <p className="leading-relaxed text-muted-foreground">{ABOUT.bio}</p>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Education</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">
                {EDUCATION.degree}
              </strong>
              , {EDUCATION.institution}, {EDUCATION.period}. {EDUCATION.score}.
            </p>
          </div>
        </div>
      )}
    </Section>
  );
}
