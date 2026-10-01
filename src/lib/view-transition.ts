/**
 * True while a document view transition is capturing or animating.
 *
 * A view transition replaces the page with a still image for its duration.
 * Anything that keeps drawing underneath it ends up showing a different frame
 * from the one that was captured, and jumps when the transition tears down. That
 * is the one artefact the View Transition API cannot fix on its own, and it is
 * invisible to `document.getAnimations()`, which only knows about CSS and Web
 * Animations API animations and never about a raw `requestAnimationFrame` loop
 * drawing to a canvas.
 *
 * `:active-view-transition` is matched for exactly the lifetime of the
 * transition, capture phases included, so polling it needs no bookkeeping and
 * cannot drift out of sync with the animation. It is also a plain selector
 * match: in a browser without view transitions it simply never matches, so
 * callers need no feature detection of their own.
 *
 * Polled per frame rather than tracked with events, because the platform exposes
 * no event for a transition starting or ending. It is a single selector test
 * against the root element.
 */
export function isViewTransitionActive(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.matches(":active-view-transition")
  );
}
