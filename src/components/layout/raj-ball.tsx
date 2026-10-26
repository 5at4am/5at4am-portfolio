"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionValue, useMotionValueEvent, useTransform } from "motion/react";

import { DraggingBall } from "@/components/ui/dragging-ball/dragging-ball";
import { RadialMenu } from "@/components/ui/radial-menu/radial-menu";

/* ══ The contact ball ═════════════════════════════════════
   A ball that floats over the whole page, can be dragged anywhere
   on screen, and opens the contact channels when clicked.

   ── WHY IT IS AN OVERLAY AND NOT PART OF THE CONTACT SECTION ──
   The first version of this sat inside the contact section, in a
   300x200 well, which meant the ball could travel about 120px in
   any direction and no further. That was a constraint chosen for
   the liquid-gooey filter, whose cost is proportional to the size
   of the box it is filtering (see dragging-ball.tsx). Once the
   stretch moved to a transform, the box stopped being a
   performance decision and was only a limitation.

   So the ball is now `position: fixed` over the whole viewport,
   mounted beside the sections rather than inside one. It is still
   the contact ball and it still opens the contact channels; it
   just is not wearing a box.

   ── THE STARTING POSITION ───────────────────────────────
   It parks directly above the hero's role line — "AI Engineer
   Intern at Estrel.ai" — because that is the one piece of text on
   the page that says what the ball is FOR. A ball that appears in
   a corner is furniture; one that appears under the job title
   reads as belonging to it, and the first click is more likely
   because the reason for it is already on screen.

   Measured from `#hero-role`, which the hero sets as an id
   rather than being found by matching its text — the string is
   content and will be edited, and a text query would silently
   start matching something else the day it did.

    Four clearances decide the final number, which is why this is
    not simply `rect.top - 56`:

      GAP     air between the role line and the ball. That line is
              12px of tracked-out mono caps; 44px of nothing above
              it puts the ball in its own band instead of
              crowding the words it is answering.

      MARGIN how close to the edge of the screen the ball may be
              parked. Closed, just enough that the ball never
              touches the edge. Open, it grows to cover the whole
              fan, so the fan cannot open off-screen — that is what
              lets "drag it anywhere" and "the fan always fits"
              both be true at once.

      TOP    the top edge does not use MARGIN. The sticky nav is
              48px tall and sits at z-50, above this overlay, so
              a ball dragged up under it would not be "close to
              the edge" so much as simply hidden. It is the one
              edge where the two answers differ, which is why it
              is a separate constant rather than a larger MARGIN
              that would also push the ball 36px further from the
              left and right edges than it needs to be. */
const GAP = 44;
const HALF = 28;
/* just enough that the ball never touches the edge of the screen */
const MARGIN = 40;
/* the sticky nav is 48px tall and sits at z-50, above this overlay, so a
   ball parked higher than this would slide behind it and look like it had
   been swallowed. The ball's CENTRE has to clear the header, which is the
   header plus half a ball — not just the header. */
const TOP = 48 + HALF;
const FAN_REACH = 68;
const OPT = 48;
const CAPTION = 19;
/* 68 + 24 is the furthest an option's edge gets from the ball's
   centre, and the caption hangs 19px below that. Together they
   are the keep-out that makes the open fan fit anywhere. */
