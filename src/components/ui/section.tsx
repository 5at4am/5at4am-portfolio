import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const sectionVariants = cva("border-t border-border", {
  variants: {
    variant: {
      /** Resume page: generous rhythm, muted uppercase eyebrow heading. */
      default: "py-16 sm:py-20",
      /** Profile page: tighter rhythm, terminal-style `// heading`. */
      terminal: "py-14 sm:py-16",
    },
  },
  defaultVariants: { variant: "default" },
});

const headingVariants = cva("text-sm font-semibold", {
  variants: {
    variant: {
      default:
        "uppercase tracking-[0.18em] text-muted-foreground",
      terminal: "flex items-center gap-2 text-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

const bodyVariants = cva("", {
  variants: {
    variant: {
      default: "mt-8",
      terminal: "mt-7",
    },
  },
  defaultVariants: { variant: "default" },
});

/** `default` is the resume treatment; `terminal` is the profile treatment. */
export type SectionVariant = "default" | "terminal";

export type SectionProps = {
  /** Anchor target. Must match a `NAV_SECTIONS` id to be linked in the nav. */
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
} & VariantProps<typeof sectionVariants>;

/**
 * Shared section shell: anchor id, top border, eyebrow heading, and content
 * gutter. Used by every section on both the resume and the profile page so the
 * vertical rhythm stays consistent.
 *
 * @example
 * <Section id="about" title="About">
 *   <AboutBody />
 * </Section>
 */
export function Section({
  id,
  title,
  children,
  className,
  variant,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20",
        sectionVariants({ variant }),
        className
      )}
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <h2 className={headingVariants({ variant })}>
          {variant === "terminal" ? (
            <span aria-hidden="true" className="font-mono text-muted-foreground">
              {"//"}
            </span>
          ) : null}
          {title}
        </h2>
        <div className={bodyVariants({ variant })}>{children}</div>
      </div>
    </section>
  );
}
