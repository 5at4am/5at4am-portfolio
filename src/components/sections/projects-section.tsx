import { ProjectAccordion } from "@/components/ui/project-accordion";
import { Section } from "@/components/ui/section";
import { PROJECTS } from "@/content/projects";

/**
 * Projects as an accordion: all eight names visible at once, one expanded to its
 * full write-up.
 *
 * This replaced a scroll-driven card stack. The stack was cinematic but it spent
 * a very long scroll distance per project, blurred the card you were trying to
 * read, and had to be measured and re-tuned constantly to stay legible. The
 * accordion states the same information in a fraction of the height and needs no
 * scroll maths at all, which matters most on the phone.
 *
 * `ProjectAccordion` owns the interaction and the accessibility of the rows; this
 * stays pure composition, like every other section on the page.
 */
export function ProjectsSection() {
  return (
    <Section id="projects" title="Projects">
      <ProjectAccordion projects={PROJECTS} />
    </Section>
  );
}