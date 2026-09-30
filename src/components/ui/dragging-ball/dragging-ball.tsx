"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { motion, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";

import { EyeTracker } from "@/components/ui/eye-tracker/eye-tracker";

/* ══ Dragging ball ════════════════════════════════════════
   A ball you can drag anywhere on screen. It squashes along the
   direction you are travelling and rounds out when you stop,
   the way a held soft thing does.

   ── WHY THERE IS NO SVG FILTER UNDER IT ──────────────────
   This was drawn with `liquid-gooey`, which paints a silhouette
   into a filtered `<svg>` and lets the filter do the stretching.
   That works in a small box and does not survive a free-floating
   one, and the reason is in the library's own code: the filter
   region is `group.offsetWidth + pad * 2` (dist/index.js:1923).
   The region is the size of the GROUP, not of the ball.

   Trapped in the old 300x200 well that region was ~360x280. Made
   viewport-sized — which is what "drag it anywhere" requires — it
   becomes roughly 1600x1060 of feGaussianBlur, feColorMatrix and
   feComposite re-rasterised on every drag frame, and this page is
   already running a WebGL wave field in the hero behind it.

   So the stretch moved to a transform on the ball's own inner
   element, where it costs one composited property and is in fact
   more faithful: it deforms along the true direction of travel
   rather than along an axis derived from two measurements.

   What was lost is the goo, and with `trail: 0` there was no trail
   to lose — the filter was stretching one body, which a transform
   does directly. `liquid-gooey` is no longer imported anywhere.

   ── POSITION IS A PROP, NOT INTERNAL STATE ───────────────
   `x` and `y` are motion values owned by the overlay, because the
   fan has to ride the same two numbers or it detaches from the
   ball on the first frame of a drag. Passing them in means one
   source of truth and no per-frame React state — the fan reads
   them straight onto its own transform. */

const SWELL = 0.06;

/* ── the squash, and the numbers behind it ─────────────────
   The strain is the ball's last known speed, decaying. Two
   constants do the work and both were measured by watching the
   ball rather than derived.

   `SPEED` converts framer's px/s into a scale. Framer reports
   velocity in px per SECOND; the per-frame delta this is derived
   from is that divided by 60, so a brisk flick at ~1200px/s
   gives about 20px of travel per frame — which is a firm but not
   silly stretch. 0.0002 lands that near 0.24 on the cap.

   `CAP` is where the ball stops deforming and just gets bigger.
   Past about 0.28 the circle is an egg and reads as a different
   shape rather than as a stretched one, which loses the return.

   `RETURN` is how fast it forgets. At 0.82 a frame it is gone in
   roughly a fifth of a second: long enough that the eye catches
   the ball recovering, short enough that it is not still wobbling
   when you stop to look at the fan. */
const SPEED = 0.0002;
const CAP = 0.28;
const RETURN = 0.82;

/* below this the ball is stationary and the stretch is released
   outright rather than eased, so a resting ball is exactly round
   and not a hair off — at 0.001 the circle is visibly an oval */
const REST = 1.5;

export type DraggingBallProps = {
  /** The ball, px. */
  size?: number;
  /** Position, owned by the overlay so the fan can share it. */
  x?: MotionValue<number>;
  y?: MotionValue<number>;
  /**
   * How far the ball may travel from its layout origin, which is the
   * overlay's top-left corner. Framer reads these as offsets, so the
   * caller has already done the half-a-ball arithmetic.
   */
  constraints?: { left: number; right: number; top: number; bottom: number };
  /** How hard it is squeezed while held, 0..100 — 0 is a rigid ball. */
  grip?: number;
  /** Eye style inside the ball. */
  eyes?: string;
  /** The face's size as a fraction of the ball. */
  eyeScale?: number;
  /**
   * Called on a plain press with no travel — a tap, or Enter/Space. A drag
   * that ends on the ball is not a tap and does not fire this; see the drag
   * note below. That separation is what makes the ball usable as a menu
   * trigger without the menu appearing every time it is moved.
   */
  onActivate?: () => void;
  /** Accessible name. The ball is a button as far as the keyboard is concerned. */
  label?: string;
  /** `aria-expanded` for the thing `onActivate` opens. */
  expanded?: boolean;
};

