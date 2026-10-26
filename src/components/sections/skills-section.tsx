import { Section, type SectionVariant } from "@/components/ui/section";
import { SkillsBento } from "@/components/ui/skills-bento";
import {
  TECH_STACK_GROUPS,
  TECH_STACK_HIGHLIGHT_IDS,
} from "@/content/tech-stack";

/**
 * The technologies promoted inside the AI group: orchestration and retrieval,
 * because those are what the production work actually runs on.
 */
const HIGHLIGHTS = new Set(TECH_STACK_HIGHLIGHT_IDS);

/**
 * Skill groups rendered as a hover-revealing bento grid (Aceternity-style)
 * with a spotlight effect, keeping the existing data and emphasis rules.
 */
export function SkillsSection({ variant }: { variant?: SectionVariant }) {
  return (
    <Section id="skills" title="Skills" variant={variant}>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Grouped by what they are used for, with AI and machine learning first
        because that is the work. No self-assessed levels — focus on the tools
        used to ship real projects.
      </p>
      <SkillsBento groups={TECH_STACK_GROUPS} highlightedIds={HIGHLIGHTS} />
    </Section>
  );
}