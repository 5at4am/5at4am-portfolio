import { CONTACT_LINKS } from "./contact";
import type { NavSection } from "./types";

/**
 * Anchor sections of the home page, in document order.
 *
 * The header scroll-spy and the section components both derive from this list,
 * so adding a section here is enough to wire it into the nav — as long as the
 * matching `<section id>` is rendered on the page.
 */
export const NAV_SECTIONS: readonly NavSection[] = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "contact", label: "Contact" },
];

/** Offset in px used when deciding which section is under the sticky header. */
export const SCROLL_OFFSET = 96;

/** Icon rail shown in the header (desktop) and the mobile panel. */
export const HEADER_SOCIALS = CONTACT_LINKS;
