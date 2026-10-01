import type { ComponentType, ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

/** Any component that renders an `<svg>` — lucide icons and brand icons both fit. */
export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type ExternalLinkProps = {
  href: string;
  children: ReactNode;
  /** Rendered before the label, for the icon-led contact list. */
  icon?: IconComponent;
  className?: string;
  /**
   * `onDark` is for links sitting on a dark-glass surface (the project stack
   * cards). It exists because `text-foreground` is a near-black ink in the light
   * theme, and a descendant override from the parent cannot beat it: the class
   * lands on the `<a>` itself, so `[&_a]:text-zinc-100` on an ancestor loses the
   * specificity fight and the link renders dark ink on a dark card. The tone has
   * to be stated where the class is applied.
   */
  tone?: "default" | "onDark";
};

/**
 * Text link with the Skiper UI `skiper40` `Link001` underline effect.
 *
 * The underline is a `::before` that sits at `scale-x-0` and grows from the
 * left over 300ms (`cubic-bezier(0.4,0,0.2,1)`) on hover — and, unlike the
 * upstream demo, also on `focus-visible` so keyboard users get the same cue as
 * pointer users. The little diagonal arrow is revealed by the same gesture.
 * Both are the exact class strings from the registry source; `motion-reduce`
 * neutralises the transitions, matching the rest of the app.
 *
 * Focus is not left to the browser default: `outline-2` + `outline-foreground`
 * matches the header and theme-toggle controls.
 *
 * `rel="noopener noreferrer"` is applied automatically to external targets so a
 * linked page cannot reach back through `window.opener`. `mailto:` links stay
 * in the same tab.
 */
export function ExternalLink({
  href,
  children,
  icon: Icon,
  className,
  tone = "default",
}: ExternalLinkProps) {
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "group relative inline-flex items-center rounded-sm",
        tone === "onDark" ? "text-zinc-100" : "text-foreground",
        Icon && "gap-2.5",
        "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] before:motion-reduce:transition-none",
        "hover:before:origin-left hover:before:scale-x-100",
        "focus-visible:before:origin-left focus-visible:before:scale-x-100",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current",
        className
      )}
    >
      {Icon ? (
        <Icon
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0",
            tone === "onDark" ? "text-zinc-300" : "text-muted-foreground"
          )}
        />
      ) : null}
      {children}
      <svg
        aria-hidden="true"
        className="ml-[0.3em] size-[0.55em] translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
        fill="none"
        viewBox="0 0 10 10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}