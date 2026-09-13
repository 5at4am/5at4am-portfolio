"use client";

import { useRef, useEffect, useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import { animate } from "animejs";

/**
 * AnimeReveal — GSAP-free reveal animation using anime.js.
 * Fades + slides its children up once it scrolls into view.
 * Respects prefers-reduced-motion (skips animation).
 */
export default function AnimeReveal({
  children,
  y = 32,
  duration = 900,
  delay = 0,
  className,
}: {
  children: ReactNode;
  y?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || started) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setStarted(true);
      return;
    }

    const initial: CSSProperties = {
      opacity: 0,
      transform: `translateY(${y}px)`,
    };
    Object.assign(el.style, initial);

    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      animate(el, {
        opacity: [0, 1],
        y: [y, 0],
        duration,
        delay,
        ease: "outExpo",
        onComplete: () => setStarted(true),
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            io.disconnect();
            run();
          }
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);

    const onScroll = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
        window.removeEventListener("scroll", onScroll, true);
        io.disconnect();
        run();
      }
    };
    window.addEventListener("scroll", onScroll, true);
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [y, duration, delay, started]);

  return (
    <div
      ref={wrapRef}
      className={className}
      data-anime-reveal={started ? "played" : "idle"}
    >
      {children}
    </div>
  );
}
