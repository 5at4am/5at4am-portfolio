"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback } from "react";

import {
  DEFAULT_WIPE,
  useThemeSwitch,
  type WipeConfig,
} from "@/components/theme/use-theme-switch";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export type SimpleThemeToggleProps = {
  className?: string;
  /**
   * Wipe geometry for the theme-change animation. Omit for a plain switch with
   * no `document.startViewTransition` at all, which cross-fades the colours over
   * 200ms. Pass `DEFAULT_WIPE` for the circular blur reveal from the top-right
   * corner.
   */
  wipe?: WipeConfig;
  /** Called after each attempt with what actually happened. Used by the lab. */
  onReport?: (report: import("@/components/theme/use-theme-switch").SwitchReport) => void;
};

/**
 * A plain shadcn-style sun/moon switch, optionally driving a view transition.
 *
 * The button face is deliberately ordinary: two lucide glyphs, no morph, no
 * spring, no clipped disc. The interesting half is the `wipe` prop, which
 * decides whether the theme change is animated at all.
 *
 * **Why the face is plain.** The face was never the cause of the flash. A view
 * transition shows a still image of the page for its whole duration, so a button
 * that animates during that window is a second thing that has drifted away from
 * the captured frame by the time the transition tears down.
 *
 * **With `wipe`, the animation is safe only because the drifting content is
 * held.** `useThemeSwitch` pauses CSS and Web Animations animations for the
 * duration, and the hero's WebGL wave field is held by
 * `isViewTransitionActive` in `gradient-waves.tsx`, which a raw
 * `requestAnimationFrame` loop needs because `document.getAnimations()` cannot
 * see it. Both resume from the frame that was captured, so the hand-back at
 * teardown is seamless.
 *
 * **Without `wipe`,** this is the control case: no snapshot is ever taken, so
 * there is nothing to drift out of sync with, and the 200ms colour transition in
 * `globals.css` reads as a cross-fade.
 *
 * `useHydrated` gates the icon rather than mirroring the theme into state, since
 * the active theme is only knowable in the browser and rendering it during SSR
 * would guarantee a mismatch. Until hydration both glyphs are rendered and
 * swapped by CSS, which is why the accessible name sits on the button.
 */
export function SimpleThemeToggle({
  className,
  wipe,
  onReport,
}: SimpleThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  // Both handlers are always created so neither is conditional; `wipe` only
  // decides which one the click runs.
  const switchWithWipe = useThemeSwitch({ ...(wipe ?? DEFAULT_WIPE), onReport });
  const switchPlain = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const handleClick = wipe ? switchWithWipe : switchPlain;

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={handleClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border border-border bg-background",
        className
      )}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0",
          hydrated && resolvedTheme === "dark" ? "hidden" : "block"
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0",
          hydrated && resolvedTheme === "dark" ? "block" : "hidden"
        )}
      />
    </button>
  );
}
