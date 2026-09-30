"use client";

import { User } from "lucide-react";
import Link from "next/link";

import { SOCIAL_ICONS } from "@/components/ui/social-icons";
import { HEADER_SOCIALS } from "@/content/navigation";
import { cn } from "@/lib/utils";

const ICON_BUTTON =
  "flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground";

export type NavIconLinksProps = {
  /** Called after a link is activated, so the mobile panel can close itself. */
  onNavigate?: () => void;
  className?: string;
};

/**
 * The header's right-hand icon rail: a link to the profile page followed by
 * the social channels.
 *
 * Rendered twice — inline on desktop and inside the mobile panel — so the
 * markup and the icon-label pairs live here exactly once.
 */
export function NavIconLinks({ onNavigate, className }: NavIconLinksProps) {
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      <li>
        <Link href="/profile" className={ICON_BUTTON} onClick={onNavigate}>
          <span className="sr-only">GitHub style profile</span>
          <User aria-hidden="true" className="size-4" />
        </Link>
      </li>
      {HEADER_SOCIALS.map(({ label, href, icon, external }) => {
        const Icon = SOCIAL_ICONS[icon];
        return (
          <li key={label}>
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className={ICON_BUTTON}
              onClick={onNavigate}
            >
              <span className="sr-only">{label}</span>
              <Icon aria-hidden="true" className="size-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
