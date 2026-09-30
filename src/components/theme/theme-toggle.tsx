"use client";

import { ThemeToggleButton2 } from "@/components/ui/skiper-ui/skiper4";
import { useThemeToggle } from "@/components/ui/skiper-ui/skiper26";
import { cn } from "@/lib/utils";

export type ThemeToggleProps = {
  className?: string;
};

/**
 * Light / dark switch.
 *
 * **Two halves, kept deliberately apart.** The full-page theme-change animation
 * comes from `useThemeToggle` in `skiper26` and is used unmodified: the
 * circular `document.startViewTransition` wipe (`variant="circle-blur"`,
 * `start="center"`) and the `next-themes` wiring behind it. The button face is
 * `ThemeToggleButton2` from `skiper4` — the sun disc that slides into a
 * clip-path moon — replacing the split sun/moon icon the `skiper26` button
 * shared with `ThemeToggleButton1`. Only the button changes; the transition and
 * the styling do not.
 *
 * **Binding.** `ThemeToggleButton2` accepts a controlled `isDark` plus an
 * `onToggle` callback, so it drives the reveal instead of its own local state.
 * `isDark` comes from `resolvedTheme`, which is `undefined` on the server and
 * on the hydration render, so the light icon paints first and React never
 * reports a mismatch. `next-themes`' blocking script has already applied the
 * correct palette by then, so the settle is not visible.
 *
 * **View transitions.** `document.startViewTransition` is feature-detected in
 * `useThemeToggle`; browsers without it swap the theme immediately down the same
 * path. The wipe CSS is injected once into a `<style id="theme-transition-styles">`
 * in `<head>` and rewritten on each toggle.
 *
 * **Sizing / styling.** The button keeps the same classes the previous toggle
 * used: 32px box, `[&_svg]:size-full` pins the unit-square `<svg>` to the box,
 * and the border separates the disc from the near-black header in dark mode.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useThemeToggle({
    variant: "circle-blur",
    start: "center",
  });

  return (
    <ThemeToggleButton2
      isDark={isDark}
      onToggle={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "size-8 p-0",
        "[&_svg]:size-full",
        "border border-black/10 dark:border-white/20",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        className
      )}
    />
  );
}