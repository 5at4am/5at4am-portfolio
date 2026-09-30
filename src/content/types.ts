/**
 * Shared shapes for all resume/site content.
 *
 * Content modules under `src/content` are plain data, typed here so a typo in
 * one field surfaces at compile time rather than as an `undefined` in the DOM.
 */

export type SocialIconKey = "mail" | "linkedin" | "github";

export type SocialLink = {
  /** Accessible name. Also the tooltip/screen-reader label. */
  label: string;
  href: string;
  /** `false` for `mailto:` links, `true` for anything that leaves the site. */
  external: boolean;
  icon: SocialIconKey;
};

export type NavSection = {
  /** Must match the `id` of the corresponding `<section>` on the page. */
  id: string;
  label: string;
};

export type ExperienceItem = {
  role: string;
  org: string;
  /** Free-form date range, e.g. "May 2026 to Present, Remote". */
  meta: string;
  bullets: readonly string[];
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  name: string;
  tagline: string;
  bullets: readonly string[];
  stack: readonly string[];
  links: readonly ProjectLink[];
};

/** A repository card for the GitHub-style profile page. */
export type PinnedRepo = {
  name: string;
  description: string;
  language: string;
  /** Any CSS color; GitHub's language dot colors. */
  languageColor: string;
  href: string;
};

export type SkillGroup = {
  group: string;
  items: readonly string[];
};

export type Award = {
  title: string;
  org: string;
};

export type Education = {
  degree: string;
  institution: string;
  /** Graduation window, e.g. "2023 to 2027". */
  period: string;
  score: string;
};

/** A short label and its value, for dense at-a-glance grids. */
export type LabeledFact = {
  label: string;
  value: string;
};

/** A named piece of work with one outbound link, e.g. a repository. */
export type WorkLink = {
  name: string;
  /** One line on what it is. */
  detail: string;
  href: string;
};
