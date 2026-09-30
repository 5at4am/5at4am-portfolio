import type { SocialLink } from "./types";

/**
 * Single definition of the contact channels. Consumed by the home contact
 * section, the profile connect section, and the header icon rail — so a new
 * channel only has to be added once.
 */
export const CONTACT_LINKS: readonly SocialLink[] = [
  {
    label: "satraj6465@gmail.com",
    short: "Email",
    href: "mailto:satraj6465@gmail.com",
    external: false,
    icon: "mail",
  },
  {
    label: "linkedin.com/in/satyamraj001",
    short: "LinkedIn",
    href: "https://linkedin.com/in/satyamraj001",
    external: true,
    icon: "linkedin",
  },
  {
    label: "github.com/5at4am",
    short: "GitHub",
    href: "https://github.com/5at4am",
    external: true,
    icon: "github",
  },
];
