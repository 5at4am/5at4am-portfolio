"use client";

import { Around } from "@/components/ui/around";
import { DEFAULT_WIPE, useThemeSwitch } from "@/components/theme/use-theme-switch";
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
 * The behaviour lives in `useThemeSwitch` so the theme lab drives the exact
 * code path that ships, rather than a copy that can drift from it.
 *
 * **The button face** is `Around` from the toggles.dev registry: a CSS-driven
 * sun that morphs into a moon clipped out of the same disc. It is deliberately
 * *uncontrolled* — its icon is styled purely with `dark:` variants, so it
 * follows the `dark` class on `<html>` with no mirrored state and no hydration
 * mismatch.
 *
 * **The wipe** is skiper26's `circle-blur` circular reveal (`blur` on,
 * `start="top-right"`), reused as-is: `createAnimation` returns the same CSS
 * skiper26 injects, written into `<style id="theme-transition-styles">` in
 * `<head>` and rewritten per toggle.
 *
 * **Why this does not call `useThemeToggle`.** That hook hands
 * `document.startViewTransition` a callback that calls `setTheme` and returns
 * `void`, but `next-themes` applies the `dark` class in a *passive effect*
 * (`useEffect(() => applyTheme(theme), [theme])`) — not during that call. The
 * browser snapshots the "after" state as soon as the callback settles, which is
 * before the class has landed, so the snapshot holds the OLD theme. The wipe
 * then animates the old snapshot for its full second and the live new theme is
 * revealed all at once when the transition tears down: a single flash at the
 * end of every switch.
 *
 * So the transition is driven here instead, with the class applied
 * *synchronously* inside the callback, which is what the snapshot has to
 * capture. `setTheme` still runs, so `next-themes` keeps its own state, the
 * media-query listener, and `localStorage` in step; its effect then re-applies
 * the class that is already there, which is a no-op. The callback stays
 * synchronous for the same reason: returning a promise that waits on a frame
 * deadlocks the capture phase, because rendering is suspended until it settles.
 *
 * `color-scheme` is set inline for the same reason: `next-themes` writes it
 * through the DOM too, and the UA canvas colour is part of the snapshot.
 *
 * Browsers without `document.startViewTransition` fall through to `setTheme`
 * and swap immediately, which is the correct behaviour with nothing to animate.
 *
 * The colour transitions in `globals.css` are suppressed for the duration of
 * the transition by `html:active-view-transition`; see the note there.
 *
 * Live animations are paused for the same window and released on
 * `transition.finished`, so nothing the snapshot froze can drift out from under
 * it and pop when the transition tears down.
 */
export function ThemeToggle({ className, tone = "default" }: ThemeToggleProps) {
  const toggle = useThemeSwitch(DEFAULT_WIPE);

  return (
    <Around
      onClick={toggle}
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