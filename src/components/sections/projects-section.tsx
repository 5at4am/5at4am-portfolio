import { ProjectFocusCards } from "@/components/ui/project-focus-cards";
import { Section } from "@/components/ui/section";
import { PROJECTS } from "@/content/projects";

/**
 * Projects as focus cards: hover/focus brings one card to the front while
 * others recede. Keeps all eight projects visible at a glance with stack and
 * links on the focused card.
 */
export function ProjectsSection() {
  return (
    <Section id="projects" title="Projects">
      <ProjectFocusCards projects={PROJECTS} />
    </Section>
  );
}