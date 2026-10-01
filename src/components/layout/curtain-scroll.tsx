"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

/* ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──
   Drives the curtain: the page slides up off the top of the screen
   over the last viewport of scroll, uncovering the fixed footer
   behind it. See the `curtain-*` block in globals.css for the layout
   half; this file is only the motion.

   ── WHY THE DISTANCE IS MEASURED, NOT WRITTEN ────────────────
   The page is translated by the runway's own `offsetHeight`. Writing
   a number here would look equivalent and is not: the runway is
   sized in `svh` (the viewport height with the mobile URL bar
   showing) while `window.innerHeight` is the CURRENT height, and the
   two diverge the moment the bar collapses. Reading the element
   makes the two halves of the effect impossible to desynchronise,
   and it re-reads on refresh so a resize or an orientation change
   cannot leave the page stranded halfway up with the footer only
   half revealed.

   ── WHY THE RUNWAY IS THE TRIGGER ─────────────────────────────
   Driving it from the page's bottom edge would mean a second
   measurement that has to agree with the first. The runway sits
   immediately after the page, so its top edge IS the page's bottom
   edge, and the scrub range is simply "the runway passing through
   the viewport" — one element, one range, no arithmetic.

   ── WHY `scrub` AND NOT A SNAP ───────────────────────────────
   The footer is scrubbed to the scroll, not played on a trigger,
   because the effect is positional: the footer is uncovered in
   proportion to how much of the page has passed. Tying it to scroll
   also means a trackpad flick and a scrollbar drag produce the same
   thing, and a user who jumps to the bottom with End lands exactly
   on the fully-revealed footer rather than waiting for a timeline.

   `scrub: 0.5` is a short catch-up rather than a rigid 1:1 bind. At
   1:1 the reveal is glued to the finger and any dropped frame is
   visible as a stutter in a full-screen transform; the small lag
   smooths that without making the footer feel like it is lagging
   behind the page.
   ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── */
export function CurtainScroll() {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    /* CSS already hid the runway and un-fixed the footer for reduced
       motion. Skipping here too means no ScrollTrigger is registered at
       all, so there is nothing to clean up and nothing to go stale. */
    if (shouldReduceMotion) return;

    const page = document.querySelector<HTMLElement>("[data-curtain-page]");
    const runway = document.querySelector<HTMLElement>("[data-curtain-runway]");
    const word = document.querySelector<HTMLElement>("[data-curtain-word]");
    const ball = document.querySelector<HTMLElement>(".ball-overlay");
    if (!page || !runway) return;

    gsap.registerPlugin(ScrollTrigger);

    /* Written straight to the element rather than through GSAP's
       `--word-fill` plumbing, because it is a CSS custom property and
       a scrub already re-runs the timeline on every frame. */
    const fill = word
      ? gsap.quickSetter(word, "--word-fill", "%")
      : null;
    if (fill) fill(0);

    const ctx = gsap.context(() => {
      /* The oversized name fills in as the footer is uncovered, so the
         type is part of the reveal instead of sitting there already
         finished.

         Driven off this trigger's own `onUpdate` rather than a second
         ScrollTrigger: two triggers on one range can disagree by a frame,
         and the fill would visibly lead or trail the curtain.

         `onUpdate` rather than `tween.scrollTrigger.addEventListener(
         "update", …)`: `addEventListener` on ScrollTrigger is a STATIC
         API, and its event list is limited to scrollStart, scrollEnd,
         refreshInit, refresh, matchMedia and revert. "update" is not
         among them, so per-trigger progress belongs on the config
         callback. The tween's scrollTrigger is typed as an instance,
         which has no such method, so the previous form failed to
         typecheck. */
      const setFill = fill;
      const onUpdate = setFill
        ? (self: ScrollTrigger) => setFill(self.progress * 100)
        : undefined;

      gsap.fromTo(
        page,
        { y: 0 },
        {
          y: () => -runway.offsetHeight,
          ease: "none",
          scrollTrigger: {
            trigger: runway,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
            onUpdate,
          },
        },
      );

      /* ── the contact ball retires as the curtain lifts ──────
         It is a fixed overlay, so it does not travel with the page —
         it sits wherever it was parked, which by the bottom of the
         document is squarely on top of the footer's availability
         headline. Worse than a cosmetic overlap: the footer IS the
         contact CTA by then ("Email me", plus the three channels), so
         a floating ball over it is a second, weaker version of the
         same action sitting on top of the primary one.

         Out by a third of the way through the reveal, which is early
         enough to be gone before the footer's content has arrived
         and late enough that a visitor who scrolls the last screenful
         casually still sees it lift away. Reverses on the way back up,
         so the page is exactly as it was for anyone who returns.

         `autoAlpha` rather than `opacity`, and that is a bug fix rather
         than a style choice. A fully transparent element
         is still hit-testable: `elementFromPoint` over the revealed footer
         kept returning the ball's eye SVG, and a tap aimed at "Email me"
         would have landed on an invisible ball instead. `autoAlpha` is
         opacity *plus* `visibility`, so at 0 the ball leaves hit-testing
         and the layer as well, while still fading rather than blinking out
         part-way through the scrub. */
      if (ball) {
        gsap.fromTo(
          ball,
          { autoAlpha: 1 },
          {
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: {
              trigger: runway,
              start: "top bottom",
              end: () => "+=" + runway.offsetHeight / 3,
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          },
        );
      }
    }, page);

    /* Fonts and images land after mount and change the page height, so
       the trigger's start and end are both stale until it refreshes.
       Without this the reveal runs against the wrong distances and the
       page stops short of clearing the screen. */
    const refresh = () => ScrollTrigger.refresh();
    // Fonts first: `document.fonts.ready` settles the metrics the
    // scroll-spy and every `scroll-mt` depend on.
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [shouldReduceMotion]);

  return null;
}