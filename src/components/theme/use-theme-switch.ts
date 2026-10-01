"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef } from "react";

import { createAnimation, type AnimationStart, type AnimationVariant } from "@/components/ui/skiper-ui/skiper26";

export const THEME_STYLE_ID = "theme-transition-styles";

export type WipeConfig = {
  variant: AnimationVariant;
  start: AnimationStart;
  blur: boolean;
};

/** What a toggle attempt actually did. Read by the theme lab. */
export type SwitchReport = {
  /** Which code path ran. */
  strategy: string;
  /** Theme the root was on when the callback was entered. */
  classOnEntry: boolean;
  /** Theme the root was on when the callback settled. */
  classOnExit: boolean;
  /** A view transition actually started. */
  usedViewTransition: boolean;
  /** Animations frozen for the duration of the transition. */
  pausedCount: number;
  /** Keyframe animations found on the `::view-transition-*` pseudos. */
  pseudoAnimations: string[];
  /** How long `:active-view-transition` stayed matched, in ms. */
  activeForMs: number | null;
  /** True when the class had not moved by the time the callback settled. */
  snapshotWasStale: boolean;
  error?: string;
};

/**
 * True for the animations that belong to the view transition itself, which must
 * keep running: those animate the snapshots, not the live DOM.
 */
export function isSnapshotAnimation(animation: Animation): boolean {
  return (
    animation.effect instanceof KeyframeEffect &&
    typeof animation.effect.pseudoElement === "string" &&
    animation.effect.pseudoElement.includes("view-transition")
  );
}

/** Injects (or replaces) the wipe stylesheet that skiper26's CSS needs. */
function installWipeStyles(css: string) {
  let style = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = THEME_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = css;
}

export type UseThemeSwitchOptions = WipeConfig & {
  /**
   * Apply the theme class synchronously inside the transition callback, so the
   * "after" snapshot is the new theme. Turning this off reproduces the upstream
   * ordering, where `next-themes` applies the class in a passive effect and the
   * snapshot captures the old one.
   */
  syncClass?: boolean;
  /**
   * Freeze animations the snapshot cannot follow, so nothing drifts underneath
   * it and pops at teardown. Turning this off isolates that second cause.
   */
  pauseLiveAnimations?: boolean;
  /**
   * Skip `document.startViewTransition` entirely. The baseline: if the flash
   * survives with no view transition, the transition is not the cause.
   */
  useViewTransition?: boolean;
  /** Called after each attempt with what actually happened. */
  onReport?: (report: SwitchReport) => void;
};

/**
 * The one theme switch used by the site and by the theme lab.
 *
 * Two independent defects are addressed, and each can be switched off so the
 * lab can demonstrate it:
 *
 * 1. **Stale snapshot.** `next-themes` applies the `dark` class in a passive
 *    effect, not during `setTheme`. A callback that only calls `setTheme`
 *    settles first, so the browser snapshots the old theme and the wipe animates
 *    the wrong side, then the live DOM snaps at teardown. Fix: apply the class
 *    synchronously inside the callback.
 *
 * 2. **Drift under the snapshot.** A view transition shows a still image while
 *    the live DOM keeps animating, so anything moving pops when the transition
 *    tears down. Measured, the hero's `MorphText` advanced about 490ms during
 *    the 1s wipe. Fix: pause live animations and release them with the
 *    transition.
 */
export function useThemeSwitch({
  variant,
  start,
  blur,
  syncClass = true,
  pauseLiveAnimations = true,
  useViewTransition = true,
  onReport,
}: UseThemeSwitchOptions) {
  const { setTheme } = useTheme();

  // Kept in a ref so `toggle` stays referentially stable while still calling the
  // latest callback. Written in an effect rather than during render, which the
  // react-hooks rules forbid.
  const reportRef = useRef(onReport);
  useEffect(() => {
    reportRef.current = onReport;
  }, [onReport]);

  return useCallback(() => {
    const root = document.documentElement;
    // Read the destination from the class, not from React state, which lags by
    // a render and would make rapid clicks resolve to the same theme.
    const next = root.classList.contains("dark") ? "light" : "dark";
    const classOnEntry = root.classList.contains("dark");

    const report: SwitchReport = {
      strategy: "",
      classOnEntry,
      classOnExit: classOnEntry,
      usedViewTransition: false,
      pausedCount: 0,
      pseudoAnimations: [],
      activeForMs: null,
      snapshotWasStale: false,
    };

    const finish = () => {
      report.classOnExit = root.classList.contains("dark");
      report.snapshotWasStale = report.usedViewTransition && report.classOnExit === report.classOnEntry;
      reportRef.current?.(report);
    };

    if (!useViewTransition || !document.startViewTransition) {
      report.strategy = useViewTransition ? "no support" : "no view transition";
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
      setTheme(next);
      finish();
      return;
    }

    installWipeStyles(createAnimation(variant, start, blur, "").css);

    if (!syncClass) {
      // Upstream path: hand `setTheme` to the browser and let the effect land the
      // class afterwards. Kept so the lab can reproduce the original flash.
      const transition = document.startViewTransition(() => {
        setTheme(next);
      });
      report.strategy = "upstream (class in a passive effect)";
      report.usedViewTransition = true;
      const startedAt = performance.now();
      const release = () => {
        report.activeForMs = Math.round(performance.now() - startedAt);
        finish();
      };
      transition.ready.catch(() => {});
      transition.finished.then(release, release);
      // The class lands in a passive effect, so it is still stale a frame later.
      // Sampled after that has had time to happen, which is the whole defect.
      window.setTimeout(() => {
        report.pseudoAnimations = document
          .getAnimations()
          .map((a) => (a.effect instanceof KeyframeEffect ? a.effect.pseudoElement : null))
          .filter((p): p is string => Boolean(p && p.includes("view-transition")));
      }, 250);
      return;
    }

    const startedAt = performance.now();
    let paused: Animation[] = [];
    const transition = document.startViewTransition(() => {
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
      setTheme(next);
    });
    report.strategy = pauseLiveAnimations ? "sync class + pause" : "sync class only";
    report.usedViewTransition = true;

    if (pauseLiveAnimations) {
      // Captured, not re-queried on release: resuming by a fresh
      // `getAnimations()` would also resume animations that were never paused,
      // including any started while the transition was running.
      paused = document
        .getAnimations()
        .filter((animation) => !isSnapshotAnimation(animation));
      report.pausedCount = paused.length;
      for (const animation of paused) animation.pause();
    }

    // Sampled while the transition is still running, not on release: by teardown
    // the `::view-transition-*` pseudos are already gone, so reading
    // `getAnimations()` in `release` reports none and looks like the wipe never
    // ran. Read once, early, when they exist.
    const samplePseudos = () => {
      report.pseudoAnimations = document
        .getAnimations()
        .map((a) => (a.effect instanceof KeyframeEffect ? a.effect.pseudoElement : null))
        .filter((p): p is string => Boolean(p && p.includes("view-transition")));
    };
    transition.ready.then(samplePseudos, () => {});

    const release = () => {
      for (const animation of paused) animation.play();
      report.activeForMs = Math.round(performance.now() - startedAt);
      finish();
    };

    transition.ready.catch(() => {});
    transition.finished.then(release, release);
  }, [blur, setTheme, start, syncClass, pauseLiveAnimations, useViewTransition, variant]);
}

/** The shipping configuration: circle-blur wipe from the top-right corner. */
export const DEFAULT_WIPE: WipeConfig = {
  variant: "circle-blur",
  start: "top-right",
  blur: true,
};
