import { BulletList } from "@/components/ui/bullet-list";
import { ExternalLink } from "@/components/ui/external-link";
import { Section } from "@/components/ui/section";
import { TagList } from "@/components/ui/tag-list";
import { PROJECTS } from "@/content/projects";
import type { Project } from "@/content/types";

function ProjectEntry({ project }: { project: Project }) {
  return (
    <article>
      <h3 className="text-lg font-medium text-foreground">{project.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{project.tagline}</p>
      <BulletList items={project.bullets} />
      <TagList items={project.stack} label={`${project.name} stack`} />
      <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {project.links.map((link) => (
          <ExternalLink key={link.href} href={link.href}>
            {link.label}
          </ExternalLink>
        ))}
      </p>
    </article>
  );
}

/**
 * Long-form project write-ups on the home resume. The profile page shows a
 * condensed variant via `ProfilePinnedSection`.
 */
export function ProjectsSection() {
  return (
    <Section id="projects" title="Projects">
      <div className="space-y-10">
        {PROJECTS.map((project) => (
          <ProjectEntry key={project.name} project={project} />
        ))}
      </div>
    </Section>
  );
}
