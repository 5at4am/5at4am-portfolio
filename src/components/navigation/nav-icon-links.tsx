"use client";

import { User } from "lucide-react";
import Link from "next/link";

import { SOCIAL_ICONS } from "@/components/ui/social-icons";
import { HEADER_SOCIALS } from "@/content/navigation";
import { cn } from "@/lib/utils";

const ICON_BUTTON =
  "flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground";

/**
 * Compact circle for the floating pill bar: text fills with the bar's ink
 * (`foreground`), and hover/focus use a translucent wash plus the same ink
 * instead of `hover:bg-accent`.
 */
const ICON_BUTTON_INVERTED =
  "flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:bg-foreground/10 focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:text-zinc-100/70 dark:hover:bg-white/10 dark:hover:text-zinc-100 dark:focus-visible:bg-white/10 dark:focus-visible:text-zinc-100 dark:focus-visible:outline-zinc-100";

export type NavIconLinksProps = {
  /** Called after a link is activated, so the mobile panel can close itself. */
  onNavigate?: () => void;
  className?: string;
  /** `inverted` for the floating pill bar (light capsule / dark glass). */
  variant?: "default" | "inverted";
};

/**
 * The header's right-hand icon rail: a link to the profile page followed by
 * the social channels.
 *
 * Rendered twice — inline on desktop and inside the mobile panel — so the
 * markup and the icon-label pairs live here exactly once.
 */
export function NavIconLinks({
  onNavigate,
  className,
  variant = "default",
}: NavIconLinksProps) {
  const buttonClass = variant === "inverted" ? ICON_BUTTON_INVERTED : ICON_BUTTON;
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      <li>
        <Link href="/profile" className={buttonClass} onClick={onNavigate}>
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
              className={buttonClass}
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