const OPEN_MARGIN = FAN_REACH + OPT / 2 + CAPTION;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function ContactBall() {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  /* the fan orbits the ball's CENTRE, which is its top-left plus half a
     ball — see `place` */
  const fx = useTransform(x, (v) => v + HALF);
  const fy = useTransform(y, (v) => v + HALF);

  /* ── the fan points at the middle of the screen ──────────
     Not up. The ball can be parked against any edge now, and a
     fan that always opened upward would put two of its three
     channels off-screen from most positions. Pointing the middle
     one at the viewport centre puts the two shoulders along the
     edges at worst, so everything stays reachable.

     Read from the motion values, so the fan re-aims while the
     ball is still moving, and gated to a degree and a half,
     because below that the fan does not perceptibly move and
     re-rendering three anchors sixty times a second buys nothing. */
  const [angle, setAngle] = useState(-90);
  const aim = useCallback(() => {
    const a =
      (Math.atan2(box.h / 2 - (y.get() + HALF), box.w / 2 - (x.get() + HALF)) * 180) /
      Math.PI;
    setAngle((was) => (Math.abs(was - a) > 1.5 ? a : was));
  }, [box.w, box.h, x, y]);
  useMotionValueEvent(x, "change", aim);
  useMotionValueEvent(y, "change", aim);

  /** Put the ball's CENTRE at (cx, cy), keeping it inside the live margins. */
  const place = useCallback(
    (cx: number, cy: number) => {
      if (!box.w) return;
      const m = open ? OPEN_MARGIN : MARGIN;
      x.set(clamp(cx, m, box.w - m) - HALF);
      /* the top is clamped separately, and from the header rather than from
         `m`. The nav is above the overlay, so it is the one edge where
         "close to the screen" and "visible at all" are not the same thing. */
      y.set(clamp(cy, Math.max(TOP, m), box.h - m) - HALF);
    },
    [box.h, box.w, open, x, y],
  );

  /* ── measure the viewport ──────────────────────────────── */
  useEffect(() => {
    const read = () => setBox({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  /* ── park it above the role line, once ───────────────────
     This used to live in the same mount-only effect as the
     measurement, which is why it never ran. `place` closes over
     `box`, and on mount `box.w` is still 0, so the very first call
     hit its own `if (!box.w) return`. The ball was then pulled to
     the top-left corner by the re-clamp effect below, which is a
     clamp doing exactly what it was told.

     So the park waits for the box, and a frame is still taken
     first: on the first paint the hero has not been laid out and
     its rect is not the one it will settle into.

     Guarded by a ref rather than by the dependency list, because
     "park above the hero" is a first-run act and not an ongoing
     one — re-running it on `open` would yank the ball back under
     the hero every time the fan closed. */
  const parked = useRef(false);
  useEffect(() => {
    if (!box.w || parked.current) return;
    const id = requestAnimationFrame(() => {
      const r = document.getElementById("hero-role")?.getBoundingClientRect();
      place(
        r ? r.left + r.width / 2 : window.innerWidth / 2,
        r ? r.top - GAP : TOP,
      );
      parked.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [box.w, box.h, place]);

  /* ── re-clamp when the rules change ──────────────────────
     Opening the fan shrinks the area the ball may occupy, and a
     resize changes it. Both are constraints that arrive after the
     ball is already placed, and neither can be left to the drag:
     the drag only clamps while it is running, so a ball left
     against an edge and then opened would sit half off-screen
     with its fan.

     Skipped until the park has happened, so it cannot grab the
     ball out of the corner before the park has placed it. */
  useEffect(() => {
    if (!box.w || !parked.current) return;
    place(x.get() + HALF, y.get() + HALF);
  }, [box.w, box.h, open, place, x, y]);

  /* ── click away closes it ────────────────────────────────
     A menu that opens on a click and closes only on a second
     click is a menu you have to aim at twice. Anything that is
     not the ball and not a channel closes it — a drag of the
     page, a scroll, a click on the section the ball is nominally
     about.

     Attached on the next tick so the click that opened the fan
     cannot be the click that closes it. */
  const away = useRef<((e: PointerEvent) => void) | null>(null);
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const onDown = (e: PointerEvent) => {
        const t = e.target as Element | null;
        if (t?.closest?.("[data-ball], .fan-opt")) return;
        setOpen(false);
      };
      away.current = onDown;
      document.addEventListener("pointerdown", onDown);
    });
    return () => {
      cancelAnimationFrame(id);
      if (away.current) document.removeEventListener("pointerdown", away.current);
      away.current = null;
    };
  }, [open]);

  const m = open ? OPEN_MARGIN : MARGIN;

  return (
    /* ── `data-stage` is what the eye tracker measures its reach
         against. Its rect IS the viewport here, which is right:
         the ball is free-floating, so "is the pointer inside this
         card" has to mean "is the pointer on the page". */
    <div className="ball-overlay" data-stage>
      <DraggingBall
        x={x}
        y={y}
        /* framer reads a numeric constraint as an offset from the
           element's layout origin, and the ball's origin is the
           overlay's top-left. These are the centre-line limits
           with half a ball taken off, because the transform moves
           the top-left, not the centre. `top` comes from the
           header rather than from `m`, to match `place`. */
        constraints={{
          left: m - HALF,
          right: box.w - m - HALF,
          top: Math.max(TOP, m) - HALF,
          bottom: box.h - m - HALF,
        }}
        onActivate={() => setOpen((was) => !was)}
        expanded={open}
        label={open ? "Close contact links" : "Open contact links"}
      />
      <RadialMenu
        open={open}
        onOpenChange={setOpen}
        angle={angle}
        /* the fan rides the same two numbers the ball does, so it
           never detaches from it for a frame */
        style={{ x: fx, y: fy }}
      />
    </div>
  );
}