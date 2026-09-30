"use client";

import { useEffect, useState } from "react";
import GradientWaves from "@/components/ui/gradient-waves/gradient-waves";

/**
 * Monitor palette so the wave field stays inside the brand's achromatic
 * tokens. The `next-themes` blocking script has already applied the `.dark`
 * class on `<html>` before this mounts, so the initial read can't flash the
 * wrong palette; a `MutationObserver` on the class keeps the field in step
 * with the toggle's view transition.
 *
 * Reduced motion freezes the field: `speed=0` pins the shader's `T` to zero
 * and cursor parallax is disabled, same compromise the 3D paper makes.
 */
const PALETTES = {
  dark: {
    horizonColor: "#17171b", // zinc-900, haze slightly above the page void
    waveColor: "#27272a", // zinc-800, mid wave bodies
    crestColor: "#a1a1aa", // zinc-400, nearest crest highlights
    opacity: 0.95,
  },
  light: {
    horizonColor: "#f4f4f5", // zinc-100
    waveColor: "#d4d4d8", // zinc-300
    crestColor: "#71717a", // zinc-500
    opacity: 0.7,
  },
} as const;

const isDarkClass = () =>
  typeof document === "undefined" ? false : document.documentElement.classList.contains("dark");

const prefersReducedMotion = () =>
  typeof window === "undefined"
    ? false
    : window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function HeroGradientWaves() {
  const [isDark, setIsDark] = useState(isDarkClass);
  const [prefersReduced, setPrefersReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const update = () => setIsDark(isDarkClass());
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const palette = isDark ? PALETTES.dark : PALETTES.light;

  return (
    <GradientWaves
      horizonColor={palette.horizonColor}
      waveColor={palette.waveColor}
      crestColor={palette.crestColor}
      speed={prefersReduced ? 0 : 0.7}
      amplitude={2.5}
      waveScale={0.6}
      waveRatio={0.9}
      swell={35}
      turbulence={40}
      tilt={1.11}
      zoom={1.0}
      height={10}
      fogDepth={20}
      detail="medium"
      brightness={1.0}
      opacity={palette.opacity}
      mouseInteraction={!prefersReduced}
      parallaxStrength={0.7}
      grain={false}
      grainIntensity={0.05}
    />
  );
}