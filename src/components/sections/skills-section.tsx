import { SkillsIndex } from "@/components/sections/skills-index";
import { Section, type SectionVariant } from "@/components/ui/section";
import {
  TECH_STACK_GROUPS,
  TECH_STACK_HIGHLIGHT_IDS,
} from "@/content/tech-stack";

/**
 * The technologies promoted inside the AI group: orchestration and retrieval,
 * because those are what the production work actually runs on. They stay in the
 * group's own list, marked rather than moved. Pulling them out into a separate
 * band, as the previous tile grid did, split the AI group in half and stranded
 * three items under an unrelated category heading.
 */
const HIGHLIGHTS = new Set(TECH_STACK_HIGHLIGHT_IDS);

/**
 * Skill groups. Rendered on both the home resume and the profile page from the
 * same `TECH_STACK_GROUPS` data, which remains the single source of truth: the
 * ordering, the categories and the icons are all read from there, so adding a
 * technology is a one-line data change. The array is already ordered AI first.
 *
 * Laid out as a typographic index rather than a tile grid. Research on how
 * portfolios are actually read puts a recruiter on this section for a few
 * seconds, and the references are unanimous that it should be scannable, grouped,
 * and never quantified. Thirty-eight bordered tiles spent a lot of visual weight
 * on conveying a list; this spends none, and reads as part of the same site as the
 * notch and the hero rather than as a borrowed component.
 */
export function SkillsSection({ variant }: { variant?: SectionVariant }) {
  return (
    <Section id="skills" title="Skills" variant={variant}>
      <p className="mb-10 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Grouped by what they are used for, with AI and machine learning first
        because that is the work. No self-assessed levels, since a percentage
        like &ldquo;Python 90%&rdquo; is unmeasurable and means nothing to a
        reader. The tools the production work runs on are the ones drawn at full
        contrast in the first group.
      </p>
      <SkillsIndex groups={TECH_STACK_GROUPS} highlightedIds={HIGHLIGHTS} />
    </Section>
  );
}