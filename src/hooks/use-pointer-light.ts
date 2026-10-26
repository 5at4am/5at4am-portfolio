"use client";

import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useMotionValue, useSpring, type MotionValue } from "motion/react";

/**
 * A pointer-tracked tilt and spotlight for one element.
 *
 * ── WHY A HOOK AND NOT A COMPONENT ───────────────────────────────────
 * Two surfaces on this site need exactly the same behaviour and neither of them
 * is a card: `GlassCard` in Achievements, and the expanded project panel. Both
 * need a tilt driven by where the pointer is across the element, and a highlight
 * that tracks it. Written twice it would be twice as much to keep correct, and
 * the first version already grew cruft — a `--glass-sx` / `--glass-sy` pair that
 * nothing ever read, left over from an earlier idea about driving the specular
 * light off springs instead of writing the position directly.
 *
 * ── WHY MOTION VALUES ────────────────────────────────────────────────
 * This tracks the cursor continuously. Through React state it would re-render the
 * subtree on every `pointermove`, which across a grid is the easiest way to make a
 * page janky. The springs write to the DOM node directly and React is not
 * involved after mount — the same trade `raj-ball.tsx` makes, and the reason it
 * gates its fan's re-aim to a 1.5° threshold instead of calling `setAngle` every
 * frame.
 *
 * ── WHY THE RECT IS CACHED ───────────────────────────────────────────
 * `getBoundingClientRect` inside a `pointermove` handler is a forced layout on
 * every frame. One measurement per gesture is enough, because the element's
 * layout box does not move while the pointer is over it — every transform here is
 * applied to a child, never to the measured element.
 *
 * ── THE INVERSION ON Y ────────────────────────────────────────────────
 * `rotateX` is `-ny * MAX_TILT`, not `+ny`. Pushing the pointer to the top of a
 * pane should tip its top edge AWAY, not toward it. Without the inversion the
 * surface leans in the same direction the cursor moves on both axes and reads as
 * following the pointer rather than being pushed by it.
 */

/** Degrees at the far edge. Past ~9 a flat pane stops reading as a surface
 *  catching light and starts reading as a broken one. */
const MAX_TILT = 7;

/** Looser than `dragging-ball.tsx`'s press spring, because a large surface with a
 *  tight spring looks like a twitch rather than a settle. */
const TILT_SPRING = { stiffness: 220, damping: 26, mass: 0.6 } as const;

export type PointerLight<T extends HTMLElement> = {
  /** Put on the measured element. */
  ref: React.RefObject<T | null>;
  /** Spread onto the measured element. */
  handlers: {
    onPointerEnter: (event: ReactPointerEvent<T>) => void;
    onPointerMove: (event: ReactPointerEvent<T>) => void;
    onPointerLeave: () => void;
  };
  /** Springy rotation, in degrees, ready for a motion component's `style`. */
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  /**
   * `style` for the INNER element that actually tilts. `transformPerspective` is
   * included so callers cannot forget it — without a perspective the rotation
   * renders as a flat skew.
   */
  tiltStyle: { rotateX: MotionValue<number>; rotateY: MotionValue<number>; transformPerspective: number; transformStyle: "preserve-3d" } | undefined;
};

/**
 * @param disabled Pass `true` under reduced motion. The tilt becomes `undefined`
 * rather than zero-valued, so nothing is animated at all instead of something
 * animated to its resting value — the same distinction `dragging-ball.tsx` draws
 * for its hover and press springs.
 */
export function usePointerLight<T extends HTMLElement>(
  disabled = false,
): PointerLight<T> {
  const ref = useRef<T>(null);
  const rect = useRef<DOMRect | null>(null);

  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, TILT_SPRING);
  const rotateY = useSpring(rotateYRaw, TILT_SPRING);

  const read = useCallback(() => {
    if (ref.current) rect.current = ref.current.getBoundingClientRect();
  }, []);

  const enter = useCallback(
    (event: ReactPointerEvent<T>) => {
      read();
      const r = rect.current;
      if (!r || disabled) return;

      const nx = (event.clientX - (r.left + r.width / 2)) / (r.width / 2 || 1);
      const ny = (event.clientY - (r.top + r.height / 2)) / (r.height / 2 || 1);
      rotateXRaw.set(-ny * MAX_TILT);
      rotateYRaw.set(nx * MAX_TILT);

      /* The spotlight position is written straight to custom properties on the
         element: two property writes per move, no React render. The gradient that
         consumes them is `.glass-surface::after` / `.panel-spot`. */
      const el = ref.current;
      if (el) {
        el.style.setProperty("--light-x", `${event.clientX - r.left}px`);
        el.style.setProperty("--light-y", `${event.clientY - r.top}px`);
        el.dataset.lit = "true";
      }
    },
    [disabled, read, rotateXRaw, rotateYRaw],
  );

  const leave = useCallback(() => {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
    const el = ref.current;
    if (el) {
      delete el.dataset.lit;
      el.style.removeProperty("--light-x");
      el.style.removeProperty("--light-y");
    }
  }, [rotateXRaw, rotateYRaw]);

  return {
    ref,
    handlers: { onPointerEnter: enter, onPointerMove: enter, onPointerLeave: leave },
    rotateX,
    rotateY,
    tiltStyle: disabled
      ? undefined
      : {
          rotateX,
          rotateY,
          transformPerspective: 900,
          transformStyle: "preserve-3d",
        },
  };
}