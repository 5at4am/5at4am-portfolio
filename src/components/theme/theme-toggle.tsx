"use client";

import { Around } from "@/components/ui/around";
import { useThemeToggle } from "@/components/ui/skiper-ui/skiper26";
import { cn } from "@/lib/utils";

export type ThemeToggleProps = {
  className?: string;
  /**
   * `inverted` inverts the surface so it reads on a dark bar: foreground disc,
   * background glyph.
   */
  tone?: "default" | "inverted";
};

/**
 * Light / dark switch.
 *
 * **Two halves, kept deliberately apart.** The full-page theme-change animation
 * comes from `useThemeToggle` in `skiper26` and is used unmodified: the
 * circular `document.startViewTransition` wipe (`variant="circle-blur"`,
 * blur on, `start="top-right"`) and the `next-themes` wiring behind it. The
 * button face is `Around` from the toggles.dev registry — a CSS-driven sun that
 * morphs into a moon clipped out of the same disc, with the rays popping out.
 * Only the button changes; the transition and the styling do not.
 *
 * **Dark-state binding.** `Around` is deliberately *uncontrolled*: its icon is
 * CSS-only (`dark:` variants), so it follows the `dark` class that the site's
 * `next-themes` provider applies to `<html>` — no mirrored state, no hydration
 * mismatch, and the morph stays perfectly in step with the class flip that the
 * view transition performs. Clicking runs `toggleTheme`, which wraps the
 * `next-themes` swap in `document.startViewTransition`.
 *
 * **View transitions.** `document.startViewTransition` is feature-detected in
 * `useThemeToggle`; browsers without it swap the theme immediately down the same
 * path. The wipe CSS is injected once into a `<style id="theme-transition-styles">`
 * in `<head>` and rewritten on each toggle.
 *
 * **Sizing / styling.** The chip surface (glass, border, shadows) is supplied by
 * the caller's `className`, so the toggle can float over any background. The
 * unit-square 32×32 `<svg>` is pinned to 24px via `[&_svg]:size-6`.
 */
export function ThemeToggle({ className, tone = "default" }: ThemeToggleProps) {
  const { toggleTheme } = useThemeToggle({
    variant: "circle-blur",
    blur: true,
    start: "top-right",
  });

  return (
    <Around
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full p-0 [&_svg]:size-6",
        tone === "inverted"
          ? "!bg-foreground !text-background dark:!bg-white dark:!text-zinc-950"
          : "border border-black/10 dark:border-white/20",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        className
      )}
    />
  );
}