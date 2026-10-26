# Motion Code Starters

Copy-and-adapt snippets for the techniques in
[`motion-design.md`](./motion-design.md). These are for the **timeline** register: fixed
durations, frame-accurate, not interruptible.

> **Testing status — read this first.** These snippets were written against well-known,
> stable APIs but **were not executed**: the environment they were written in had no Adobe
> software, no Remotion install and no network access. Treat every one as a starting point.
> If one errors, the error message is the useful artefact — send it and it will be fixed.
>
> Two things are worth knowing before you start. First, After Effects expressions are
> evaluated per frame per property and silently return `NaN` on a typo, which shows up as a
> property that stops responding rather than as an error dialog. Second, the interface
> rules in Part B of the main guide — no-JS safety, contrast, reduced motion — **do not
> apply here**, but the loop-seamlessness rule from
> [§11](./motion-design.md#ambient-and-continuous-loops) does.

## Contents

1. [Easing reference (JavaScript)](#1-easing-reference-javascript)
2. [After Effects expressions](#2-after-effects-expressions)
3. [GSAP timelines](#3-gsap-timelines)
4. [Remotion compositions](#4-remotion-compositions)
5. [Recipes mapped to the reference set](#5-recipes-mapped-to-the-reference-set)

---

## 1. Easing reference (JavaScript)

All functions take `t` in `[0, 1]` and return eased progress in `[0, 1]`. `outBack`
overshoots above 1 and returns; anything consuming the output must tolerate that.

```js
export const ease = {
  linear:     t => t,
  outCubic:   t => 1 - Math.pow(1 - t, 3),
  outQuart:   t => 1 - Math.pow(1 - t, 4),
  // The t === 1 guard is not optional: Math.pow(2, -10) leaves a residue that
  // shows up as a final frame that never quite arrives.
  outExpo:    t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inCubic:    t => t * t * t,
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  // 1.70158 is the standard overshoot constant. Raise it for a more playful pop.
  outBack:    (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
};
```

### Map a frame range to eased progress

```js
export const progress = (frame, start, end, fn = ease.outCubic) => {
  // Guard the zero-length range. Without it, a keyframe pair on the same frame
  // returns NaN and the property silently stops responding.
  const span = end - start;
  if (span <= 0) return frame >= end ? 1 : 0;
  const t = Math.min(1, Math.max(0, (frame - start) / span));
  return fn(t);
};
```

Working in frames rather than seconds is deliberate on the timeline side: it makes the
snippet immune to the frame rate, since `frame` is already normalised by the composition.

---

## 2. After Effects expressions

Paste into the property's expression field (Alt/Option-click the stopwatch).

### 2.1 Overshoot bounce after a keyframe

Works on scale or position after the last keyframe. Tune the three numbers at the top.

```js
amp   = 0.1;   // overshoot strength (higher = bouncier)
freq  = 2.0;   // oscillations per second
decay = 5.0;   // how quickly it settles (higher = faster)

n = 0;
if (numKeys > 0) {
  n = nearestKey(time).index;
  if (key(n).time > time) n--;
}
if (n == 0) {
  t = 0;
} else {
  t = time - key(n).time;
}
if (n > 0) {
  v = velocityAtTime(key(n).time - thisComp.frameDuration / 10);
  value + v * amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);
} else {
  value;
}
```

This adds a decaying sine on top of whatever the keyframes are doing, so it needs the
property to already be animated. If the result is stationary, the property has no
keyframes — that is the usual cause, not the expression.

### 2.2 Stagger by layer index

Select many layers, apply to opacity. Each layer starts a little later than the one above.

```js
stepSec = 0.08;   // delay between layers (about 2 to 3 frames at 30 fps)
start   = 1.0;    // when the first layer begins
dur     = 0.5;    // entrance duration

t0 = start + (index - 1) * stepSec;
easeOut(time, t0, t0 + dur, 0, 100);
```

**`index` is layer stacking order, and 1 is the topmost layer.** So `index - 1` means the
top layer animates first, which is usually what you want and occasionally the opposite. If
the cascade runs backwards, this is why — and the fix is `index` rather than `index - 1`,
or reorder the layers.

### 2.3 Slide-up with ease (position)

```js
start = 0.5; dur = 0.6; dist = 60;   // pixels to travel
y = easeOut(time, start, start + dur, dist, 0);
value + [0, y];
```

### 2.4 Curved cursor path (quadratic bezier)

Apply to the cursor layer's position. Never move a cursor in a straight line — a linear
cursor path is the clearest tell that a UI demonstration is fake.

```js
p0 = [200, 800];     // start
p1 = [600, 700];     // control point (pulls the curve)
p2 = [900, 400];     // end
tStart = 1.0; tEnd = 2.2;

u = easeOut(time, tStart, tEnd, 0, 1);   // eased 0..1
a = (1 - u) * (1 - u);
b = 2 * (1 - u) * u;
c = u * u;
[ a*p0[0] + b*p1[0] + c*p2[0],
  a*p0[1] + b*p1[1] + c*p2[1] ];
```

The control point only works as intuition suggests if it sits off the straight line between
the endpoints. Put `p1` on the line and you have rebuilt a linear path with more typing.

### 2.5 Click pulse (scale dip)

```js
clickT = 2.2;                            // time of the click in seconds
d = time - clickT;
s = (d >= 0 && d < 0.2) ? 100 - 15 * Math.sin(Math.PI * d / 0.2) : 100;
[s, s];
```

This is a *press*: it dips to 85% and returns. For a click that overshoots upward, invert
the sign.

### 2.6 Count-up number (Source Text)

```js
start = 1.0; dur = 1.2; from = 0; to = 10;
v = Math.round(easeOut(time, start, start + dur, from, to));
v + "x better";
```

Ease out and **hold the final value for at least a second**. A counter that resolves and
immediately moves on gives the viewer no time to read the number, which is the only reason
it exists.

### 2.7 Slow constant push-in (scale)

```js
dur = thisComp.duration;
s = linear(time, 0, dur, 100, 104);
[s, s];
```

### 2.8 Loop a keyframed animation

```js
loopOut("cycle");     // repeats the keyframed segment
```

Verify the seam: `cycle` repeats the segment, so the last frame must equal the first. If
the keyframes were authored with a duplicated boundary frame you will get a one-frame stutter
once per cycle.

### 2.9 Gentle float

```js
wiggle(0.5, 8);   // 0.5 times per second, 8 pixel amplitude. Apply to position.
```

Needs no keyframes, but **it never rests**. It is ambient-only, and if the piece has to be
delivered as a still or a reduced-motion variant you have to freeze it explicitly.

### 2.10 Slow gradient drift (position of a blurred blob)

```js
loopTime = 12;                                     // seconds per loop
a = (time % loopTime) / loopTime * 2 * Math.PI;
value + [Math.cos(a) * 120, Math.sin(a) * 80];
```

The `time % loopTime` is the whole point. It makes the phase a pure function of the cycle
position, so frame 1 and the end of the cycle are identical by construction and cannot
drift. An accumulator (`t += ...`) accumulates float error over a long comp and the loop
visibly slides. See
[§11](./motion-design.md#ambient-and-continuous-loops).

### 2.11 Tip

Shape the speed curve in the **Graph Editor** after applying keyframes. Ease-out entrances
should start steep and end with a long gentle tail. Reading a value off a Bezier handle in
the graph editor is faster than reasoning about it, and it is the only place the overshoot
is visible.

---

## 3. GSAP timelines

No plugin required for these. They plan sequences well and can be screen-recorded to video
(see [3.5](#35-recording-a-gsap-animation-for-video)).

### 3.1 Mask-style line reveal with stagger

```html
<div class="line"><span>Give your team</span></div>
<div class="line"><span>superpowers</span></div>

<style>
  .line {
    overflow: hidden;
    display: block;
    /* Without this, descenders (g, y, p) are clipped by the mask. */
    padding-bottom: 0.14em;
    margin-bottom: -0.14em;
  }
  .line span {
    display: inline-block;
    transform: translateY(110%);
  }
</style>

<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script>
  const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 0.7 } });
  tl.to(".line span", { y: 0, stagger: 0.1 })
    .to({}, { duration: 1.2 })                       // hold so the viewer can read
    .to(".line span", { y: "-110%", ease: "power2.in", duration: 0.4, stagger: 0.06 });
</script>
```

Two things worth copying from this pattern: the **`padding-bottom` / negative margin** pair
that stops the mask clipping descenders, and the **empty tween as a hold** (`.to({}, {duration})`),
which is the cleanest way to express a hold in a timeline.

### 3.2 Morph hold pattern (state A to B, pause, B to C)

```js
const tl = gsap.timeline();
tl.to("#card", { scale: 1.15, duration: 0.9, ease: "power3.out" })   // grow
  .to("#card", { scale: 1.0,  duration: 0.35, ease: "power2.inOut" }) // settle
  .to({}, { duration: 1.0 })                                          // hold about 1 s
  .to("#card", { height: 320, borderRadius: 24, duration: 0.6, ease: "power3.inOut" });
```

This is the structure measured in the V2 reference: grow, overshoot, settle, **hold**, then
the next morph. The hold is what makes the second movement read as a decision. See
[§4](./motion-design.md#duration-holds-and-reading-time).

### 3.3 Icon pop with overshoot, and line draw-on

```js
gsap.fromTo(".icon", { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(1.7)" });

// SVG path draw-on without plugins, using stroke-dasharray
const path = document.querySelector("#underline");
const len = path.getTotalLength();
gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
gsap.to(path, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" });
```

### 3.4 Slowly drifting gradient blobs

```js
gsap.to(".blob-1", { x: 120, y: -60, duration: 12, ease: "sine.inOut", repeat: -1, yoyo: true });
gsap.to(".blob-2", { x: -100, y: 80,  duration: 15, ease: "sine.inOut", repeat: -1, yoyo: true });
```

`repeat: -1` with `yoyo: true` returns along the same path, so the seam is exact. Large
blurred shapes (`filter: blur(80px)`) plus a grain overlay. Keep text contrast checked
against the brightest frame, not the average.

### 3.5 Recording a GSAP animation for video

Screen-record at a **fixed** frame rate, or capture deterministically:

- **Screen capture** — QuickTime (macOS) or OBS (any platform). Set the capture rate
  explicitly; a variable-rate capture makes the imported clip play at the wrong speed.
- **Deterministic capture** — drive `gsap.timeline()` from a fixed frame counter and
  screenshot each frame with Playwright (`page.screenshot()` in a loop). Slower, but
  frame-accurate and reproducible, which matters if you will re-render after a tweak.
- **Video capture API** — `MediaRecorder` on a `canvas.captureStream()`. Convenient, but
  the codec and frame timing are browser-dependent.

Whichever you use: keep animations time-based, and confirm the licence terms for GSAP and
any plugin before publishing. GSAP's licensing changed after Webflow's acquisition, so
check current terms rather than assuming either way.

---

## 4. Remotion compositions

Remotion renders React components frame by frame. These use its core APIs: `useCurrentFrame`,
`useVideoConfig`, `interpolate`, `spring`, `Easing`, `Sequence`, `AbsoluteFill`.

The core discipline: **derive everything from `useCurrentFrame()`, never from wall-clock
time or React state.** A frame-derived component is deterministic, so re-rendering the same
composition produces the same output — which is the property that makes the tool worth using.

### 4.1 Project registration (`src/Root.tsx`)

```tsx
import { Composition } from "remotion";
import { Tagline } from "./Tagline";

export const RemotionRoot = () => (
  <Composition
    id="Tagline"
    component={Tagline}
    durationInFrames={240}   // 8 s at 30 fps
    fps={30}
    width={1920}
    height={1080}
  />
);
```

### 4.2 Kinetic tagline with mask reveal, hold and exit

Source: `src/Tagline.tsx`.

```tsx
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

const words = ["Give", "your", "team", "superpowers"];

const Word: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const frame = useCurrentFrame();
  const start    = 10 + index * 4;   // stagger: 4 frames per word
  const inEnd    = start + 18;       // 18-frame entrance
  const outStart = 150 + index * 2;   // hold, then exit
  const outEnd   = outStart + 12;

  const enter = interpolate(frame, [start, inEnd], [110, 0], {
    easing: Easing.out(Easing.exp),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(frame, [outStart, outEnd], [0, -110], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span style={{ display: "inline-block", overflow: "hidden", marginRight: 24 }}>
      <span style={{ display: "inline-block", transform: `translateY(${enter + exit}%)` }}>
        {text}
      </span>
    </span>
  );
};

export const Tagline: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#f7f6f8",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Inter, Helvetica, Arial, sans-serif",
      fontSize: 120,
      fontWeight: 700,
      color: "#1b1b1f",
    }}
  >
    <div>
      {words.map((w, i) => (
        <Word key={w} text={w} index={i} />
      ))}
    </div>
  </AbsoluteFill>
);
```

**Two things to notice, because they are decisions rather than defaults:**

- `extrapolateLeft` and `extrapolateRight` are both `"clamp"`. Without them, `interpolate`
  extrapolates and the words fly in from off-composition before their start frame and never
  leave. Clamping is what makes the hold between `inEnd` and `outStart` actually hold.
- The hold here is about **4 seconds**, far longer than the 0.7 to 1.2 s morph hold. That is
  correct: this is the message, and it has to be read. The 0.7 to 1.2 s figure is for holds
  *between* movements, not before the thing the viewer came for.

The mask also needs the same descender treatment as
[3.1](#31-mask-style-line-reveal-with-stagger) if the type has descenders at that size.

### 4.3 Spring pop for icons or cards

```tsx
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const PopCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 120 },   // low damping = visible bounce
  });

  return (
    <div
      style={{
        width: 400, height: 240, borderRadius: 32, background: "#fff",
        boxShadow: "0 30px 60px rgba(0,0,0,.12)",
        transform: `scale(${s})`,
        opacity: Math.min(1, s * 2),
      }}
    />
  );
};
```

`damping: 12` is bouncier than anything recommended in
[Part B](./motion-design.md#springs-in-numbers), and that is the register difference working
as intended: on a timeline nothing can interrupt the motion, so overshoot is safe, and a
little of it is what sells the impact. Coupling opacity to the spring value is also fine
here — there is no no-JavaScript requirement in a rendered video.

### 4.4 Scene sequencing with holds

```tsx
import { Sequence } from "remotion";

export const Promo: React.FC = () => (
  <>
    <Sequence from={0}   durationInFrames={90}>  <SceneHook />    </Sequence>
    <Sequence from={90}  durationInFrames={150}> <SceneFeature /> </Sequence>
    <Sequence from={240} durationInFrames={90}>  <SceneLogo />    </Sequence>
  </>
);
```

`from` values must be cumulative: `0`, then `0 + 90 = 90`, then `90 + 150 = 240`. Writing
them as round numbers is the easy mistake here and leaves gaps or overlaps.

Render from the terminal after setup:

```bash
npx remotion render Tagline out/tagline.mp4
```

**Licence reminder [Verify]:** Remotion's licence is tiered by company size, with separate
terms for automated render pipelines and for embedding the Player. The thresholds and
pricing have changed before. Confirm on `remotion.dev/docs/pricing` before shipping anything
commercial or putting it in a pipeline.

---

## 5. Recipes mapped to the reference set

| Reference | Technique | Where to look |
|---|---|---|
| V2 object morphing and cursor | Morph hold pattern, curved cursor, click pulse | [2.4](#24-curved-cursor-path-quadratic-bezier), [2.5](#25-click-pulse-scale-dip), [3.2](#32-morph-hold-pattern-state-a-to-b-pause-b-to-c) |
| V4 kinetic tagline and counter | Mask reveal, count-up | [3.1](#31-mask-style-line-reveal-with-stagger), [4.2](#42-kinetic-tagline-with-mask-reveal-hold-and-exit), [2.6](#26-count-up-number-source-text) |
| V5 letter animation | Per-letter stagger, tracking animation | AE Text Animator with a Range Selector, or split into spans and use [3.1](#31-mask-style-line-reveal-with-stagger) per letter |
| V1 line draw and fan | Draw-on path, staggered icons | [3.3](#33-icon-pop-with-overshoot-and-line-draw-on), [2.2](#22-stagger-by-layer-index) |
| V7 carrier shape | Spring pop, loop | [4.3](#43-spring-pop-for-icons-or-cards), [2.8](#28-loop-a-keyframed-animation) |
| V8 drifting gradients | Slow drift | [2.10](#210-slow-gradient-drift-position-of-a-blurred-blob), [3.4](#34-slowly-drifting-gradient-blobs) |
| V6 starburst and ghost text | Scale with overshoot, large low-opacity text behind | [2.1](#21-overshoot-bounce-after-a-keyframe), [3.3](#33-icon-pop-with-overshoot-and-line-draw-on) |
| V3 chapter tabs | Sequence plus a progress indicator driven by the current scene | [4.4](#44-scene-sequencing-with-holds) |

## Suggested learning order

1. Easing and the graph editor — [2.3](#23-slide-up-with-ease-position), [2.1](#21-overshoot-bounce-after-a-keyframe)
2. Stagger — [2.2](#22-stagger-by-layer-index)
3. Morph with a hold — [3.2](#32-morph-hold-pattern-state-a-to-b-pause-b-to-c)
4. Cursor path and click — [2.4](#24-curved-cursor-path-quadratic-bezier), [2.5](#25-click-pulse-scale-dip)
5. Sequencing a full 30 s piece — [4.4](#44-scene-sequencing-with-holds)
