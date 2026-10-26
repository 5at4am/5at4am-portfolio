# Motion Design

A working reference for motion in two registers: **interactive interface** motion in the
browser, and **timeline** motion for film and video. Both are here because the underlying
reasoning is shared, but they are not the same discipline and the differences are where
most guidance goes wrong.

Motion is not decoration applied last. It is the explanation of *what just changed* and
*what is now possible*. Everything below is judged against that.

This document is reusable across projects. It is also opinionated, and it says which parts
are measured and which are rules of thumb — see
[Where every number came from](#where-every-number-came-from).

**Companions**

| File | Contents |
|---|---|
| [`motion-code-starters.md`](./motion-code-starters.md) | Easing functions, After Effects expressions, GSAP timelines, Remotion compositions |
| [`motion-project-templates.md`](./motion-project-templates.md) | Brief, motion language lock, shot timing sheet, style guide, effect log, review checklists |

---

## How to read this document

### Two registers, one word: "easing"

"Easing" means different things in the two halves of this document, and mixing them up is
the single most common source of bad motion advice.

| | Interface motion (Part B) | Timeline motion (Part C) |
|---|---|---|
| Driven by | The user, at an unknown time | You, at a known frame |
| Can be interrupted | Yes, constantly | No |
| Duration | Whatever it takes to settle | Fixed, in frames, forever |
| Correct model | **Spring** — velocity-continuous, retargetable | **Curve** — a fixed shape over a fixed time |
| Retarget mid-flight | Must, or it looks broken | Impossible by design |
| Failure mode | Jank, hydration errors, contrast bugs | Boredom, unreadable text, missed sync |

If you take one thing from this document: **springs are for things the user can interrupt;
curves are for things the user cannot.** Everything else follows.

### Provenance labels

Claims are labelled where the distinction matters:

- **[Measured]** — measured directly, on a stated artefact, with a stated method.
- **[Standard]** — established practice, not tuned to your project. Start here, then adjust.
- **[Reported]** — supplied analysis of eight reference videos and three stills. Method and
  its limits are stated in [§22](#what-the-reference-set-shows-and-what-it-cannot-show).
  Treat as a pointer to where to look, not as ground truth.
- **[Verify]** — vendor or pricing claim. Confirm at the source before you commit.

Unlabelled prose is reasoning, not measurement.

---

## Contents

**Part A — Foundations**

1. [The seven rules](#the-seven-rules)
2. [Register: decide what kind of motion this is](#register-decide-what-kind-of-motion-this-is)
3. [Easing: curves for time, springs for response](#easing-curves-for-time-springs-for-response)
4. [Duration, holds and reading time](#duration-holds-and-reading-time)
5. [The motion budget](#the-motion-budget)

**Part B — Interface motion**

6. [Entrances that survive no-JavaScript](#entrances-that-survive-no-javascript)
7. [Hover, press and pointer response](#hover-press-and-pointer-response)
8. [Pointer tracking without re-renders](#pointer-tracking-without-re-renders)
9. [Stagger and cascade](#stagger-and-cascade)
10. [Scroll-driven motion](#scroll-driven-motion)
11. [Ambient and continuous loops](#ambient-and-continuous-loops)
12. [Reduced motion](#reduced-motion)
13. [SSR and hydration](#ssr-and-hydration)
14. [Contrast](#contrast)
15. [Performance](#performance)
16. [Measurement and debugging](#measurement-and-debugging)
17. [Interface anti-patterns](#interface-anti-patterns)

**Part C — Motion for film and video**

18. [Decision flow: job, tone, platform](#decision-flow-job-tone-platform)
19. [Signature technique by job and tone](#signature-technique-by-job-and-tone)
20. [Lock the motion language](#lock-the-motion-language)
21. [The anti-repetition system](#the-anti-repetition-system)
22. [What the reference set shows, and what it cannot show](#what-the-reference-set-shows-and-what-it-cannot-show)
23. [The reference set, video by video](#the-reference-set-video-by-video)
24. [The three stills](#the-three-stills)
25. [Techniques menu](#techniques-menu)
26. [Why these read as professional](#why-these-read-as-professional)
27. [Typography, shape and colour](#typography-shape-and-colour)
28. [Effects catalogue](#effects-catalogue)
29. [Production notes, and borrowing without copying](#production-notes-and-borrowing-without-copying)

**Part D — Making and shipping**

30. [Workflow: brief to export](#workflow-brief-to-export)
31. [Export cheat sheet](#export-cheat-sheet)
32. [Tools](#tools)
33. [Review checklists](#review-checklists)

**Part E — Provenance**

34. [Honest limits and known contradictions](#honest-limits-and-known-contradictions)
35. [Where every number came from](#where-every-number-came-from)

---

# Part A: Foundations

## The seven rules

If you only remember seven things:

1. **Never animate `opacity` from 0 on content that matters.** Animate `y`, `scale`,
   or a filter. A hidden initial state that depends on JS to clear is a page that is
   blank for anyone without it.
2. **Springs for anything interactive.** Easing curves for anything that fires on a
   timer.
3. **Emphasis is colour, not transparency.** Element opacity composites against the
   background *before* contrast is evaluated, so dimming text is a contrast bug.
4. **Pointer tracking never goes through React state.** Motion values, or the page
   will stutter exactly when the user is interacting with it.
5. **Reduced motion removes movement, never capability.** Every state must remain
   reachable.
6. **One continuous animation per view.** Everything else answers an input.
7. **Measure it.** Almost every confidently-wrong claim about motion is wrong in a
   way a screenshot reveals and an assertion catches.

Rule 2 is the register rule from [above](#two-registers-one-word-easing) stated as a
default. The exceptions in [§3](#easing-curves-for-time-springs-for-response) are real
and worth memorising.

---

## Register: decide what kind of motion this is

Two questions decide almost everything downstream: **what is driving this**, and **how
loud should it be**.

### The register ladder

The same technique is correct at one rung and wrong at another. Squash and stretch on a
game character is charming; the same deformation on a résumé's download button is
unprofessional. Before using a technique, place it.

| Rung | Register | Example | What breaks it |
|---|---|---|---|
| 1 | **Functional** | A toggle sliding, a menu expanding | Anything that draws the eye away from the action |
| 2 | **Confirming** | A card settling after submit, a count-up finishing | Overshoot that reads as bounce rather than confirmation |
| 3 | **Expressive** | A panel revealing its contents, a section cascading in | Ambiguity about what is interactive |
| 4 | **Ambient** | A slow gradient drift behind content | Anything that moves while the user reads |
| 5 | **Signature** | A hero moment that defines the product | Requires that nothing else competes |

Interface work should mostly live at rungs 1 to 3, with at most one thing per view at 4.
Timeline work can afford 5 because the viewer has nothing else to do.

**The budget rule follows from the ladder:** one view, one thing at rung 4 or 5. Everything
else answers an input.

### Two questions to ask before animating anything

1. **What is the user doing while this moves?** If the answer is "reading", the motion must
   be rungs 1 to 2 or invisible. If the answer is "waiting on me", it can be expressive. If
   the answer is "nothing, this is a video", it can be signature.
2. **What was true before, and what is true now?** If you cannot answer in one sentence,
   you do not have a motion idea yet. You have a technique.

Question 2 is the anti-decoration filter. "The card fades up and tilts" describes a
technique. "The card was closed; it is now open, and it opens toward the pointer so the
relationship between the two is legible" describes motion.

---

## Easing: curves for time, springs for response

An easing curve is a fixed shape: this thing takes exactly this long and follows
this path. A spring is a physical model: this thing has mass, it was pushed, and it
is still settling.

The difference is legible. An eased hover is *animated*. A sprung hover *gives*.

```js
// A press that arrives on a curve is a shape being animated.
transition: { duration: 200, ease: "easeOut" }

// One that arrives with a little overshoot is a soft thing giving.
transition: { type: "spring", stiffness: 520, damping: 24, mass: 0.6 }
```

### The one-line test

**Does it overshoot?** If yes, it needs a spring. If no, a curve is fine and cheaper.

### Springs, in numbers

The workhorse for interface work. Values tuned and browser-verified in this repo.

| Feel | `stiffness` | `damping` | `mass` |
|---|---|---|---|
| Press / tap | 520 | 24 | 0.6 |
| Hover on a control | 400 | 30 | 0.6 |
| Entering, small element | 380 | 32 | 0.7 |
| Entering, large panel | 220 | 26 | 0.6 |
| Drag release | 260 | 30 | 0.5 |

Reading them:

- **stiffness** — how hard it is pulled toward the target. Higher is faster.
- **damping** — how much it resists passing the target. **Below ~20 and it visibly
  bounces; above ~34 and it arrives like an ease.** The overshoot *is* the effect.
- **mass** — inertia. Raise it for large surfaces. A tight spring on a big panel
  looks like a twitch; the same spring on a 24px button looks expensive.

`damping: 24, mass: 0.6` is the workhorse. Reach for `damping: 14` only when you
want something that visibly wobbles.

### Curves, in numbers

For timeline work, and for the interface cases below. Ready-made implementations are in
[`motion-code-starters.md`](./motion-code-starters.md).

| Use | Easing | `cubic-bezier` |
|---|---|---|
| Entrance (default) | Ease-out | `0.0, 0.0, 0.2, 1` |
| Exit | Ease-in | `0.4, 0.0, 1, 1` |
| Move across screen | In-out | `0.4, 0.0, 0.2, 1` |
| Premium reveal | Expo-out | `0.16, 1, 0.3, 1` |
| Soft deceleration | Quart-out | `0.25, 1, 0.5, 1` |
| Playful pop | Back-out | `0.34, 1.56, 0.64, 1` |
| UI object settle | Spring (`damping` ~24) | physics, not bezier |

Entrances ease out, exits ease in, and **exits are shorter than entrances**. The reason is
attention: on the way in the user is following the object, on the way out they have already
moved on. A 600 ms exit is 400 ms of someone waiting for a thing to leave.

### When a curve is correct, even in the interface

- **Colour and background transitions.** A colour that overshoots past its target
  and comes back looks broken.
- **Progress and percentages.** A determinate bar that springs is lying about its
  value.
- **Anything with a known duration the user is waiting on.**

### Springs in CSS

Native CSS transitions cannot be springs. When state lives in the platform (a
`<details>` open, a popover) and you have no JS state to hand a spring library, a
`linear()` sampling of a spring curve is the workaround:

```css
:root {
  --ease-spring: linear(
    0, 0.0088 1.6%, 0.0345 3.2%, 0.1092 4.8%, 0.3105 6.4%, 0.6411 8%,
    0.8695 9.6%, 0.9995 11.2%, 1.0555 12.8%, /* ...overshoot past 1... */
    1.0241 16%, 0.9917 17.6% /* ...and back... */
  );
  --ease-change: cubic-bezier(0.32, 0.72, 0, 1); /* for state crossings */
}
```

The values above 1 are the whole point. Keep `--ease-change` separate so nobody
reuses a spring for a colour.

---

## Duration, holds and reading time

### Duration table

**[Standard]** except the two rows marked. Assumes 30 fps; see the note below before
using the frame column.

| Action | Seconds | Frames at 30 fps |
|---|---|---|
| Icon pop or toggle | 0.15 to 0.3 | 5 to 9 |
| Element entrance | 0.3 to 0.6 | 9 to 18 |
| Text line reveal | 0.4 to 0.8 | 12 to 24 |
| Morph between states | 0.4 to 0.9 | 12 to 27 |
| Scene transition | 0.4 to 0.8 | 12 to 24 |
| Logo reveal | 1.0 to 2.0 | 30 to 60 |
| Stagger step | 0.05 to 0.12 | 2 to 4 |
| **Hold between morphs** | **0.7 to 1.2** | **20 to 36** |
| **Final logo hold** | **1.5 to 3.0** | **45 to 90** |

The two bold rows are the ones most often skipped, and skipping them is why so much motion
feels breathless.

**Frame rates are not always 30.** Web and social exports are frequently 24, 25, 30 or 60.
The seconds column transfers; the frames column does not. Recompute
`frames = seconds x fps` against the actual sequence settings before you build a timing
sheet, or every frame number in
[`motion-project-templates.md`](./motion-project-templates.md) will be wrong.

### Holds are the most under-used tool in motion

A hold is doing nothing on purpose. It is the pause that makes the next movement read as a
decision rather than a loop.

**[Reported]** In the V2 reference, a folder grows, overshoots, settles, then sits
essentially still for about a second before the cursor returns and the second morph begins.
That hold is why the second morph feels intentional. See
[§22](#what-the-reference-set-shows-and-what-it-cannot-show) for why this reading is
medium-confidence rather than precise.

Without a hold, back-to-back transitions fuse into one smear and the viewer registers
activity rather than sequence. With a hold, each movement is legible as a separate event.

Holds apply to the interface too, and this is the most commonly missed interface technique:
**after a transition settles, do not immediately start the next one.** If a card expands on
tap and the contents cascade in, give the expansion a beat before the cascade begins. The
cascade then reads as content arriving rather than as one long animation.

### Reading time

**[Standard]** About 3 words per second is comfortable for on-screen text that must be
read, and it is deliberately conservative: a viewer reading a video cannot rewind, and
silent reading is slower than narration pace.

A headline of *N* words needs roughly `N / 3` seconds of full visibility after its animation
completes, plus about 0.5 s.

The same rule applies to animated text on a web page, with one adjustment: **the hold is
not optional and it is not the animation duration.** A heading that animates in over 600 ms
and is then immediately displaced by a scroll-driven effect has been given no reading time
at all. If text is being animated in, budget the static time separately in your budget.

### Pacing

How often something visually changes, by register:

| Video type | Visual change every |
|---|---|
| Energetic social | 1.5 to 3 s |
| Product or SaaS | 2 to 4 s |
| Premium, calm | 4 to 6 s |

---

## The motion budget

**Animate at most one or two things per view that move on their own.** Everything
else must answer an input.

Motion that runs without input is the expensive kind: it competes with reading,
never stops, and is the first thing that makes a page feel like a demo. Before
adding an ambient loop, ask whether the view already has one.

### Cost, roughly

| Technique | Cost | Notes |
|---|---|---|
| `transform`, `opacity` | free | compositor-only |
| `filter: blur()` | cheap on small areas | re-rasterises each frame |
| `backdrop-filter` | **expensive** | re-samples the backdrop; keep radius small |
| `width` / `height` / `top` | layout | one reflow per frame — avoid in scroll loops |
| Canvas / WebGL | one context | cheap if you stop the loop when idle |

**Animate `transform` and `opacity`. If something must change size, put the size
change on a child and scale the child.** `scaleY` is free; `height` is a reflow.

If a bar encodes a value in its width, scale `scaleY` for emphasis and never
`scaleX` — scaling the axis that carries the data changes the data.

---

# Part B: Interface motion

Everything in Part B assumes the register from
[§2](#register-decide-what-kind-of-motion-this-is) is interface motion: the user drives it,
it can be interrupted, and it must survive no JavaScript, reduced motion, keyboard
navigation, both colour themes and four viewport widths.

---

## Entrances that survive no-JavaScript

This is the rule most often violated, usually by accident, and it is worth
internalising.

### The failure

```jsx
<motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ y: 0, opacity: 1 }}>
  Important content
</motion.div>
```

The server renders `opacity: 0`. `whileInView` needs an `IntersectionObserver` to
fire. Without JS the observer never arrives, so the content stays at zero opacity
forever — present in the DOM, invisible on the page. A whole section can vanish and
the build still looks fine.

### The fix

Animate **transform only**. `y: 10 → 0` leaves content fully painted ten pixels
low. Readable with scripting off, and it still moves.

```jsx
<motion.div initial={{ y: 10 }} whileInView={{ y: 0 }}
  viewport={{ once: true, margin: "-10% 0px" }}
  transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}>
  Important content
</motion.div>
```

### The trade you are making

With scripting off, content sits a few pixels from where it settles. That is
invisible to a reader and costs you nothing. Compare it to the alternative: content
that is gone.

If you truly cannot avoid an opacity fade — because the design depends on it — then
make the *unrevealed* state visible rather than transparent:

```jsx
initial={{ opacity: 0.4 }}   // visible, not invisible
```

### `initial={false}` is the safe boring option

`initial={false}` starts every element at its resting state and skips the entrance.
Nothing is ever hidden, so nothing can break. It is correct and it is also *no
entrance animation at all* — which is a real cost. Use it when correctness matters
more than the entrance; use a transform-only initial when you want both.

---

## Hover, press and pointer response

### Hover is an additive path, never the only one

`onMouseEnter` does not fire on touch. Anything that *only* works on hover is
invisible to a phone.

- Primary action → click / tap
- Hover → preview or emphasis

`prefers-reduced-motion` does not disable `whileHover` for you. Gate it yourself:

```jsx
const reduce = useReducedMotion();

<motion.button
  whileHover={reduce ? undefined : { scale: 1.03 }}
  whileTap={reduce ? undefined : { scale: 0.97 }}
  transition={{ type: "spring", stiffness: 520, damping: 24, mass: 0.6 }}
/>
```

`undefined` rather than `{ scale: 1 }` — one animates nothing, the other animates
to a value that happens to be the resting one. Both cost frames; only one is honest.

### Squash and stretch, driven by velocity

The most convincing small effect in interaction design: an object deforms along the
direction it is travelling and rounds out when it stops.

```js
// framer reports velocity in px/second. Convert to a scale with a cap.
const SPEED = 0.0002; // a brisk ~1200px/s flick lands near the cap
const CAP   = 0.28;   // past this it reads as a different shape, not a stretch
const RETURN = 0.82;  // decay per frame: gone in ~1/5s

// Then rotate to the direction of travel BEFORE scaling. Transform composition is
// translate -> rotate -> scale, so rotate aims the axis and scale elongates it.
style={{ rotate: angleDeg, scaleX: 1 + strain, scaleY: 1 - strain * 0.6 }}
```

Two details that matter:

- **Rotate first, then scale.** Otherwise the stretch lands on an arbitrary axis.
- **Split the deformation onto a child.** If the parent already carries a
  `whileTap` scale, two animations writing one value will fight, and the winner
  depends on scheduling. Parent for gestures, child for deformation.

### A decay loop that stops itself

```js
const settle = () => {
  if (raf.current) return;           // already running
  const step = () => {
    v.x *= RETURN; v.y *= RETURN;
    if (Math.hypot(v.x, v.y) < REST) {
      strain.set(0);                  // exactly round, not "nearly" round
      raf.current = 0;
      return;                         // loop ends; nothing keeps the compositor awake
    }
    raf.current = requestAnimationFrame(step);
  };
  raf.current = requestAnimationFrame(step);
};
```

A permanent `requestAnimationFrame` on a page that already runs a hero animation
keeps the GPU busy for an object that has not moved since you scrolled past it.
Start on demand, end on rest.

---

## Pointer tracking without re-renders

The highest-value pattern in this document. Routing pointer position through React
state re-renders a subtree on every `mousemove`, which is the single easiest way to
make a polished page feel cheap.

```jsx
import { useMotionValue, useSpring, useTransform, motion } from "motion/react";

function Magnetic() {
  // -1 .. 1 across each axis, relative to the element's centre
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // spring them so the element glides to the pointer and settles when it stops
  const sx = useSpring(px, { stiffness: 260, damping: 26, mass: 0.5 });
  const sy = useSpring(py, { stiffness: 260, damping: 26, mass: 0.5 });

  // derived values, also motion values
  const x = useTransform(sx, (v) => v * 24);
  const rotate = useTransform(sx, (v) => v * 8);

  return <motion.div style={{ x, rotate }} />;
}
```

Nothing re-renders after mount. React hands the motion values to the DOM node and
the library writes transforms directly.

### Cache the rect, do not measure per frame

`getBoundingClientRect()` inside a `mousemove` handler is a forced layout on every
frame.

```js
const rect = useRef(null);

const onEnter = (e) => {
  rect.current = e.currentTarget.getBoundingClientRect();  // once per gesture
};
const onMove = (e) => {
  const r = rect.current;
  if (!r) return;
  px.set((e.clientX - (r.left + r.width / 2)) / (r.width / 2));
};
```

This is only valid if **nothing moves the element's layout box**. Keep every
transform on a child. A 2% hover scale on the measured element invalidates the
cached rect — a few pixels of error, usually invisible, but free to avoid.

### Inverse the Y axis

```js
rotateX.set(-ny * MAX);   // not +ny
```

Pushing the pointer to the top of a surface should tip its top edge *away*. Without
the inversion the surface leans the same direction the cursor moves on both axes and
reads as *following* the pointer rather than being *pushed* by it. It is the single
most common sign that a tilt is wrong.

### A tilt is decoration and decoration is not focusable

Never make a tilting element focusable just so the tilt can be seen by keyboard.
If the tilt accompanies a real action, that action is a real `<button>` with its own
focus ring. If it is decoration, it stays out of the tab order.

---

## Stagger and cascade

Revealing a group one item at a time turns a list into a sequence, and a sequence is
easier to follow than a wall.

```jsx
{items.map((item, i) => (
  <motion.li
    initial={{ scale: 0.94 }}
    animate={{ scale: active ? 1 : 0.94 }}
    transition={{
      type: "spring", stiffness: 420, damping: 34, mass: 0.6,
      delay: active ? Math.min(i, CAP) * 0.026 : 0,
    }}
  />
))}
```

### Rules that make it work

- **Cap the delay.** `Math.min(i, CAP)` — a 40-item list at 30ms each is 1.2s of
  the tail lagging. Past ~10 items the stagger stops reading as a cascade and
  starts reading as a loading state.
- **Stagger the *entry*, not the exit.** On the way out, drop the delay to zero so
  nothing lingers after the user has moved on.
- **Only stagger what is on screen.** Animate the visible group, not the whole page.
- **Do not animate the same property twice.** If the entrance uses `y` and the
  cascade also uses `y`, the two animations fight. Entrance on the container, cascade
  on the items.
- **Hold before you cascade.** Give the container a beat after it settles, then start
  the items. See [§4](#duration-holds-and-reading-time). A cascade that starts on the
  same frame as its parent's settle reads as one long smear.

### `transitionDelay` inside `animate` is silently ignored

A real bug worth knowing:

```jsx
// WRONG - framer accepts this and ignores the delay entirely.
<motion.div animate={{ y: 0, transitionDelay: 0.2 }} />

// RIGHT - delay belongs to transition.
<motion.div animate={{ y: 0 }} transition={{ delay: 0.2 }} />
```

Everything moves in lockstep and there is no error. If a stagger does not appear,
check this first.

---

## Scroll-driven motion

### The rule

Prefer **scroll-*driven*** to scroll-*consuming***. The first answers the reader's own
position. The second takes the scroll away from them.

**Driven** — a progress fill, a parallax layer, a sticky header that condenses. Costs
no extra travel.

**Consuming** — a pinned section where 600px of scroll travels one card, and the
card blurs as it leaves. Costs a lot of travel, hides the thing being read, and is a
High-severity motion-sensitivity trigger.

### If you pin anyway

- Never take over the wheel. No `preventDefault` on scroll, no scroll-jacking.
- Keep the pinned content **readable at rest**. Blur it and the reader has to
  remember it.
- One pinned sequence per page. A second one makes the first feel ordinary.
- Budget the travel honestly: if a section pins 5 items at 100vh each, that is five
  full screens for content that would take one.
- Every pinned state needs a no-pin equivalent.

### `useScroll` offset

```jsx
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start 0.85", "end 0.4"],
});
```

`["start <viewportFraction>", "end <viewportFraction>"]`. The values above say: start
filling when the target's top reaches 85% down the viewport, finish when its bottom
reaches 40%. Tuned so the progress is never complete while something is still below
the fold, and never empty while something above it is unread.

### `whileInView` margins are not decoration

```jsx
viewport={{ once: true, margin: "-10% 0px" }}
```

A negative margin shrinks the observation band, which stops a reveal firing for
content that has only just arrived. The consequence is that a negative margin
**legitimately leaves lower items un-triggered** while the section's top is in view.
That is correct behaviour. If you need every item settled, sweep the whole section
past the viewport.

### Smooth scrolling libraries

Lenis and friends replace native scroll with inertia. They feel good and they are
not free: scroll chaining, `position: sticky`, focus scrolling, and scroll-driven
animation all interact with them. Do not add one on top of an existing verified
scroll implementation for a subtle gain.

---

## Ambient and continuous loops

One per view, and it must be something the reader is not reading.

```css
/* A sheen that sweeps once every 7s and then rests at the end of its travel. */
.sheen {
  background-size: 220% 100%;
  background-position: 130% 0;
  animation: sheen 7s ease-in-out infinite;
}
@keyframes sheen {
  0%, 100% { background-position: 130% 0; }
  50%      { background-position: -30% 0; }
}
```

**A sweep, not a pulse.** A bounded object read left to right should announce itself
once and get out of the way. An endlessly repeating pulse drags the eye back to it
forever.

Freeze under `prefers-reduced-motion`, and pin to a sensible frame rather than
letting `animation: none` leave the element at its declared start — which is often
off-screen and reads as "the thing is only half drawn".

```css
@media (prefers-reduced-motion: reduce) {
  .sheen { animation: none; background-position: 50% 0; }
}
```

### A loop must return to its first frame

**[Standard]** This is the rule that separates a loop from a visible jump, and it applies
identically to CSS keyframes, GSAP `repeat: -1`, canvas loops and After Effects `loopOut`.

Frame 1 and frame N must be **identical**, not merely similar. Two failure modes:

- **Drift** — a loop driven by elapsed time rather than a modulo of the cycle length
  accumulates error and slowly desynchronises from the intended period.
- **Seam** — the last frame of the cycle differs from the first by a rounding step, which
  shows as a twitch once per cycle. On a slow 12-second gradient loop it is invisible; on a
  2-second one it is the first thing a viewer notices.

The discipline: derive the phase from the cycle position, never from a running total.

```js
// WRONG - accumulated state drifts, and `t` grows without bound
t += dt;
angle = t * speed;

// RIGHT - phase is always a pure function of the cycle position
const phase = ((t % period) / period) * Math.PI * 2;
angle = Math.sin(phase) * amplitude;
```

The same discipline is why `wiggle()` and `loopTime` modulo expressions in
[`motion-code-starters.md`](./motion-code-starters.md) are written as `time % loopTime`
rather than as accumulators.

### WebGL / canvas backgrounds

Keep them **behind** the content, `aria-hidden`, pointer-events-none, and frozen when
reduced motion is requested (`speed = 0`, no parallax). They are atmosphere; the
moment they compete with text they are noise.

---

## Reduced motion

### Reduce, do not remove

`prefers-reduced-motion: reduce` is a request for less *movement*, not less
function. Every state must remain reachable:

| Instead of | Do |
|---|---|
| animated reveal | instant, or a 1-frame cross-fade |
| carousel auto-advance | manual controls, no autoplay |
| parallax | static |
| smooth scroll | native scroll |
| looping background | frozen frame |

### Gate every animated prop yourself

Libraries do **not** disable `whileHover`, `whileTap`, or `animate` for you.

```jsx
const reduce = useReducedMotion();

whileHover={reduce ? undefined : { scale: 1.03 }}
whileTap={reduce ? undefined : { scale: 0.97 }}
transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 24 }}
```

### Infinite loops are an accessibility requirement, not a preference

An infinite animation with no pause control is exactly what WCAG 2.2.2 covers.
Cancel it, and pin the resolved state rather than removing the animation and leaving
the element at its hidden start:

```css
@media (prefers-reduced-motion: reduce) {
  .carousel-item { animation: none !important; }
  .carousel-item:first-child { opacity: 1 !important; }
  .carousel-item:not(:first-child) { opacity: 0 !important; }
}
```

---

## SSR and hydration

### The `useReducedMotion` trap

```js
// On the server:
useReducedMotion()  // -> null
// In the browser, on the FIRST render:
useReducedMotion()  // -> false, or true if the user asked for reduced motion
```

It reads `matchMedia` synchronously. So `reduceMotion !== false` is `true` on the
server and `false` in the browser — and any branch on it renders **two different
trees**. React reports a hydration mismatch on every page load.

```jsx
// WRONG - differs between server and first client render
if (reduceMotion !== false) return <Plain />;
return <Animated />;

// RIGHT - same branch on server and first client render
const reduced = hydrated && reduceMotion === true;
```

`useSyncExternalStore`-based `useHydrated` returns `false` for the server *and* the
hydration render, then `true`. Both sides take the same branch; the real preference
arrives one render later.

**This pairs with the transform-only rule, not with `opacity: 0`.** The gate above makes
the server and first client render agree by showing the *plain* branch until hydration
completes. That is only acceptable because the animated branch's initial state is a small
transform offset, not `opacity: 0`. If you gate on hydration *and* animate from zero
opacity, you have simply moved the no-JavaScript failure from "no JS" to "JS, first paint".

### Any state that changes rendered output needs this gate

Not just reduced motion. Anything reading a browser-only value synchronously —
`matchMedia`, `window.innerWidth`, a persisted preference, a feature detect — has
this problem.

The rule: **the server and the first client render must produce byte-identical
markup.** Gate the divergence, do not hope it matches.

### Do not branch on `typeof window`

`if (typeof window !== 'undefined')` inside a render is the same bug with a
different disguise.

---

## Contrast

### Opacity composites before contrast is evaluated

This is the most common accessibility bug in animated interfaces, and it is
invisible until measured.

```jsx
<div className="opacity-55">some muted body text</div>
```

Element opacity is applied to the rendered result, then that result is compared to
the background. Measured on a typical token set:

| text | at rest | at `opacity-55` |
|---|---|---|
| muted body, dark page | 7.7:1 | **3.01:1** |
| muted body, light page | 4.74:1 | **2.12:1** |

Both are WCAG AA failures for body text (4.5:1 required), and they get worse in the
light theme, which is the one people check least.

### How to emphasise without dimming

Move a **token** toward the foreground. Never toward transparency.

```jsx
// Emphasising one item must not mean un-reading the others.
const AT_REST    = "text-muted-foreground";   // unchanged, full contrast
const EMPHASISED = "text-foreground";         // moves toward the ink

<div className={active ? EMPHASISED : AT_REST}>…</div>
```

If you need a third state, use weight, size, or a rule — shape, not legibility.

### Check both themes

Light and dark are not inversions. A colour that clears AA on white frequently fails
on near-black and vice versa, because relative luminance is not symmetric.

### Non-text contrast: 3:1

Meaningful graphics — a chart line, a bar whose width encodes a value, an icon that
carries state — need 3:1 against their background. Purely decorative borders do not.

**The arithmetic that decides it.** If a surface sits at ratio *R* against the page
and you want to overlay a light highlight that keeps it above 3:1:

```
R_light_theme = (L_page + 0.05) / (L_fill + 0.05) = 3.54
  -> L_fill ≈ 0.247
overlay at alpha a over it, page is white (L = 1.0):
  need 1.05 / (L_fill(1-a) + a + 0.05) >= 3
  -> a <= 0.07
```

**7% alpha.** Invisible. So a sweeping highlight over a graphic that has to clear 3:1
is not a subtle choice — it is impossible. Either the graphic is decorative (and its
information is duplicated in text) or the highlight cannot exist. Decide which,
explicitly, rather than shipping the failure.

This is the same conclusion the timeline side reaches independently about gradients over
type: the overlay has a budget, and in both cases the budget is smaller than instinct
suggests. See [§29](#production-notes-and-borrowing-without-copying).

### Never measure `oklch()` by parsing the string

`getComputedStyle` returns `oklch(...)` in modern engines. Splitting it on digits
and treating the numbers as 0–255 RGB produces confident nonsense — it will report
1.17:1 for plainly readable text and wave through a real failure.

Resolve properly:

```js
// Paint the colour and read the pixel back.
const cv = document.createElement("canvas");
const cx = cv.getContext("2d", { willReadFrequently: true });
cx.fillStyle = pageBackground;
cx.fillRect(0, 0, 1, 1);
cx.fillStyle = textOrSurfaceColour;   // may carry alpha — this is the compositing
cx.fillRect(0, 0, 1, 1);
const [r, g, b] = cx.getImageData(0, 0, 1, 1).data;
```

Two traps:

1. **`getImageData` returns premultiplied values.** Compositing them against a
   background in JS applies alpha twice.
2. **A translucent background must be composited over every layer beneath it**, not
   just the first ancestor that looks opaque. Walk to the opaque backdrop, then paint
   bottom-up.

`canvas.fillStyle` cannot parse `color-mix()` with custom properties. For gradients
built that way, measure real screenshot pixels or reason arithmetically.

### Focus rings are non-text contrast

A focus indicator that fails 3:1 is not a focus indicator. Verify it in both themes,
against the actual surface it lands on.

---

## Performance

### The list, in order of how often it is the problem

1. **Layout-thrashing** — reading layout inside a loop that writes layout.
   Cache the measurement.
2. **React re-renders per frame** — pointer or scroll position in state. Use motion
   values.
3. **Animating layout properties** — `width`, `height`, `top`, `left`. Put the size
   on a child and scale it.
4. **Permanent rAF** — a loop with no stop condition.
5. **`backdrop-filter`** — re-samples everything behind it. Small radius, few
   elements, never over moving content.
6. **`filter: blur()`** on a large area — re-rasterises per frame. Fine on a 200px
   heading, not on a full-screen layer.

### FLIP / layout animation

When one item changes size and its siblings must move, let the library measure:

```jsx
<motion.li layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
```

Only mount it on elements that actually reorder. A `layout` prop on a list that never
moves is a measurement taken every render for nothing.

### Layer promotion

Promote only elements that move continuously. `will-change: transform` on many
elements is worse than none — each layer costs memory.

### One runtime, not three

Multiple animation libraries mean multiple clocks, multiple `matchMedia` reads, and no
coherence between them. Pick one per project. This is worth stating separately from the
performance list because it is a design decision with a performance symptom.

---

## Measurement and debugging

Most confidently-wrong claims about motion are wrong in a way a screenshot shows and
an assertion catches.

### Animate something and check it moved

Do not assert "it has a transition". Assert the value **changes**:

```js
const before = read();      // matrix, or the custom property, or the rect
await movePointer(x, y);
await wait(600);
const after = read();
assert(after !== before);
```

And prove it is a spring rather than a snap by sampling **mid-flight** — read 60ms
after the input and confirm it has not arrived yet.

### Dispatch real input

```js
// WRONG - synthetic MouseEvents do not produce pointer events
el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

// RIGHT - generates pointer + mouse events, as a user would
await input.dispatchMouseEvent({ type: "mouseMoved", x, y });
```

Three related traps:

- A pointer already inside the target means **no new enter event fires**. Park it
  away first.
- A target at `y: -200` is off-screen. **Assert the target is in the viewport before
  dispatching at it.**
- Measure during the animation, not after. `whileInView` with `once: true` drops its
  transform when it settles, so `transform: none` afterwards is the *correct* state
  and asserting on it "fails" working code.

### Sample in-page, not across the boundary

Reading a 400ms animation one round-trip at a time gives you four arbitrary
samples. Run the whole trace inside the page on `requestAnimationFrame` and return
the series.

If `scroll-behavior: smooth` is set globally, `scrollIntoView()` smears the scroll
itself over hundreds of milliseconds and the moment you care about drifts between
calls. Pass `behavior: "instant"`.

### Selector lists are unions

```js
// WRONG - a comma is a union: "#a h2" OR any "h3" OR any "h4", document-wide
document.querySelectorAll("#achievements h2,h3,h4");

// RIGHT
document.querySelectorAll("#a h2, #a h3, #a h4");
```

### Check the target exists before asserting on its behaviour

An assertion that silently reads `undefined` from a `null` and compares it against
`0` will pass or fail for reasons unrelated to the thing under test. Probe for the
element first and fail loudly.

### Transparent is `rgba(0, 0, 0, 0)`

`getComputedStyle(el).backgroundColor === "transparent"` is false in most engines.
Resolve the alpha rather than matching the string, or the nearest-opaque-background
walk stops on the first element and paints your probe black.

### Verify what you cannot see

Headless Chromium does not reliably composite `backdrop-filter` or `mix-blend-mode`.
A `backdrop-filter` element can render identically with and without the filter and
still pass. Do not conclude that a glass effect works because two screenshots match —
check in a real browser, and do not build an information-carrying element on an effect
you cannot verify.

---

## Interface anti-patterns

| Pattern | Why it fails |
|---|---|
| `opacity: 0` initial on content | Invisible forever without JS |
| `opacity-50` to de-emphasise | Contrast failure, worse in light theme |
| `transition-colors` as the *only* response | Reads as a stylesheet, not an object |
| Hover as the only path to anything | Never fires on touch |
| Spring on a colour or a percentage | Overshoot on a value is a lie |
| Animating `height` in a scroll loop | Reflow per frame; feels sticky |
| Infinite loop next to body copy | Competes with reading |
| Two pinned sections on one page | The second makes the first ordinary |
| Scroll-jacking | Motion sickness; breaks expectations |
| `backdrop-filter` over moving content | Re-samples every frame |
| `transform` on an element with `backdrop-filter` | The filter samples the wrong thing |
| `will-change: transform` everywhere | Layer explosion |
| A permanent rAF | Nothing ever sleeps |
| Reducing motion by shortening it | Still motion; the request was for less |
| A tilt on a focusable non-interactive element | Decoration in the tab order |
| Multiple animation libraries at once | Three clocks, three `matchMedia` reads, no coherence |
| Cascade starting on its parent's settle frame | Reads as one smear, not a sequence |
| Text animated in with no static reading time | The animation *is* the hold, so nobody reads |

---

# Part C: Motion for film and video

Everything in Part C assumes the other register: you are driving it, the duration is fixed
in frames before it is rendered, and it cannot be interrupted. Most of the advice in
[Part A](#part-a-foundations) about springs does not apply. What *does* carry over is the
register ladder, the discipline of one signature idea per piece, and the refusal to
decorate.

---

## Decision flow: job, tone, platform

```
1. What is the video's job?
   Sell / Explain / Show a product / Build a brand / Entertain
        |
2. What is the tone? (pick ONE)
   Calm-premium | Friendly-playful | Techy-precise | Bold-energetic | Editorial-cultural
        |
3. What is the platform?
   Vertical social | Landscape web/YouTube | App Store / product page | Presentation
        |
4. Pick ONE signature technique (Section 19), then 2 supporting ones.
        |
5. Lock the motion language (Section 20) before animating anything.
```

Step 2 is the one people skip, and tone is what determines easing, shape language and
rhythm simultaneously. Picking the tone *after* picking the effect is how a "calm premium"
brand ends up with a glitch transition.

---

## Signature technique by job and tone

| Job and tone | Signature technique | Supporting | Seen in references |
|---|---|---|---|
| Explain an app feature, friendly | **One object morphing through states** | Cursor, highlighter marks, soft glass | V2 |
| Product launch, techy | **Chaos-to-order story** (dark to light) | Line draw, radial fan, real UI | V1 |
| Tagline or mission, bold | **Kinetic type flow** (sentence scrolls as it builds) | Gradient text, counter punchline | V4 |
| Title or logo name, playful | **Per-letter shape-shifting** (short words only) | Motion blur, tracking animation | V5 |
| Educational reel, editorial | **Cutout objects as visual metaphors** | Serif/sans mix, ghost text, starbursts | V6 |
| Brand film, organic | **Recurring carrier shape** (mascot) | Dark/light alternation, floating UI cards | V7 |
| Design-resource reel | **Template + palette swatches** | Slow animated mesh gradient | V8 |
| Long promo with structure | **Chapter tabs** | Text cards alternating with footage | V3 |

**One signature technique per video.** The failure mode is applying the signature to every
shot, at which point it stops being a signature and becomes a tic. It should be unmistakable
in two or three places and absent everywhere else.

---

## Lock the motion language

Write these seven decisions down before you open the animation software. This is the
single highest-value step in the whole process, because it converts every later choice from
a fresh judgement into a lookup.

| Decision | Options | Why it matters |
|---|---|---|
| **Easing family** | Expo-out (premium), spring (app-like), back-out (playful), in-out (neutral) | Easing is the personality of the motion |
| **Shape language** | Rounded (friendly), angular (energetic), organic blobs (soft), geometric grid (technical) | Keeps morphs and icons coherent |
| **Transition type** | Morph, mask wipe, push, zoom-through, match cut, whip pan | Limit to 3 types per video |
| **Camera** | Locked, slow push, parallax, orbit, handheld | Camera movement sets the mood |
| **Type behavior** | Line mask-slide, word stagger, per-letter, blur-in | Type reveals carry most of the message |
| **Background** | Flat, mesh gradient, grid, footage, grain | Gradients: slow only |
| **Rhythm** | Fast and cut-heavy, medium, slow and flowing | Decides durations |

If a decision is not in this table, you are inventing per shot, which is where inconsistency
comes from. Add rows when a project needs them, but add them deliberately.

The template in [`motion-project-templates.md`](./motion-project-templates.md) has these
seven rows plus four more (tone, signature technique, supporting techniques, palette). The
"differ from the previous project" check applies to **these seven**, not to all eleven.

---

## The anti-repetition system

Reusing the same combination of easing, shape language and transition across every project
is the most common way a body of work starts to look like one person's output rather than
one person's taste. Four mechanisms, in order of how much they help:

1. **Keep an effect log.** One row per finished project: signature technique, easing, shape
   language, transitions, background, and what you would change. Review it *before* starting
   the next project, not after.
2. **Differ in at least 3 of the 7 decisions** from
   [§20](#lock-the-motion-language). Three is enough to be visibly different; one is a
   coincidence.
3. **Budget the piece.** 1 signature technique, 2 to 3 supporting, 3 transition types
   maximum, 1 background style. Exceeding any of these is the single clearest sign of a
   video that has no point of view.
4. **Test before adding an effect:** *"If I remove this, does the message get weaker?"* If
   no, remove it.

Then rotate your sources. Study motion from film titles, UI design, print and typography,
motion design theory — not only from other motion reels, because reels are the most
homogenised reference category that exists.

The same mechanism applies to interface work. A codebase where every component uses the
same spring preset and the same fade-up entrance reads as a template, and the fix is
identical: pick the preset deliberately per interaction type, and log it.

---

## What the reference set shows, and what it cannot show

This section describes eight reference videos and three stills supplied for analysis. It
states its own confidence, because a large part of the original write-up did not.

### Claims and their status

| Claim | Status | Confidence |
|---|---|---|
| Lengths, aspect ratios | File metadata. Directly checkable. | High |
| Whether a file has an audio track | File inspection. Directly checkable. | High |
| Hard cut counts | Sparse frame sampling, **not** consecutive-frame differencing | **Low, treat as ±2** |
| Audio onset positions | **Not established** — see below | **None** |
| Audio/visual alignment percentages | **Removed** — see below | **None** |
| Sub-second timings inside a clip | By-eye reading of a low-rate preview | Medium, boundaries ±0.2 s |

### Why the alignment numbers were removed

The source analysis contained two incompatible method descriptions. One stated that twelve
evenly spaced frames were sampled per video and that audio could not be heard; the other
claimed ffmpeg scene-change detection at a 0.35 threshold plus spectral-flux onset
detection with an 80 ms alignment window, and reported alignment percentages from those
detections.

Those cannot both be true:

- **Spectral-flux onset detection requires access to the audio track.** If the audio was not
  heard or decoded, no onsets were detected, and any alignment figure derived from them is
  not a measurement.
- **Twelve evenly spaced frames cannot detect hard cuts.** A cut falling between two samples
  — 2.6 s apart in a 31 s video — is invisible to that method. Exact cut counts are not
  derivable from it.
- **The reported sample sizes were too small for the conclusion drawn from them.** The
  strongest claims ("short UI pieces sync tightly to audio") rested on 3 events and 2 events.
  A percentage of 100% from two events is not evidence of anything.
- **One entry contradicted its own breakdown.** V2 is listed as having zero hard cuts while
  its video-by-video description records a cut to a dark scene.

Shipping those numbers into a reference document would have been worse than shipping
nothing, because they are precise, they look authoritative, and they would be quoted back.
The qualitative observations that survive do not depend on them, and those are kept below.

If you need real numbers, the method that produces them is: decode the audio, run
`ffmpeg` scene detection with `select='gt(scene,0.35)'` on **every** frame, run an onset
detector on the decoded waveform, and report counts with their sample sizes. That analysis
has not been run.

### The reference set

| # | Video | Format | Length | Cuts (approx) | Audio | Register |
|---|---|---|---|---|---|---|
| V1 | AI product launch, "too many signals" to "One place to Discover." | 16:9 | 31 s | ~7 | yes | Rung 5, chaos-to-order |
| V2 | App UI micro-animations (to-do card, toggle, book widget) | 1:1 | 11 s | 0 to 1 | yes | Rung 2 to 3 |
| V3 | "HowDo" promo template (Intro / Problem / Use Case / CTA) | 4:3 | 44 s | ~3 | yes | Rung 3, structured |
| V4 | Kinetic text, "Give your team superpowers" | 16:9 | 8 s | 0 | **silent** | Rung 5 |
| V5 | Text transitions, "Creative & Smooth Motion" | 9:16 | 5 s | 0 | yes | Rung 5 |
| V6 | Web Rank Studio, "Motion design is strategic" | 9:16 | 19 s | ~6 | yes | Rung 4, editorial |
| V7 | Green brand video, "Turning ideas into experiences" | 16:9 | 47 s | ~4 | yes | Rung 3 to 4 |
| V8 | Social carousel as video, gradient palettes | 9:16 | 25 s | ~6 | **silent** | Rung 1, calm |

### What survives the corrections

These are observations from watching, and they hold regardless of the removed statistics:

- **Cuts are rare; scene changes are made by motion.** Three of the eight have no hard cuts
  at all, and the longer pieces average only three to seven across 30 to 47 seconds. Wipes,
  morphs and zooms carry the structure. This is the most transferable finding in the set
  and it is directly visible in the frame sampling.
- **Two of the eight are silent.** V4 and V8 have no audio track, which strongly suggests
  silent autoplay feeds. **If your video will be seen muted, the motion has to carry the
  rhythm** — see [§33](#review-checklists).
- **Vertical content feels faster than landscape.** The three vertical pieces are the most
  cut-heavy and the most rhythmically busy. With a sample of eight this is an impression to
  test on your own account, not a rate to design around.
- **The V2 hold.** A folder grows, overshoots, settles, then sits nearly still for about a
  second before the second morph. Boundaries are ±0.2 s from a low-rate reading. This is the
  single most useful timing observation in the set and it is discussed as a technique in
  [§4](#duration-holds-and-reading-time).
- **Sound design is part of the motion.** In the pieces that have audio, the strongest
  visual moments land on obvious sound hits — V2's click, V5's scatter-and-regroup. This is a
  qualitative read of a handful of clips, not a statistic, and it is the reason
  [§30](#workflow-brief-to-export) puts sound design at step 9 rather than at the end.

### Two production notes from the set

- **V5 has no rotation tag and its content is drawn sideways inside a portrait canvas.** It
  plays sideways on a phone. If you reuse the idea, build it upright.
- **V6 is about motion design and demonstrates what it describes.** A video whose subject is
  its own technique has no licence to be sloppy about either.

---

## The reference set, video by video

Condensed to what is reusable: the structural idea, the techniques, and the recipe. The
full frame-by-frame narration is not reproduced because it is observation, not instruction.

### V1: AI product launch (31 s, 16:9)

**Structure.** Black screen scattered with symbols and guide lines around "too many signals"
— chaos. A wavy line with a glowing point splits into branches ending in labelled icons.
Concentric blue rings expand around "connected." — the turning point. Then a light, airy
search UI over a beach, a radial fan of poster cards from a send button, a code editor with
an error being fixed, and a node map that grows into a literal tree.

**Techniques.** Problem-to-solution colour story; line draw and branching via trim paths;
radial fan for "many results"; real UI on nature footage to humanise a technical product;
check-mark list animation; data-map-as-tree metaphor.

**Recipe.** Start dense and dark, resolve into light. One accent colour reserved for the
solution. Connecting lines draw over about 1 s with ease-out, then labels pop on a short
stagger. Keep exactly one turning-point moment and make it the biggest thing in the video.

**Use for.** AI tools, productivity, any "we simplify chaos" story.

### V2: App UI micro-animations (11 s, 1:1)

**Structure.** A frosted-glass folder opens and a yellow-topped note card rises out. The
card shrinks into a checklist, items get struck off with a hand-drawn highlighter stroke.
Cut to dark: a "Let's start" pill whose arrow morphs into a toggle, then the pill becomes an
orange book widget showing progress, expands into a card with a weekly tracker, and
compresses into an app icon.

**Techniques.** One continuously transforming object with no scene changes; animated hand
cursor with a click; highlighter strike marks as trim paths; glass and blur on the folder;
background swap from white to near-black to make orange pop; Dynamic-Island-style morphs.

**Recipe.** Keep every shape on one corner-radius family or the morphs will not read as the
same object. Morph 0.4 to 0.7 s, ease-in-out, with a small overshoot on arrival. The cursor
arrives slightly *before* the click and travels a curve, never a straight line. Hold about a
second between morphs.

**Use for.** App previews, feature highlights, onboarding. The best template here for "one
screen, many states".

### V3: "HowDo" promo template (44 s, 4:3)

**Structure.** The whole piece sits inside a frame with a header and four labelled tabs —
Intro, Problem, Use Case, CTA — the active tab tracking progress. Intro is a brand name over
a phone mockup with floating icons. Problem is short text lines on a white card with a soft
purple wave. Use case alternates monitor mockups, stock footage and product shots. CTA is
"Learn it", then the logo over clouds.

**Techniques.** Chapter tabs as a progress UI; kinetic text on clean cards with an ambient
wave; an orbiting ring of image tiles; footage and mockups alternating with text cards as
visual rest; a soft purple-to-pink gradient wrapper.

**Recipe.** Alternate text card, footage, text card, mockup. Never two text cards in a row
for long. Text appears two to four words at a time, holds about 1.5 s, and leaves with a
short blur or slide. A tab bar makes a long video feel structured and costs almost nothing.

**Use for.** Explainers, startup promos, four-part social ads.

### V4: Kinetic text, "Give your team superpowers" (8 s, 16:9)

**Structure.** "Give" in pink on a light background. The line extends word by word while
earlier words slide left and fade, so the newest word stays centred. A cursor underlines
"superpowers". Background flips to white with a purple-blue blur blob behind large bold text.
Concentric pills pulse behind a small pill that fills with "9x better", then "10x better".

**Techniques.** Marquee-style text flow keeping the newest word centred; gradient text;
blurred colour blobs for depth; a counter in a pill where the number change is the punchline;
concentric shapes rippling around the focal element.

**Recipe.** One idea per screen; switch background between sentences to reset attention.
Counters ease out and hold the final value at least a second. Keep text size constant within
a sentence and change it only between sentences.

**Use for.** Taglines, mission statements, opening or closing lines.

### V5: Text transitions, "Creative & Smooth Motion" (5 s, 9:16)

**Structure.** "Creative" appears with compressed letter spacing that opens up. "Creative &
Smooth" builds, then letters break from the line, scatter and spin into circular and spiral
clusters, blur with motion, and converge into a clean final word.

**Techniques.** Per-letter animation on paths; motion blur selling speed; layout
shape-shifting from line to circle to spiral to line; letter-spacing animation; a plain
gradient backdrop so the type does all the work.

**Recipe.** Per-letter motion for **short words only**, one to three words — on a long
sentence it becomes unreadable. Always land on a clear, stable word and hold it. Motion blur
on, shutter angle around 180 degrees, and give the letters a clean landing pose.

**Use for.** Title cards, logo name reveals, reel intros.

### V6: Web Rank Studio, "Motion design is strategic" (19 s, 9:16)

**Structure.** "EVER WONDERED?" on a purple label over an orbiting brain. *stick in your
mind?* with the brain and a giant ghost word behind. A white starburst on purple reading
"it's no Accident" beside a flat-illustrated person slipping next to a caution sign. "Motion
Design" with an eyeball cutout and a purple cursor. A vintage TV and a hand holding a card.
"Animated text Captures Eyes instantly". A glowing blue line chart in a dark frame. "this
isn't Decoration" with a classical column, then "it's Strategic Movement." with a chess king.

**Techniques.** Cutout objects as literal metaphors — brain for memory, eye for attention,
chess king for strategy, column for decoration; serif, italic and bold sans mixed for an
editorial register; ghost text for depth; starbursts as energetic corner accents; a grid
pattern on solid purple; alternating backgrounds to pace the story.

**Recipe.** For every phrase find one object that embodies the idea. Maximum two type styles
— vary weight and italic, not family. Use the one saturated brand colour on roughly a third
of the scenes to hold identity.

**Use for.** Vertical social explainers, agency promos, educational reels.

### V7: Green brand video, "Turning ideas into experiences" (47 s, 16:9)

**Structure.** Dark green gradients with a lime accent and a flower-shaped mascot that moves,
spins and transforms throughout. "Everything starts with a Spark" with a highlighted pill and
cursor. A pill morphs into a ring, a flower, and text over blurred footage. A light cream
scene with giant ghost text "CLARITY" and a green curved ribbon framing a photo. A dashboard
of floating UI cards. A tall glass shape and a circle with the flower. "All crafted to move."
Then "Ready to grow?"

**Techniques.** A recurring mascot as visual glue and as the thing that triggers transitions;
highlighted words via a lime box and weight; a curved ribbon as a frame; a floating UI card
cluster to show breadth; dark/light alternation for energy versus clarity; outline versus
filled versions of one shape for variety.

**Recipe.** Invent one small brand element and use it as the carrier for transitions — this
is what makes the video feel designed as a system rather than assembled. Keep a limited
palette. Use outline and filled versions of the same shape to get variety for free.

**Use for.** Brand identity films, design agencies, SaaS "who we are".

### V8: Gradient palette social video (25 s, 9:16)

**Structure.** A light page with a gradient card tilting, then more cards stacking behind it.
Full-screen gradient scenes — Rosé Sunrise, Aurora Blossom, Jade Horizon — each with four
swatches and hex codes at left and the palette name in large white sans-serif. Gradients
drift slowly. End card with a save prompt and a creator handle.

**Techniques.** Animated mesh gradients with grain and a faint grid; hex codes as functional
content that gives the viewer real value; one consistent layout across every scene; slow
drift; a platform-native save call to action.

**Recipe.** Template once, swap colours — this is how you produce series content. Gradient
loops of 8 to 15 s with no sudden changes, plus 2 to 4% noise to prevent banding. Keep text
high contrast against the gradient: white on saturated, dark on light.

**Use for.** Design-resource reels, carousels as video, brand colour presentations.

---

## The three stills

### Still 1: "It's [shapes] time to [burst] [squiggle] draw"

A light grey canvas with a selection box around the text, suggesting a drawing or shape-tool
tutorial. Text mixed with inline graphics: an orange circle, blue square, pink triangle on
a thin underline, a blue spiky burst, and a pill containing a multicolor squiggle.

- **Idea.** Replace words with shapes so the graphic becomes part of the sentence.
- **Animate.** Shapes pop with scale overshoot, the squiggle draws via trim paths, the burst
  spins slowly, the underline draws left to right.
- **Note.** Gradient fills make flat shapes feel current without extra geometry.

### Still 2: "Thank You, bye!"

Warm off-white. Bold black sans "Thank You," beside hand-lettered coral script "bye!". Fruit
stickers on coloured circles.

- **Idea.** Two contrasting type styles plus sticker illustration for personality.
- **Animate.** Stickers drop in with squash and stretch, a slight rotation wobble, settling
  at slightly different angles. The script can draw on or pop with overshoot.
- **Good for.** Friendly end cards. Wrong on serious corporate work.

### Still 3: "portfolio" with creative designer badge

Large black serif "portfolio" with inner blur distortion on some letters, a glass arrow icon
with circular "CREATIVE DESIGNER" text around it, small tag pills, and a pink-to-orange
gradient blob.

- **Idea.** Luxury editorial mix — high-contrast serif, soft gradients, a glass 3D icon.
- **Animate.** Letters reveal blur-to-sharp, circular text rotates slowly, the glass arrow
  floats and catches a single light sweep, tag pills slide in on a stagger, the blob drifts.
- **Good for.** Portfolio intros, personal brand reels.

---

## Techniques menu

Use this as a menu. Per [§21](#the-anti-repetition-system), choose **one signature technique
per video** and do not repeat the same combination every time.

| Technique | Seen in | Best for | Don't overuse because |
|---|---|---|---|
| **One object morphing through states** | V2, V4 | App previews, feature walkthroughs | Needs consistent shape language |
| **Chaos to order colour story** | V1 | Problem/solution launches | Needs a clear turning point |
| **Per-letter shape-shifting type** | V5 | Short titles and logos | Unreadable on long sentences |
| **Cutout objects as visual metaphors** | V6 | Explainers, educational reels | Cutouts need consistent lighting and shadow |
| **Recurring mascot / carrier shape** | V7 | Brand films | Needs a genuinely well-designed shape |
| **Animated mesh gradient backgrounds** | V3, V4, V8 | Modern tech and creative content | Keep slow; keep text contrast |
| **Chapter tabs / progress UI** | V3 | Long promos | Not needed under 20 s |
| **Hand cursor with click** | V2, V4, V6, V7 | UI or "interactive" feel | Keep the path smooth and curved |
| **Floating UI card cluster** | V7 | Showing product breadth | Cards must stay legible when static |
| **Radial fan / orbit of items** | V1, V3 | "Many options / much content" | The centre loses focus |
| **Line draw and branching** | V1 | Connections, networks, flows | Needs clean icon labels |
| **Ghost text behind main text** | V6, V7 | Depth in typographic scenes | Keep it low contrast |
| **Highlighter stroke / underline draw** | V2, V4, Still 1 | Emphasis | One per sentence |
| **Palette swatches + hex codes** | V8 | Design-content reels | Content must be genuinely useful |
| **Sticker illustrations** | Still 2 | Playful brands, end cards | Wrong for serious or luxury brands |
| **Blur-to-sharp reveals** | V4, Still 3 | Premium, calm reveals | Keep the blur short |

---

## Why these read as professional

1. **Continuous motion over cuts.** Most of the set transforms one thing into the next
   instead of cutting. Plan transitions as part of the design, not as separate effects
   layered on afterwards.
2. **One focal point at a time.** Even in the busiest scenes, only one thing is the star.
3. **A strict palette per video.** V6 is purple, black and white. V7 is green, lime and
   cream. V8 is one gradient family per scene.
4. **Typography does real work.** Weight changes, highlighted words, ghost text and italic
   serif contrast carry emphasis without extra effects.
5. **Rest between busy moments.** A white card or a footage break after dense graphics gives
   the eye somewhere to go.
6. **Consistent geometry within a register.** Rounded and soft in app-style work (V2, V4,
   V7); sharp and angular only where energy is the point (V6's starbursts).
7. **Light interactivity cues.** A cursor, a click ripple, a toggle make a video feel like a
   real product.
8. **A strong end card.** V6, V7 and V8 all finish on a clear, calm closing frame, and hold
   it.

---

## Typography, shape and colour

### Shape and icon rules

- One stroke weight, one corner-radius family, one style (line, filled or duotone) per video.
- **Animate meaning.** A bell rings, a lock clicks, a graph climbs, a paper plane flies. An
  icon that only scales is a picture of an icon.
- Trim paths for line icons, scale-with-overshoot for filled icons, morph for state changes.
- Shape psychology: circle friendly and complete, square stable, triangle directional, blob
  organic, line connective.

### Typography rules

- **Two typefaces maximum.** Change weight and italic for variety rather than adding fonts.
- Per-letter animation only on one to three short words.
- Ghost text — large, low contrast, behind — adds depth cheaply.
- Highlight key words with colour, weight or a marker box.
- **Safe zone:** keep key text in the central 70% of vertical frames, away from platform UI.
- Animated text needs its static time budgeted separately from its animation, per
  [§4](#duration-holds-and-reading-time).

### Colour and light

- Three to five colours. One accent reserved for what matters.
- Gradients move slowly, 8 to 15 s loops. Add 2 to 5% grain, or you will get banding.
- Glass: backdrop blur, a 1 px light edge, a soft inner highlight, a soft shadow.
- Text over a moving gradient still has to clear contrast. White on saturated, dark on
  light, and verify against the *brightest* frame of the loop rather than the average — the
  same compositing arithmetic that governs [§14](#contrast) governs here.

---

## Effects catalogue

### Transitions

| Transition | Use when | Avoid when |
|---|---|---|
| Morph (object becomes next object) | Feature walkthroughs, app states | Shapes are unrelated |
| Match cut | Two scenes share a shape | Nothing in common |
| Shape or mask wipe | A brand shape can carry the move | Already used several wipes |
| Push or slide | Steps in a sequence | Emotional, slow content |
| Zoom-through | Overview to detail | Rapid cutting |
| Whip pan | Energetic social ads | Premium calm brands |
| Cross dissolve | Time passing, emotion | Fast promos |
| Cut on action | Fast pace | Rarely wrong |
| Glitch | Techy or gaming | Finance, wellness, luxury |
| Liquid or ink morph | Beauty, music, creative | Corporate data |
| Light leak or flash | Cinematic, events | App UI |

### Reveals and text

Mask reveal (default), scale and fade (subtle), trim-path draw-on for lines and handwriting,
stagger cascade for lists, blur-to-focus for cinematic, light sweep for logos (once only),
typewriter for code and chat, scramble for tech (once), kinetic flow for taglines.

### Backgrounds

Flat plus grain (safe), animated mesh gradient (modern SaaS, keep slow), aurora blobs (soft,
AI), grid (technical), particles (sparse only), footage with a dark overlay (human stories).

### Overused effects — use rarely

Glitch, heavy lens flare, constant bounce or elastic, spinning transitions, particles
everywhere, neon on everything, extreme 3D extrusion, zoom punches every two seconds.

---

## Production notes, and borrowing without copying

### Technique notes

- **Soft gradients.** Build from large blurred shapes (fractal noise or Gaussian blur) with
  slow position keyframes, then add grain on top.
- **Glass.** Blurred backdrop, 1 px light border, soft inner highlight, subtle drop shadow.
  Note the interface-side cost of the same look in
  [§15](#performance): `backdrop-filter` re-samples every frame.
- **Cursor.** A vector hand or pointer with its own scale-down on click plus a ripple.
  Always curved, never linear.
- **Highlighter strokes.** A shape layer with a semi-transparent stroke and trim paths, with
  slightly irregular thickness so it reads as drawn.
- **Per-letter animation.** In After Effects, a Text Animator with a Range Selector; in code,
  split into spans. See
  [`motion-code-starters.md`](./motion-code-starters.md).
- **Mascot / carrier shape.** Build as a shape layer with parametric controls — scale,
  rotation, petal count — so one rig can appear in many scenes.
- **Vertical video.** Keep key text in the middle 70% of the frame.

### Borrowing without copying

- Take the **technique**, not the look. "One object morphing through states" can be a
  notebook, a payment card or a car dashboard in your own colours.
- Change at least three variables: palette, shape language, type style. This is the same
  rule as [§21](#the-anti-repetition-system), applied to a reference rather than to your own
  back catalogue.
- Keep a swipe file of what you borrowed and rotate away from it next project.
- **If a reference is a purchased or licensed template, do not republish its structure,
  assets or branding.** Study the pacing and layout logic; build your own. V3 reads as a
  template.

---

# Part D: Making and shipping

## Workflow: brief to export

```
1. Brief ............... goal, audience, platform, length, CTA, brand rules
2. Motion language ...... the seven decisions, Section 20
3. Script ............... short lines, about 3 words per second reading speed
4. Style frames ......... 3 to 5 still key frames approved before animating
5. Storyboard/animatic .. rough timing against the audio
6. Block ................ key poses and positions only
7. Ease .................. shape the curves in the graph editor
8. Secondary motion ..... overlap, follow-through, blur
9. Sound design ......... hits on the 3 to 5 key moments, ambient bed
10. Finish ............... colour, grain, safe-margin check
11. Review ............... phone, muted, full screen
12. Export ............... per platform
```

Steps 4 and 5 are the ones that get skipped, and skipping them is what produces the
"animatic that fought the design" problem. **Three to five approved stills cost an hour and
save a day.** Animating before the look is signed off means re-animating after every round
of feedback, because every colour or layout change invalidates the curves.

Step 9 is placed before finishing deliberately. Sound is part of the motion, not a layer
applied at the end — see the observation in
[§22](#what-the-reference-set-shows-and-what-it-cannot-show).

Fill-in versions of steps 1 and 2 are in
[`motion-project-templates.md`](./motion-project-templates.md).

---

## Export cheat sheet

| Need | Format |
|---|---|
| Social and web | H.264 MP4 |
| Master or editing handoff | ProRes 422 or 4444 |
| Transparent | ProRes 4444 with alpha, or WebM with alpha |
| In-app animation | Lottie JSON or Rive |
| Vertical 9:16 | 1080 x 1920 |
| Landscape 16:9 | 1920 x 1080 or 3840 x 2160 |
| Square 1:1 | 1080 x 1080 |

**Frame rate is not in this table because it is not a per-platform constant.** It is a
project decision that must be made before the timing sheet is built, since every frame
number depends on it. Choose it once, set the sequence to match, and never relink footage
at a different rate without re-timing.

App Store and store-listing preview specs change often, as do platform bitrate and safe-area
rules. Check current requirements before exporting rather than trusting this table.

---

## Tools

### Code-based video

| Tool | Notes | Confidence |
|---|---|---|
| **Remotion** | Renders React components frame by frame. Useful when the video's content is data — charts, generated gradients, templated social output — because the composition becomes a template. | API shape stable. **[Verify]** Licensing is tiered by company size and has separate terms for automated pipelines and Player embedding. Pricing and thresholds have changed before. Confirm on `remotion.dev/docs/pricing` before shipping commercially. |
| **GSAP** | Timeline-based, with the best scroll and sequencing tooling of the JS options. Excellent for planning sequences even if you finish the shot in After Effects. | **[Verify]** Licensing changed after Webflow's acquisition — the formerly paid plugin suite is reported to have become free. This document does not assert that as fact. Confirm current terms rather than assuming either way, and check any genuinely third-party plugin separately. |
| **Three.js / React Three Fiber** | Real 3D. Either record the render or capture frames. | API stable; large bundle. |
| **Motion (Framer Motion)** | React UI animation with spring physics. The right tool for Part B, and usable for simple timeline work. | Stable. `motion` is the current package name; `framer-motion` is the legacy alias. Pick one. |

### Desktop production

| Tool | Use for |
|---|---|
| **After Effects** | 2D and 2.5D motion graphics, expressions, plugins. Industry standard. |
| **Premiere Pro / DaVinci Resolve** | Editing, colour, audio, final assembly |
| **Cinema 4D / Blender** | Real 3D, product renders, 3D logos |
| **Cavalry** | Procedural 2D, patterns, data-driven motion |
| **Rive, Lottie** | Interactive and lightweight in-app animation; export Lottie JSON from After Effects |
| **Figma, Jitter** | Quick UI animation for social clips and app promos |

### Web component libraries for video plates

The genuinely useful technique here: **build the effect in a browser, record it at a known
frame rate, and import it as a layer.** It gets you shader effects without a 3D pipeline.
Two obligations: check the library licence for commercial use and attribution, and keep the
animation time-based so it does not change speed when the capture rate differs from the
screen rate.

| Library | Status |
|---|---|
| **Skiper UI** (`skiper-ui.com`) | Animated Next.js components on shadcn/ui — animated numbers, text scroll, mouse-follow, animated icons, CSS-only link effects. Mix of free and Pro. **[Verify]** free use carries an attribution requirement, and many components are described by the author as recreations of existing designs. Check per component. This repository contains Skiper-derived code (`skiper26.tsx`, the theme-switch animation), so its attribution terms apply here. |
| **Unlumen UI** (`ui.unlumen.com`, also on 21st.dev) | shadcn registry with components including gradient-sweep text reveal, animated dock, 3D tilt wrapper, animated file tree, count-up, per-character subtitle reveal. **[Verify]** some components MIT, others show no licence on 21st.dev — check per component. Installing from 21st.dev needs an API key. |
| **OriginKit** (`originkit.dev`) | Free animated component library with an MCP server; requires a free API key. **[Verify]** terms. |
| **Liquid Glass** (`@ybouane/liquidglass`) | npm WebGL shader applying refraction, blur, chromatic aberration and lighting to HTML elements. Layered glass supported. Good for glass UI plates. |
| **liquidGL** (`liquid-gl`) | Ultra-light WebGL glass for fixed-position elements. Docs list real-time refraction of video and text animation as supported and **CSS animations as not supported** — check that before planning a capture. |
| **liquid-glass-js** (dashersw) | WebGL Apple-inspired glass with container and button classes, using `html2canvas` for page sampling. Heavier, demo-oriented. |
| React Bits, Aceternity UI, Magic UI, SmoothUI, RetroUI, Neobrutalism, 8bitcn | **[Verify]** described from general knowledge, not re-checked in this pass. |

**Not verified.** Searches did not return reliable pages for **Bencho.dev**,
**Componentary**, **ThreeUI**, **Animmasterlin.dev** or **Vengeance UI**. Note that
`animmasterlin.dev` and `animmasterlib.dev` are near-identical strings for different things —
the latter appears to be a real paid component library. Typosquatted or abandoned
`.dev` domains in this space are common; open the URL from a source you trust rather than
from a list.

**Also unverified:** SuperDesign (previously described as an AI design tool without
confirmation) and Shader Gradient.

---

## Review checklists

### Video

**Design**

- [ ] One focal point at any moment
- [ ] Palette limited to three to five colours
- [ ] Two typefaces maximum
- [ ] Safe margins respected (centre 70% for vertical key text)
- [ ] Contrast checked against the brightest frame of any moving background

**Motion**

- [ ] Entrances eased (ease-out), exits eased (ease-in) and shorter
- [ ] Stagger offsets small and consistent
- [ ] Holds of 0.7 to 1.2 s between major changes
- [ ] No more than three transition types
- [ ] Signature technique appears clearly, not on every shot
- [ ] Every loop returns exactly to its first frame

**Message**

- [ ] Hook in the first three seconds
- [ ] Each text block readable (`words / 3` seconds plus 0.5 s)
- [ ] CTA clear and held
- [ ] Logo held 1.5 s or more

**Sound**

- [ ] Three to five key hits aligned to visuals
- [ ] Voice clear above music
- [ ] Muted version still communicates

**Delivery**

- [ ] Watched on a phone, full screen
- [ ] Exported for each platform and ratio
- [ ] Frame rate matches the sequence settings
- [ ] Filenames and versions labelled
- [ ] Licences checked for fonts, music, footage, libraries

### Interface

Run in this order. If a step fails, fix it before adding more motion — motion that works on
your machine at 1440px with a mouse is the easy case and is worth almost nothing if it fails
any of the first five.

1. **No JS.** Does every state read? Nothing hidden, nothing stranded.
2. **Reduced motion.** Does every state remain reachable?
3. **Both themes.** Does every text node clear AA? Every meaningful graphic 3:1?
4. **Keyboard.** Is every action reachable, with a visible ring?
5. **Four viewports.** 320, 390, 768, 1440. No overflow, no clipping.
6. **Mid-flight.** Does the motion spring, or snap?
7. **Performance.** Does the pointer stay smooth while it runs?
8. **Console.** No hydration warnings, no errors.

---

# Part E: Provenance

## Honest limits and known contradictions

### Limits of this document

- **The reference analysis is observation, not instrumentation.** Eight videos and three
  stills, read by eye at low frame rates. It points at where to look; it does not replace
  opening the files in your own timeline. See
  [§22](#what-the-reference-set-shows-and-what-it-cannot-show).
- **Duration, easing and reading-time tables are standard practice**, not tuned to your
  brand or project. They become precise only when applied to a specific piece — which is
  what [§20](#lock-the-motion-language) and the effect log are for.
- **Code snippets in the companion file were written carefully against stable APIs but not
  executed**, because the environment they were written in had no Adobe software, no Remotion
  install and no network access. Treat them as starting points and test them. If one errors,
  the error message is the useful artefact.
- **Vendor facts are time-sensitive.** Pricing, licence tiers and attribution requirements
  change. Anything marked **[Verify]** must be confirmed at the source before you ship.
- **Parts B and C were written for different media and cannot be merged into one rule set.**
  Where they appear to conflict, they are not in conflict — they are answering different
  questions. Read [§2](#register-decide-what-kind-of-motion-this-is) before reaching for a
  number from the wrong half.

### Known contradictions in the source material, and how they were resolved

Recorded so they are not silently reintroduced.

| Contradiction | Resolution |
|---|---|
| Twelve evenly spaced frames claimed as the method, versus ffmpeg scene detection at a 0.35 threshold claimed as the method | Both cannot hold. Cut counts kept as approximate ±2; the audio-derived alignment column removed entirely. |
| "Cannot hear audio" versus spectral-flux onset detection on mono audio, with alignment percentages reported | Onset detection requires the audio. All alignment figures and the conclusions drawn from them removed. |
| V2 listed as zero hard cuts, versus a described cut to a dark scene | Cut count shown as a range "0 to 1". |
| "Short UI pieces sync tightly to audio" concluded from 3 events and 2 events | Replaced with the qualitative observation that strong moments land on obvious hits. |
| Sub-second timings described as measured at 30 fps by bounding-box tracking, versus 12 sparse samples | Reclassified as by-eye readings, ±0.2 s. |
| Templates say "at least 3 rows differ" against an eleven-row table, while the playbook rule is "3 of 7" | Rule clarified to the seven decisions in [§20](#lock-the-motion-language); extra template rows marked as context. |
| "Check licensing for GSAP plugins commercially" versus GSAP becoming free after the Webflow acquisition | Replaced with a verify-first instruction rather than either claim. |
| A request for more analysis addressed to the reader at the end of the reference document | Removed; it is a conversation artefact, not documentation. |

---

## Where every number came from

| Number | Source | Confidence |
|---|---|---|
| Video lengths, aspect ratios | File metadata | High |
| Presence or absence of an audio track | File inspection | High |
| Hard cut counts | Sparse frame sampling | **Low, ±2** |
| V2 hold of about 1 s, settle of about 0.3 s | By-eye preview reading | Medium, ±0.2 s |
| Duration table ([§4](#duration-holds-and-reading-time)) | Standard practice | Medium — tune per project |
| Hold range 0.7 to 1.2 s | Standard practice, consistent with the V2 reading | Medium |
| 3 words per second reading | Conservative rule of thumb | Medium |
| Vertical safe zone, central 70% | Platform UI convention | High |
| Spring presets ([§3](#easing-curves-for-time-springs-for-response)) | Tuned and browser-verified against this repository's UI | High for this project |
| Contrast ratios ([§14](#contrast)) | Computed from this repository's tokens, both themes | High |
| The 7% alpha ceiling | Arithmetic from the WCAG relative-luminance formula | High |
| Gradient loop lengths, grain percentages | Standard practice | Medium |
| Tool pricing and licensing | Vendor claims | **Time-sensitive, [Verify]** |
| Code snippets in the companion files | Written against stable APIs, not executed | Untested — run them |
