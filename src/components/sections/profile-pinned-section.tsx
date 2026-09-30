import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/ui/section";
import { PINNED_REPOS } from "@/content/projects";
import type { PinnedRepo } from "@/content/types";

function RepoCard({ repo }: { repo: PinnedRepo }) {
  return (
    <a
      href={repo.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-sm border border-border bg-card p-4 transition-colors hover:border-foreground/40 focus-visible:border-foreground/40"
    >
      <span className="flex items-center gap-1.5 font-mono text-sm text-foreground">
        {repo.name}
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </span>
      <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {repo.description}
      </span>
      <span className="mt-4 flex items-center gap-2 font-mono text-xs text-muted-foreground">
        {/* Color is decorative; the language name carries the meaning. */}
        <span
          aria-hidden="true"
          className="size-2.5 rounded-xs"
          style={{ backgroundColor: repo.languageColor }}
        />
        {repo.language}
      </span>
    </a>
  );
}

/**
 * Condensed repository cards for the profile page. The home resume shows the
 * full write-ups in `ProjectsSection` instead.
 */
export function ProfilePinnedSection() {
  return (
    <Section id="pinned" title="Pinned" variant="terminal">
      <div className="grid gap-4 sm:grid-cols-2">
        {PINNED_REPOS.map((repo) => (
          <RepoCard key={repo.name} repo={repo} />
        ))}
      </div>
    </Section>
  );
}