export function DraggingBall({
  size = 56,
  x,
  y,
  constraints,
  /* how hard it is squeezed while held — 0 is a rigid ball */
  grip = 50,
  eyes = "Slant",
  eyeScale = 1,
  onActivate,
  label = "Open contact links",
  expanded,
}: DraggingBallProps = {}) {
  const g = Math.min(1, Math.max(0, grip / 100));
  const reduce = useReducedMotion();

  /* The stretch lives on an INNER element on purpose. Framer owns the outer
     transform for the drag and for `whileTap`/`whileHover`, all of which are
     scales — so writing a scale of our own to the same element would have the
     two fighting over one value, and the squeeze would win or the stretch
     would depending on which ran last. Split across two elements they are
     independent, and they compose. */
  const stretchX = useMotionValue(1);
  const stretchY = useMotionValue(1);
  const stretchR = useMotionValue(0);

  /* velocity in refs, never state: it changes every frame and nothing here
     should re-render because of it */
  const vel = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  /* ── the recovery loop ────────────────────────────────────
     It runs while there is speed to spend and stops on its own
     once there is not, rather than living for the life of the
     component. A permanent rAF on a page whose hero already runs
     its own would keep the compositor awake for a ball that has
     not moved since you scrolled past it. */
  const settle = () => {
    if (raf.current || reduce) return;
    const step = () => {
      const v = vel.current;
      const speed = Math.hypot(v.x, v.y);
      v.x *= RETURN;
      v.y *= RETURN;
      if (speed < REST) {
        /* back to exactly round — see REST */
        stretchR.set(0);
        stretchX.set(1);
        stretchY.set(1);
        raf.current = 0;
        return;
      }
      const st = Math.min(CAP, speed * SPEED);
      stretchR.set((Math.atan2(v.y, v.x) * 180) / Math.PI);
      stretchX.set(1 + st);
      stretchY.set(1 - st * 0.6);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /* ── a drag is not a tap ──────────────────────────────────
     This file used to say that framer suppresses the click once
     a real drag has happened, and to lean on that so the ball
     could be both a thing you move and a menu trigger. Framer
     does not suppress it. Instrumenting the ball with
     pointerdown/pointerup/click gives, for one drag of 80px:

       pointerdown@304,490
       pointerup@384,442
       click@384,442          <-- the drag ends, and the menu opens

     pointerdown and pointerup are both on the ball, because the
     ball followed the pointer and so is under it at the end, and
     the browser synthesises a click whenever that is true. It
     does not care how far the pointer travelled.

     The result was that throwing the ball across the screen
     popped the contact fan open by itself, and the click you made
     next — still aiming at the ball — closed it again. The control
     felt broken in a way that had nothing to do with liquid.

     So the distinction is made here instead, in the only place
     that can see both halves of the gesture: a drag is noted at
     its start, the note is turned into a TIMESTAMP on pointerup,
     and `onClick` drops any click arriving within 300ms of it.

     ── WHY IT IS POINTERUP AND NOT `onDragEnd` ─────────────
     The obvious place to stamp is `onDragEnd`, and it is too late
     by one event. Logged, with all three timestamps from the same
     gesture:

       dragStart  12504
       click      13239      <- stamped value would still be 0
       dragEnd    13254      <- 15ms too late to matter

     Framer resolves a drag on its own rAF after pointerup, while
     the browser dispatches `click` immediately. So `onDragEnd` is
     the better place to answer "is the drag still going" and the
     wrong place to answer "has this gesture just been a drag" —
     by the time it runs, the click it needed to cancel has
     already been handled.

     `onPointerUp` is dispatched before `click` by the browser, in
     the same task, so a stamp written there is guaranteed to be
     visible to the click handler.

     The window rather than a plain boolean, because a boolean
     has to be cleared by something and the click may never
     arrive: release the pointer over the page and the browser
     sends no click, the flag stays set, and the next genuine tap
     gets swallowed as if it were the tail of the drag. A stale
     stamp ages out on its own. */
  const dragging = useRef(false);
  const draggedAt = useRef(0);

  const onDragStart = () => {
    dragging.current = true;
  };

  const onPointerUp = () => {
    if (dragging.current) draggedAt.current = performance.now();
    dragging.current = false;
  };

  const onClick = () => {
    if (performance.now() - draggedAt.current < 300) return;
    onActivate?.();
  };

  /* ── the keyboard gets the same gesture ──────────────────
     A drag is a pointer-only thing, so a ball that is also a
     control needs a non-pointer way to fire it or the control is a
     control only for some of us. Enter and Space both activate;
     Space does not scroll, because this is a button and a
     button's space belongs to the button. */
  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onActivate?.();
  };

  return (
    <motion.span
      data-ball
      className="drg-ball"
      style={{ width: size, height: size, x, y }}
      drag
      dragConstraints={constraints}
      /* a little give at the edge of the screen, and no throw on release —
         this is a thing you place, not a thing you flick */
      dragElastic={0.12}
      dragMomentum={false}
      onDragStart={onDragStart}
      /* framer's velocity is px/s and is the only per-frame measurement of
         how fast the ball is actually travelling; `settle` spends it */
      onDrag={(_, info) => {
        vel.current.x = info.velocity.x;
        vel.current.y = info.velocity.y;
        settle();
      }}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDragEnd={onDragStart}
      onClick={onClick}
      onKeyDown={onKeyDown}
      /* ── the hand, before the move ──────────────────────────
         `whileTap` is the press and it lasts as long as the pointer
         is down, drag included — so the pinch is held for the whole
         gesture and let go with it, which is what a grip is. Framer
         keeps these off the drag's own x and y, so nothing here
         fights the drag for the transform.

         A spring rather than an ease: a squeeze that arrives on a
         curve is a shape being animated, and one that arrives with
         a little overshoot is a soft thing giving. */
      whileHover={{ scaleX: 1 + SWELL * g, scaleY: 1 + SWELL * g }}
      whileTap={{ scaleX: 1 - 0.16 * g, scaleY: 1 + 0.08 * g }}
      transition={{ type: "spring", stiffness: 520, damping: 24, mass: 0.6 }}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-expanded={expanded}
    >
      {/* ── THE SQUASH, AND THE FACE GOES WITH IT ─────────────
          The stretch is a transform on this element and the eyes are
          inside it, so the face deforms with the body. Stretching the
          ball while the eyes stayed circular would look like a
          drawing of a stretched ball rather than a soft thing being
          pulled.

          It rotates first and then scales, which is what makes the
          stretch lie along the direction of travel — framer composes
          transform as translate, rotate, scale, so `rotate` aims the
          x-axis at the velocity and `scaleX` does the elongating. The
          reference implementation sandwiched a counter-rotation
          around the scale to undo it; that is only needed for shapes
          that are not rotationally symmetric, and a circle is not. */}
      <motion.span
        className="drg-squash"
        style={{ rotate: stretchR, scaleX: stretchX, scaleY: stretchY }}
      >
        {/* `tone="bare"` drops the tracker's own body so the only thing
            inside the ball is the pair of eyes — the ball paints its own
            disc, and two filled circles stacked would read as a smaller
            ball inside a larger one.

            `shape="Ball"` is not a default to leave alone. The tracker's
            default body is a soft CUBE, which would clip the eyes to a
            square sitting inside a circular ball, with the corners cut off
            and the mismatch visible at the edges.

            `decorative` because the ball above already names itself for the
            keyboard; a second role="img" inside a role="button" is a label
            for nothing. */}
        <EyeTracker
          size={size}
          shape="Ball"
          eyes={eyes}
          eyeScale={eyeScale}
          tone="bare"
          decorative
          follow={70}
          bounce={22}
          className="drg-face"
        />
      </motion.span>
    </motion.span>
  );
}