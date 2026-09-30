import { Section, type SectionVariant } from "@/components/ui/section";
import { StaggeredGrid, type BentoItem, type StaggeredGridItem } from "@/components/ui/staggered-grid";
import { TechIcon } from "@/components/ui/tech-icons";
import {
  TECH_STACK_GROUPS,
  TECH_STACK_HIGHLIGHT_IDS,
} from "@/content/tech-stack";

/** The three AI/ML tools that get the expanding bento treatment. */
const HIGHLIGHTS = new Set(TECH_STACK_HIGHLIGHT_IDS);

/** Attribution for the reused component, kept to a single muted line. */
const GRID_CREDIT = {
  text: "Staggered grid: VengeanceUI",
  href: "https://www.vengenceui.com/",
};

/** Every technology that is not one of the bento highlights. */
const TILES: StaggeredGridItem[] = TECH_STACK_GROUPS.flatMap((group) =>
  group.items
    .filter((tech) => !HIGHLIGHTS.has(tech.id))
    .map((tech) => ({
      id: tech.id,
      label: tech.name,
      caption: group.label,
      icon: <TechIcon name={tech.icon} />,
    }))
);

/** The highlight technologies, in dataset order. */
const BENTO_ITEMS: BentoItem[] = TECH_STACK_GROUPS.flatMap((group) =>
  group.items
    .filter((tech) => HIGHLIGHTS.has(tech.id))
    .map((tech) => ({
      id: tech.id,
      title: tech.name,
      subtitle: group.label,
      description: "",
      icon: <TechIcon name={tech.icon} />,
    }))
);

/**
 * Skill groups. Rendered on both the home resume and the profile page from the
 * same `TECH_STACK_GROUPS` data.
 */
export function SkillsSection({ variant }: { variant?: SectionVariant }) {
  return (
    <Section id="skills" title="Skills" variant={variant}>
      <ul className="mb-10 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {TECH_STACK_GROUPS.map((group, index) => (
          <li key={group.id} className="flex items-center gap-3">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {group.short}
          </li>
        ))}
      </ul>
      <StaggeredGrid
        centerText="Tech stack"
        items={TILES}
        bentoItems={BENTO_ITEMS}
        credit={GRID_CREDIT}
      />
    </Section>
  );
}
