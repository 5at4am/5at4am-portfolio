"use client";

import { useState } from "react";
import { motion, type MotionStyle } from "motion/react";

import { SOCIAL_ICONS } from "@/components/ui/social-icons";
import { CONTACT_LINKS } from "@/content/contact";
import { useEscapeKey } from "@/hooks/use-escape-key";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const hold = (e: React.PointerEvent) => e.stopPropagation();

/* ══ radial, one gesture ══════════════════════════════════
   A half circle of the contact channels, sprung from the ball
   that opens it.

   ── WHY THE CORE IS GONE ─────────────────────────────────
   This used to render its own `+` button in the middle of the
   fan, and the ball sat beside it. That was a layout of two
   triggers for one menu, which is a design that has to be
   explained — "press the ball, or the plus".

   The ball now sits exactly where the core did, which is where
   the arc already sprang from: the fan orbits the ball. One
   handle, one thing it does.

   ── WHY THE DRAG-PICK WENT WITH IT ───────────────────────
   The core also did something the ball cannot: press it, pull
   toward a channel, release, and it navigates. That is a
   genuinely good gesture and it is gone, because it is now in
   direct conflict with the thing this ball is for.

   The ball is draggable across the whole screen — that is the
   point of it. If a drag could mean "aim at a channel" while the
   fan was open, then dragging would work everywhere except when
   the menu was up, which is exactly when a user is most likely to
   move the ball to get the fan out of the way of what they are
   reading. A control whose drag changes meaning depending on its
   own state is worse than one that never had the gesture.

   So picking is by click, tap, or keyboard, on real anchors —
   which is also the path that already worked for everyone, and
   the one that does not require having discovered a gesture. */

const DEALT_WITH = CONTACT_LINKS.map((link) => ({
  key: link.icon,
  label: link.short ?? link.label,
  Icon: SOCIAL_ICONS[link.icon],
  href: link.href,
  external: link.external,
}));

/* ── GEOMETRY ──────────────────────────────────────────────
   `SPREAD` is 180°, a half circle, and with three channels that
   puts one straight ahead and one on each shoulder — the
   arrangement that reads as a fan rather than as a list bent
   into a curve.

   `RADIUS` holds the gap between neighbours, not a number off
   a slider. Two options `SPREAD/(n-1)` apart leave a chord of
   2·R·sin(step/2) between centres, so at 68 and a quarter turn
   apart the chord is 96 and two 48px circles leave 48 of air.
   It also clears the 56px ball by 16, so the fan never sits on
   the thing that opened it.

   Past five channels the fan opens outward by exactly what it
   takes to keep that chord; below five it does not move at all,
   because fewer options are further apart already and pulling
   them in would crowd them onto the ball. */
const SPREAD = 180;
const RADIUS = 68;

/* the count the chord above was derived at — five */
const DEALT = 5;

export type RadialMenuProps = {
  radius?: number;
  spread?: number;
  /** How far apart the options leave the ball. At 0 the fan opens as one shape; the higher it goes the more it reads as items being dealt out one after another. */
  stagger?: number;
  /** How many of them are on the fan, 2..6. Defaults to every contact channel. */
  count?: number;
  /**
   * Drive the fan from outside. With this set the component keeps no
   * opinion about whether it is open and only reports intent through
   * `onOpenChange` — which is what lets the ball be the thing that opens
   * the menu. Unset, it runs on its own state.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * The direction the middle option points, in degrees, where 0 is right
   * and -90 is straight up. The overlay passes the direction from the ball
   * to the centre of the viewport, which is what stops the fan opening off
   * the edge of the screen when the ball is parked near one.
   */
  angle?: number;
  /** Position for the fan's root, usually the ball's own `x`/`y` motion values so the two cannot drift apart. */
  style?: MotionStyle;
  className?: string;
};

