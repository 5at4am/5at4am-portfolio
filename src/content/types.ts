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
  /**
   * The channel's own name, for places that cannot fit `label`. `label` is a
   * full address because it has to be readable and copyable on its own; a
   * 48px menu button caption is not that place, and truncating the address
   * into it would produce "satraj6465…". Optional so a new channel still
   * compiles without one.
   */
  short?: string;
};

export type NavSection = {
  /** Must match the `id` of the corresponding `<section>` on the page. */
  id: string;
  label: string;
};

/**
 * A month, as `YYYY-MM`. Strings rather than `Date` on purpose: these are
 * authored in content and never mutated, and a `Date` would invite timezone
 * arithmetic that a calendar month does not have. Month 0 is January.
 */
export type MonthKey = `${number}-${number}`;

export type ExperienceItem = {
  role: string;
  org: string;
  /** Free-form date range, e.g. "May 2026 to Present, Remote". */
  meta: string;
  /**
   * Machine-readable span, used to place this role on the timeline rail. Kept
   * separate from `meta` so the prose stays editable on its own terms and the
   * geometry is derived rather than parsed back out of a sentence.
   *
   * `end` is `null` for a current role. The rail resolves that to the present
   * month at render, which is why the timeline is a client component: the span
   * has to stay correct without a rebuild.
   */
  start: MonthKey;
  end: MonthKey | null;
  /**
   * One line, pulled out of the bullets and given the emphasis the bullets do
   * not. The strongest fact in the role — a number, a named technique, or the
   * result — not a summary of the summary.
   */
  outcome: string;
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
  /**
   * When it was issued or won, e.g. `"2026"` or `"Dec 2025"`. Optional because
   * a few recognitions have no reliably stated date, and a guessed date on a
   * credential is worse than none.
   */
  date?: string;
  /**
   * `team` marks a recognition that belonged to a group rather than to one
   * person. Those are worded as team awards on the page, because the public
   * record only supports the team's result. `personal` is a credential or an
   * award naming you. Omitted where it has not been established either way.
   */
  scope?: "personal" | "team";
  /** Public credential id, where the issuer exposes one. */
  credentialId?: string;
  href?: string;
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
