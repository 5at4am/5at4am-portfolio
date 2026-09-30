import { ExternalLink } from "@/components/ui/external-link";
import { SOCIAL_ICONS } from "@/components/ui/social-icons";
import { CONTACT_LINKS } from "@/content/contact";
import { cn } from "@/lib/utils";

export type ContactLinksProps = {
  /** Render the channel icon before each label. */
  showIcons?: boolean;
  className?: string;
};

/**
 * The list of contact channels, derived from `CONTACT_LINKS`. Shared by the
 * home contact section and the profile connect section so the channels are
 * defined once in `src/content/contact.ts`.
 */
export function ContactLinks({ showIcons = false, className }: ContactLinksProps) {
  return (
    <ul className={cn("mt-6 space-y-3 text-sm", className)}>
      {CONTACT_LINKS.map(({ label, href, icon }) => (
        <li key={href}>
          <ExternalLink href={href} icon={showIcons ? SOCIAL_ICONS[icon] : undefined}>
            {label}
          </ExternalLink>
        </li>
      ))}
    </ul>
  );
}