export function RadialMenu({
  radius = RADIUS,
  spread = SPREAD,
  /* how far apart the options leave the ball — at 0 the fan opens as one
     shape, the higher it goes the more it reads as items being dealt out
     one after another */
  stagger = 28,
  /* how many of them are on the fan, 2..6 */
  count,
  open: controlled,
  onOpenChange,
  angle = -90,
  style,
  className,
}: RadialMenuProps = {}) {
  const arc = DEALT_WITH.slice(0, clamp(count ?? DEALT_WITH.length, 2, DEALT_WITH.length));

  /* the chord-preserving radius — see the geometry note above */
  const chordAt = (n: number) =>
    Math.sin((spread / (n - 1) / 2) * (Math.PI / 180));
  const reach = radius * Math.max(1, chordAt(DEALT) / chordAt(arc.length));

  const [own, setOwn] = useState(false);
  /* one path to the truth, so there is no call site that can update the state
     and forget to tell the parent */
  const open = controlled ?? own;
  const setOpen = (next: boolean) => {
    if (controlled === undefined) setOwn(next);
    onOpenChange?.(next);
  };

  /* ── ESCAPE CLOSES IT ─────────────────────────────────────
     A disclosure that the pointer can open and only the pointer
     can close is a trap for the keyboard, and one for the
     trackpad user whose other hand is on the escape key. The
     project's own hook, already used by the mobile nav panel for
     exactly this, rather than a second listener shaped the same
     way. */
  useEscapeKey(open, () => setOpen(false));

  /* the arc is centred on `angle`, so its middle option points wherever the
     caller says and the two shoulders straddle it */
  const angleOf = (i: number) => angle - spread / 2 + (spread / (arc.length - 1)) * i;

  return (
    /* `motion.div`, not `div`: `style` carries the ball's `x`/`y` motion
       values, and only a motion component unwraps those. On a plain
       element React writes them out as unknown CSS properties, they are
       dropped, and the fan stays pinned to the overlay origin instead of
       following the ball. `.ball-fan` is a zero-size origin anchor and
       motion adds no styles of its own, so this changes nothing else. */
    <motion.div className={"ball-fan" + (className ? ` ${className}` : "")} style={style}>
      {/* ── `inert` IS NOT DECORATIVE ───────────────────────
          The options are real links, so a closed fan that is only
          `opacity: 0` is a set of invisible links still in the tab
          order and still announced by a screen reader — focus walks
          onto a row of buttons you cannot see and activating one
          navigates the site from a menu that looks shut.

          `inert` takes them out of both without touching rendering,
          so the 420ms fan-out still plays on the way in: the
          attribute is dropped in the same commit that sets
          `data-open="true"`, and nothing about it is visible. */}
      <div className="fan-arc" data-open={open} inert={open ? undefined : true}>
        {arc.map((o, i) => {
          const a = (angleOf(i) * Math.PI) / 180;
          return (
            <a
              key={o.key}
              className="fan-opt gpane"
              href={o.href}
              {...(o.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              style={{
                transform: open
                  ? `translate(${Math.cos(a) * reach}px, ${Math.sin(a) * reach}px)`
                  : "translate(0, 0) scale(0.4)",
                transitionDelay: `${open ? i * stagger : 0}ms`,
              }}
              onPointerDown={hold}
              onClick={() => setOpen(false)}
              aria-label={o.label}
            >
              {/* 19 in a 48px circle. 16 was a third of it and
                  read as a label on a button rather than as the
                  tool itself — these are the only thing on the
                  fan, the words underneath being a hover state.

                  Sized by class rather than by a `size` prop,
                  because two of the three are the project's own
                  brand marks and those take no `size` — a
                  lucide `size={19}` would have sized the mail
                  envelope and left the other two at lucide's
                  default. CSS wins over the width/height
                  attributes anyway, so one class sizes all
                  three alike. */}
              <o.Icon className="size-[19px]" />
              <i className="fan-label">{o.label}</i>
            </a>
          );
        })}
      </div>
    </motion.div>
  );
}