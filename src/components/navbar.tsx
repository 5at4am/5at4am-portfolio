"use client";

import { useEffect, useState } from "react";
import OptionWheel from "@/components/OptionWheel";
import { scrollToTarget } from "@/lib/smoother";

const NAV_ITEMS = ["About", "Experience", "Projects", "Skills", "Contact"];

/**
 * Navbar - the OptionWheel is the primary navigation.
 * A curved wheel of sections fixed to the left edge. Scroll, drag, or use
 * arrow keys to pick a section; the page scrolls to it on selection.
 * The wheel also tracks the page scroll (scroll-spy) via IntersectionObserver.
 */
export default function Navbar() {
  const [active, setActive] = useState(0);

  function handleChange(index: number, item: string) {
    scrollToTarget(item.toLowerCase());
  }

  // Scroll-spy: watch which section sits at the top of the viewport and move
  // the wheel to match. IntersectionObserver, not a scroll listener, so the
  // page never re-renders per scroll frame.
  useEffect(() => {
    let main: IntersectionObserver | null = null;
    let bottom: IntersectionObserver | null = null;

    // Active = the section whose top is at (or just above) the viewport top.
    // 2px tolerance absorbs subpixel scroll rounding. The last section can
    // never reach the top (the page ends first), so when its top enters the
    // bottom band (where it sits at maximum scroll) it counts as active.
    const computeActive = () => {
      const lastId = NAV_ITEMS[NAV_ITEMS.length - 1].toLowerCase();
      const lastEl = document.getElementById(lastId);
      if (lastEl) {
        const vh = window.innerHeight;
        const lastHeight = lastEl.getBoundingClientRect().height;
        const bandBottom = vh - lastHeight;
        const bandTop = bandBottom - vh * 0.02;
        const top = lastEl.getBoundingClientRect().top;
        if (top >= bandTop && top <= bandBottom + 2) {
          setActive(NAV_ITEMS.length - 1);
          return;
        }
      }
      let best: Element | null = null;
      let bestTop = -Infinity;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.toLowerCase());
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= 2 && top > bestTop) {
          bestTop = top;
          best = el;
        }
      }
      if (best) {
        const idx = NAV_ITEMS.findIndex((n) => n.toLowerCase() === best.id);
        if (idx >= 0) setActive(idx);
        return;
      }
      // No section at the line: we are at the top of the page.
      setActive(0);
    };

    const setup = () => {
      main?.disconnect();
      bottom?.disconnect();

      // Main: sections crossing the top 1% of the viewport.
      main = new IntersectionObserver(computeActive, {
        rootMargin: "0px 0px -99% 0px",
        threshold: 0,
      });
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.toLowerCase());
        if (el) main.observe(el);
      }

      // Bottom: the last section can never reach the top of the viewport
      // (the page ends first), so watch for it entering the band where its
      // top sits at maximum scroll and treat that as "at the bottom".
      // Negative rootMargin shrinks the root to exactly that band; the +2px
      // bottom tolerance covers the subpixel landing of the section top.
      const lastId = NAV_ITEMS[NAV_ITEMS.length - 1].toLowerCase();
      const lastEl = document.getElementById(lastId);
      if (lastEl) {
        const vh = window.innerHeight;
        const lastHeight = lastEl.getBoundingClientRect().height;
        const bandTop = vh - lastHeight - vh * 0.02;
        if (bandTop > 0) {
          bottom = new IntersectionObserver(computeActive, {
            rootMargin: `-${bandTop}px 0px -${lastHeight - 2}px 0px`,
            threshold: 0,
          });
          bottom.observe(lastEl);
        }
      }
    };

    setup();
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("resize", setup);
      main?.disconnect();
      bottom?.disconnect();
    };
  }, []);

  return (
    <>
      {/* Desktop: OptionWheel on the left edge */}
      <nav
        className="fixed inset-y-0 left-0 z-40 hidden w-[240px] md:block"
        aria-label="Primary"
      >
        {/* Brand mark */}
        <a
          href="#top"
          className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-canvas"
          aria-label="Satyam Raj - back to top"
        >
          SR
        </a>

        {/* The wheel */}
        <div className="absolute inset-y-0 left-0 w-full">
          <OptionWheel
            items={NAV_ITEMS}
            defaultSelected={0}
            selected={active}
            side="left"
            fontSize={1.35}
            spacing={1.6}
            curve={1}
            tilt={6}
            blur={2}
            fade={0.25}
            minOpacity={0.05}
            smoothing={220}
            inset={56}
            loop={false}
            draggable
            textColor="#8A8A8A"
            activeColor="#FFFFFF"
            onChange={handleChange}
          />
        </div>
      </nav>

      {/* Mobile: simple top bar */}
      <nav
        className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-canvas/90 backdrop-blur-md md:hidden"
        aria-label="Primary"
      >
        <div className="flex items-center justify-between px-4 py-2.5">
          <a href="#top" className="flex items-center gap-2 text-sm font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-canvas">
              SR
            </span>
            <span>
              Satyam<span className="text-accent">.</span>Raj
            </span>
          </a>
        </div>
        <div className="flex gap-1 overflow-x-auto px-4 pb-2.5">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="whitespace-nowrap rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-paper/70 transition-colors hover:border-accent hover:text-accent"
            >
              {item}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}