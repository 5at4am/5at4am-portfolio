# Project Memory — 5at4am

Persistent knowledge base for the `5at4am` project. Reads like a memory: stack, architecture, conventions,
decisions, current state, and how to verify work. Update this file whenever the project changes materially.

---

## Overview

A personal brand / portfolio site (name "5at4am") built on **Next.js 16 (App Router, Turbopack)** with React 19,
statically exported. A resume-style home page plus a 3D-paper showcase route. Dark glass + zinc visual
language, GSAP reveals, view-transition theme switching, and a set of guest shader/component showpieces
(3D Paper, sketchbook, draggable ball, eye tracker, contact fan).

## Stack

| Area        | Choice |
| ----------- | ------ |
| Framework   | Next.js **16.3.6** (App Router, Turbopack, static export) |
| React       | **19.2.8** |
| Styling     | Tailwind CSS **v4** (`@import "tailwindcss"`), `tw-animate-css`, `shadcn/tailwind.css` |
| Motion      | `motion` (framer-motion v13) + `gsap` + `lenis` + `aos` |
| UI bits     | `@base-ui/react`, `lucide-react`, `react-icons`, `ogl`, `threeui-cli`, `shadcn` |
| Theme       | `next-themes` (class on `<html>`) |
| Fonts       | Geist / Geist Mono (next/font), `--font-sans`, `--font-mono` |
| Lint        | `eslint` (flat config from `eslint-config-next` 16.3.6) |

## Commands

```bash
npm run dev                 # dev server (user keeps one running on :3000)
npm run lint                # eslint (whole project)
npx tsc --noEmit            # typecheck
npm run build               # production build (static export)
npm run start               # serve the build
npm run verify:shaders      # validates 3D-paper source files hash to published digests
```

## Routes

- **Three routes ship:** `/`, `/paper`, `/_not-found`. No `route.ts` anywhere, so there are zero
  API endpoints and no runtime `fetch`/`axios`; everything is baked at build time.
- `src/app/not-found.tsx` is a standalone frame (header + `<main id="main">`, no `PageShell`, no footer, no
  curtain runway, since a 404 has nothing to scroll). Oversized outlined `404` behind the content, the real
  header, one primary CTA plus email, and the doormat of section links. It uses the same
  `reduced = useReducedMotion() !== false` guard as `SkillsIndex`, so the copy can never be hidden.
- Footer (`site-footer.tsx`) is unchanged in structure and gained labelled link groups (`Sections`,
  `Elsewhere`) plus a back-to-top `href="#top"`. Back to top is an anchor, not a scripted scroll, so the CSS
  `scroll-behavior: smooth` (gated behind `prefers-reduced-motion: no-preference`) covers it with no second
  code path. The footer's three motion systems (curtain slide, `--word-fill`, marquee) all already respect
  reduced motion; measured height is 904px desktop, exactly one 748px viewport on mobile.

- `/` — resume home: `Hero → About → Experience → Projects → Skills → Achievements → Contact`
  (`src/app/page.tsx`). Pure composition; every string comes from `src/content`. Hero is not in the nav.
- `/paper` — 3D paper showcase (`src/components/layout/paper-header.tsx`, `src/app/paper/page.tsx`,
  `src/components/three-d-paper/connect-three-d-paper.tsx`).
- `/sitemap.xml` and `/robots.txt` are generated metadata routes (`src/app/sitemap.ts`, `src/app/robots.ts`),
  not static files. Both need `export const dynamic = "force-static"` under `output: "export"`.
- `/profile` and `/theme-lab` are both **removed**. Everything that pointed at the profile page went with it:
  the header icon rail's `User` link, the footer's "Full profile" button and "Profile" nav row, and the 404
  doormat. `profileMetadata` is gone from `content/metadata.ts`. The deleted source is recoverable with
  `git checkout HEAD -- src/app/profile/page.tsx src/components/layout/profile-header.tsx src/components/sections/profile-identity.tsx src/components/sections/profile-pinned-section.tsx src/components/sections/profile-connect-section.tsx`.
  Still there but now unused, kept only in case the page comes back: `Section`'s `terminal` variant and
  `PINNED_REPOS` in `content/projects.ts`.

`src/app/layout.tsx` owns the document shell: fonts, `<ThemeProvider>`, and a skip link to `#main` (rendered by
`PageShell`). **`WordsPreloader` is mounted in `src/app/page.tsx`, not the layout**, so the intro is the home
page's and only the home page's — verified absent on `/paper` and the 404. Trade-off accepted: it now replays on
a client-side navigation back to `/`, which the layout-level mount had been quietly preventing.

**The preloader MUST go through `PageShell`'s `overlay` prop, never among its children.** This bit once already: moving
it out of the root layout put it inside `<main>`, and the curtain puts a `transform` on `<main>`, so it stopped being
viewport-relative. Measured on the real page: its `fixed` box came out **8206px tall and offset 48px down, matching
`<main>` exactly** — it covered only the first viewport of an eight-screen document, so the words animated down where
nobody was looking and the counter/progress/Skip rendered at the bottom of the *document* rather than the screen. The
symptom was "the preloader isn't working": a dark band across the top with the real site visible underneath it, and the
counter sitting somewhere far down the page. Same trap `PageShell.overlay` documents for `ContactBall`; that prop now
carries both. **Rule for this repo: any `position: fixed` overlay goes in `overlay`, and a fixed overlay is not considered
working until its box measures exactly one viewport.**

`WordsPreloader` internals worth knowing: one `setTimeout` per word (`step` = 560ms animated / 260ms reduced), not one
per frame, so the counter and bar step rather than tick. Slots are owned outright and capped at `slice(-2)` because
`AnimatePresence` never unmounts an exiting child when a masked per-character reveal is nested inside it (measured: all
eight layers stayed mounted and the run overshot its budget by ~1.3s). Three escape hatches: `Skip`, `Escape`, and a
watchdog at `total * step + WIPE_SECONDS*1000 + 1200`. Verified: full run 1.24s → 7.4s, counter stepping 1→8, panel
exactly 804px tall on an 804px viewport; Skip and Escape both dismiss; mobile 390x844 covers the viewport with the word
inside the stage.

**Scroll-back trap (fixed).** `.curtain-footer` is `overflow-y: auto` and sat at `overscroll-behavior: contain`.
Contain blocks chaining in *both* directions, so at the bottom of the page — footer at its own top boundary,
`<main>` translated clear — an upward wheel was swallowed: the footer would not scroll and the document would
not either. Now `overscroll-behavior-y: auto`, so the footer scrolls itself first and hands the gesture to the
document at its boundary. Verified with `Input.synthesizeScrollGesture`.

**Double scrollbar (fixed).** Two scrollbars appeared because two elements were genuinely scrolling, not because of a
styling artifact: `.curtain-footer` is `position: fixed; inset: 0`, so its box is exactly one viewport tall, and its
content measured 908px against an 804–900px viewport. `overflow-y: auto` therefore gave the footer its own 15px
scrollbar in the same gutter as the document's. Fixed in two parts, and **both are needed**:
- `scrollbar-width: none` + `::-webkit-scrollbar` + `-ms-overflow-style` on `.curtain-footer`. The footer is a fixed
  overlay, not a second document — it is the document's scrollbar that drives the curtain, so a track there reads as a
  rendering fault. The box still scrolls on wheel/touch; it just does not draw one. Multi-engine on purpose.
- Made the content actually **fit**, so the hidden bar is not covering content below the fold. The footer is
  viewport-sized but its vertical rhythm was in `rem`. Worst offender: the oversized wordmark was sized purely by
  `19vw` width, so on a short-but-wide window (1280x720, 1366x768) it was the largest object in the footer at the
  exact moment the viewport had least room for it, pushing the doormat 188px out of view. Now
  `min(19vw, 22vh)` — width still governs on a tall window, height gets a say when scarce — and the padding above the
  marquee and around the word is `vh`-scaled. Content now fits outright at 1440x900, 1920x1080 and 1366x768.
  iPhone SE still overhangs ~100px, which is honest at 667px tall; the hidden bar is the right trade there.

**Reduced-motion horizontal overflow (fixed).** The reduced-motion rule un-fixed the footer (`position: static`), which
stopped it being a viewport-sized box, and the marquee inside it is a `width: max-content` strip measuring **1593px in
a 1407px column**. While the footer was fixed, that overhang was clipped and invisible to layout; un-fixed, it became
100px of document overflow and a horizontal scrollbar across the whole page. Fixed with `overflow-x: clip` (not
`hidden` — that would make the footer a scroll container on both axes, i.e. the double-scrollbar bug again) and
`overflow-y: visible`, which is legal alongside `clip` and keeps the footer's height growing with content.

## Navigation

Current design: **top-attached notch navbar** (replaced the earlier full-width bar and a rejected magnification dock).

- `src/components/navigation/site-header.tsx` — a `pointer-events-none` sticky header wrapping a
  `pointer-events-auto` notch `nav`: `h-12 w-fit max-w-[calc(100vw-6rem)] rounded-b-[20px] border border-t-0
  border-white/10 bg-zinc-950/85 text-zinc-100 shadow-lg shadow-black/10 backdrop-blur-md px-5`, pinned
  top-center. Contains the wordmark (charClass-refined "5at4am": the `5`/`4` glyphs muted) +
  `NavSectionLinks variant="notch"` (desktop) + an `md:hidden` menu button opening the mobile panel.
- `nav-section-links.tsx` — variants `"underline" | "bordered" | "notch"`; notch links are always
  `text-zinc-100`/`zinc-100/70` with a `bg-zinc-100` underline; the `ul` is hidden below `md`.
- Scroll-spy drives the active underline; sections derive from `NAV_SECTIONS` in `src/content/navigation.ts`
  (offset `SCROLL_OFFSET = 96`).
- `nav-mobile-panel.tsx` unchanged. Icon rail (`nav-icon-links.tsx`) + `HEADER_SOCIALS = CONTACT_LINKS`.

## Theme toggle

SHIPPING STATE: a plain shadcn sun/moon switch doing a 200ms cross-fade. No view transition runs on the site.

- `src/components/theme/simple-theme-toggle.tsx` is what the site renders. All three headers
  (`site-header.tsx`, `profile-header.tsx`, `paper-header.tsx`) use it with **no `wipe` prop**, so no
  `document.startViewTransition` is started and the 200ms colour transition in `globals.css` is the whole
  animation. Measured artefact-free: a smooth ramp between exactly two endpoint colours. Face is a lucide
  Sun/Moon gated by `useHydrated` (never a mirrored `resolvedTheme`, which would guarantee a hydration mismatch).
- The animated `Around` face (`theme-toggle.tsx`, installed via `npx shadcn@latest add @toggles/around`) is
  retained but unused, commented out in `site-header.tsx` with its import. Restore both to bring it back.
- `src/components/theme/use-theme-switch.ts` holds the whole switch, shared by the toggle and the lab so the
  lab cannot drift from what ships. `useThemeSwitch({ variant, start, blur, syncClass, pauseLiveAnimations,
  useViewTransition, onReport })`. `DEFAULT_WIPE` is `{ variant: "circle-blur", start: "top-right", blur: true }`.
- `ThemeProvider` (`theme-provider.tsx`): `next-themes` with `attribute="class"`, `defaultTheme="system"`,
  `enableSystem`, persisted under `localStorage["theme"]`. `<html suppressHydrationWarning>` is required because
  next-themes sets `.dark` in a blocking script ahead of hydration.
- `src/lib/view-transition.ts` exports `isViewTransitionActive()`, a `:active-view-transition` match. Used by
  the hero WebGL loop to hold still during a transition.

### Why the wipe was dropped, honestly

Two real defects were found and fixed, and both are verified. A residual flash remained that could NOT be
attributed, and this is not a solved problem:

1. **Stale snapshot (fixed).** skiper26's `useThemeToggle` hands `startViewTransition` a callback that calls
   `setTheme` and returns `void`, but next-themes applies the `dark` class in a passive effect
   (`useEffect(() => applyTheme(theme), [theme])`), not during that call. The browser snapshots the "after"
   state once the callback settles, i.e. before the class lands, so the snapshot holds the OLD theme. Fix: apply
   `classList.toggle("dark", ...)` and `style.colorScheme` **synchronously inside the callback**, then call
   `setTheme` so next-themes keeps its state, media-query listener and `localStorage` in step. The callback
   must stay synchronous: returning a promise that waits on a frame deadlocks the capture phase, because
   rendering is suspended until it settles, and the wipe then silently stops playing.
2. **Canvas drift (fixed).** The hero WebGL loop kept drawing during the frozen snapshot. `gradient-waves.tsx`
   now holds both the frame and the clock while `isViewTransitionActive()`. Rebasing `t0` is essential:
   skipping the draw alone would let `iTime` jump forward by the length of the transition, which is the same pop.
   `document.getAnimations()` cannot see a raw rAF loop, which is why this needed a separate mechanism.

Measured and eliminated as causes: canvas drift (1 distinct hash during the wipe), eye-tracker drift
(byte-identical transform, so its ~2800 attribute writes per switch are same-value rewrites), CSS/WAAPI drift
(paused, `advanced=0`), layout shift (`clientWidth`, `scrollY`, `bodyHeight` all constant), console and
hydration errors (none). The remaining suspect is compositor-level behaviour at teardown, such as mask growth
and `backdrop-filter` re-blurring on the notch and glass cards. Headless SwiftShader does not reproduce it and
frame-accurate capture was not possible in this environment. **Do not claim the wipe is artefact-free.**

### Traps recorded here

- `next start` does not work with `output: "export"`. Serve a build with `npx serve out` or a small static
  server, and **rebuild before testing**: the flash survived several rounds purely because the production
  bundle was stale.
- Sample `::view-transition-*` pseudos on `transition.ready`, never in `finished.then`. By teardown they are
  destroyed, so reading `getAnimations()` there reports none and looks like the wipe never ran.
- Use `then(onDone, onDone)`, not `.finally`, for releasing paused animations. `finally` returns a derived
  promise that rejects with the original `AbortError`, and every rapid toggle skips the transition before it.
- Read the next theme from `document.documentElement.classList`, never from `resolvedTheme`, which lags by a
  render: rapid clicks then resolve to the same destination and N clicks perform fewer than N flips.


## Design system & conventions

- Tailwind v4 class-based dark mode: `@custom-variant dark (&:is(.dark *));` (globals.css line 5); keys off
  `.dark` on `<html>`. **Do not** change to a data-attribute strategy.
- Tokens: `--vng-*` design tokens in `:root` / `.dark`; full CSS variables + `@theme inline` mapping (see
  globals.css). Dark glass uses `bg-zinc-950/85`-style chips and `oklab` colour-mix surfaces.
- **Rules:** imports from `motion/react` (not framer-motion); no purple anywhere; strict zinc/`--vng` tokens;
  no em-dashes in user-facing copy; `react-hooks/set-state-in-effect` lint (setState only in callbacks/rAF/timeout);
  check `next` docs in `node_modules/next/dist/docs/` before writing Next.js code (this Next version has breaking
  changes).
- Global theme-switch transitions are scoped (`body, header, footer, main, nav, section, article, aside, hr, a,
  button, input, textarea, select, [data-slot=...], [role=...]`) to colour properties only, so GSAP grid
  animations are not fought. Reduced-motion handled per-component and via `staggered-grid` overrides.
- `lenis` smooth scrolling; `scroll-pt-20` on `<html>` for the sticky header.

## Sections & content

- **About** (`about-section.tsx` + `ABOUT`/`EDUCATION` in `site.ts`) — two-column on home: left narrative, right fact
  sheet of two dark-glass cards (Stack `TagList tone="onDark"` + Education `dl` rows). The lead row pairs a **Bencho
  eye-tracker** (`ui/eye-tracker`, `shape="Ball" size={96} tone="ink" decorative`, `follow={55} bounce={25}`) as a
  living avatar: it tracks the cursor and inverts with the theme because its `--fill-*` bridge is the page's own
  tokens. Its 200px frame is absolutely centred inside a `size-24` box that owns the layout space. Copy is split as
  `ABOUT.lead` + `ABOUT.focus` (with exact-match `highlights` rendered by `HighlightedParagraph`); `ABOUT.bio` remains
  the single-paragraph fallback for the profile `terminal` variant. Availability pill was added then removed on
  request. `Section` shell shared by all home sections.
  - **About is now interactive, and was measured at zero interactive elements before this** — 655px of prose with 8
    wash phrases, 8 chips and 4 fact rows, none of it responding to anything. Three claims, each with highlighted
    evidence, presented as three equal grey blocks.
  - **A paragraph activates from scroll position or pointer/focus, and three things follow.** The reading line sits at
    `0.42` of viewport height and picks the *nearest* paragraph centre (not the first below the line, which flickers
    when two are equidistant — exactly where the reader is looking). Pointer and focus *pin* an index and release on
    leave, so a reader who stops on a paragraph keeps it lit instead of the next one taking over. On activation: the
    paragraph lifts to `text-foreground`, its left rule fills, its phrases' washes go to full strength, the Stack
    chips for that claim light, and the eye-tracker morphs `Circle → Hexagon → Cube`. Scroll reads `useScroll()`'s
    `scrollY` via `useMotionValueEvent` and only calls `setActive` when the *index* changes — at most 3 times per pass,
    rather than re-rendering on every scroll frame.
  - **Emphasis is colour, never opacity** — same rule as the timeline. Chips are `litItems` on `TagList`; the lit chip
    takes full ink and the rest take the muted one, and both states were measured at **8.97:1** against the card in
    both themes, every chip at `opacity: 1`.
  - `AboutParagraph` gained `tools?: readonly string[]`, matching `ABOUT.stack` labels by exact string so a renamed
    chip never lights the wrong thing. **The mapping is PROPOSED and needs the user's sign-off** — each entry is
    commented inline. `Next.js` and `TypeScript` are deliberately in no paragraph: they are stack, not claims, and a
    chip that never lights is a true statement.
  - The left rule (`border-l-2` + `pl-4`) replaced `space-y` as the paragraph separator: 24px of space between three
    paragraphs read as one continuous block of prose, and the rule also encodes which one is active.
  - **The Stack chips REORDER, animated, and it is behind a flag** (`TagList`'s `promoteLit`, off by default). Lit chips
    slide to the front with `layout="position"` (FLIP) on a `stiffness: 420 / damping: 34 / mass: 0.7` spring —
    deliberately faster than the 340ms wash, because the chips are the direct answer to the paragraph and the wash is
    scenery. Verified: DOM order genuinely changes, a transform is present mid-flight
    (`matrix(1,0,0,1,181.883,0)`), every chip is `position: relative`, and the list height is unchanged at 94px so
    `flex-wrap` never reflows.
  - **The reorder is a STABLE PARTITION, not a sort.** Two filtered passes keep both the lit and unlit groups in
    authored order; a `sort` with a "lit first" comparator leaves the unlit chips' relative order up to the engine,
    which for an 8-item array is not a promise to rely on. Measured: the unlit chips never move.
  - **`project-accordion.tsx` must not get the reorder.** It renders `TagList` with `litItems` set, and reordering a
    stack underneath someone reading a project description would be the exact cleverness this flag exists to prevent.
    Under reduced motion the reorder does not happen at all — only the colour changes — because reordering is a change
    of *content order*, and the one thing that must never be animated away from a reader who cannot see it happen is a
    reordering.
- `src/content/metadata.ts` — `rootMetadata` + `homeMetadata` + `paperMetadata`; `src/content/types.ts` — shared types.

- **The live Experience and Achievements sections were rebuilt as two different shapes on 2026-10-27.** The home
  page no longer renders two copies of a timeline.
  - **Experience** (`src/components/ui/experience-timeline-beam.tsx`) keeps the Aceternity timeline read: a sticky
    start month/year column on wide screens, a scroll-driven `scaleY` rail, and a Bencho **edge light** rim on each
    role card. The pointer writes `--edge-angle`; the card itself never moves. The rail is one full-height fill
    scaled by `useScroll` (`start 0.85` / `end 0.55`), so there is no height measurement, resize listener, or state
    update. The date column is `aria-hidden` because the card repeats the full authored `meta` range, including
    "Remote".
  - **Achievements** (`src/components/ui/achievements-bento.tsx`) is an Aceternity bento grouped by issuer, not a
    timeline: a wide dark feature for the top result, two columns for each multi-credential programme (WiiZ,
    Samatrix), one column for the single certificates, and a three-column summary band. Rank order is preserved by
    `groupByIssuer` (first appearance wins). The Bencho **ink bloom** runs on press (`--bloom-x` / `--bloom-y` plus
    `data-bloom`), so the reading surface never tilts. Both effects are removed under `prefers-reduced-motion`; both
    entrances are transform-only (`y: 8` / `y: 12`), never opacity, so the content is present without JavaScript.
    Built HTML verified: 0 `opacity:0` and 0 `display:none` inside both sections.
  - Unused variants stay on disk and are not imported by the home page: `sections/experience-timeline.tsx`,
    `ui/experience-timeline-pro.tsx`, `sections/achievements-ledger.tsx`, `ui/achievements-timeline.tsx`, and the
    two `*-aceternity.tsx` files. The detailed rationale below belongs to the earlier
    `sections/experience-timeline.tsx` variant, not the live component.
- **The earlier Experience variant is a scaled timeline rail** (`src/components/sections/experience-timeline.tsx`), not a list. It was the
  only flat block on the page, sitting between Projects and Skills which both ask for attention, and the content
  decided the shape: three short roles in a tight window where the gaps are real information. Stops are ordered
  oldest-first by `start`, and the space between two stops is proportional to the months actually between them, so an
  8-month gap and a 3-month gap read as different sizes. **Only the gaps are scaled vertically** — within a stop the
  height is content-driven, because a 2-month role carries the same text as a 12-month one and date-proportional heights
  would force truncation. **Each role's own duration is deliberately NOT printed as text:** the date range is already on
  the stop in full, and a bare "3 months" for the job sits a few pixels from a "3 months" for the gap in the same mono
  weight, which is a genuine ambiguity between two different quantities. One number per gap, none per stop. The duration
  is encoded **visually** instead, on the horizontal axis — see below.
  - **The second axis: duration bars (`src/components/sections/experience-timeline.tsx`).** A vertical timeline already
    spends one axis on time — the gap between roles — which leaves the second axis free. Each stop now carries a
    horizontal bar filled in proportion to that role's real duration against the longest role on the page, so
    "2-month sprint or 6-month job" is answerable without reading a date range. The two axes therefore say genuinely
    different things: **vertical space = the gap, horizontal bar width = the role's own length.** The bar is segmented
    by `stack.length`, so the one recurring theme in this career (applied AI, every role) shows as a family resemblance
    without anyone reading a bullet. The bars are `aria-hidden` — they restate the dates and the stack in a worse form —
    and they are the one thing in the section allowed to recede while text beside them holds full contrast.
  - **`DurationBar` had a real encoding bug that a screenshot would never have caught.** `flexGrow: 1` on each segment
    plus `flexGrow: 1 - ratio` on the trough does **not** produce `ratio`: the segments split `1` *among themselves* and
    then compete with the trough, so three bars measured 0.83 / 0.845 / 0.81 for roles of 3, 2 and 6 months — a
    two-month capstone and a six-month job drew the same width. **The ratio must go on the GROUP that wraps the
    segments**, never on the segments themselves. Correct values now measure 0.502 / 0.335 / 0.999 against an expected
    0.500 / 0.333 / 1.000. The bar also uses `Math.max(0.001, 1 - ratio)` rather than `1 - ratio`, because a
    `flex-grow: 0` element collapses to `min-content` and can round to a visible sliver on the longest role.
  - **The evidence panel is a native `<details>`, and this replaced a real accessibility defect.** It was a `motion.div`
    height animation behind a `<button>` with `aria-expanded`, shipping `height:0px;opacity:0` + `inert` on all three
    panels — verified in the built `out/index.html`. Fine with scripting on, useless without it: every accomplishment
    statement sat in the DOM with **no possible way to ever reveal it**. `<details>` inverts that — the platform owns the
    disclosure, Enter/Space/tap work natively, and a closed panel is genuinely *unrendered* rather than laid out at zero
    height with `inert` on top, which also removes the `inert` bookkeeping entirely. Built HTML now has **0**
    `opacity:0` and **0** `inert`. Cost: the panel no longer animates open. The open state is signalled by the chevron
    rotating and a `Show`/`Hide` label, both pure CSS on `details[open]` via `group-open:`, so the label is correct
    with scripting off. Given the section's job is being readable, that is the right way round.
  - **`ProjectAccordion` (`src/components/ui/project-accordion.tsx`) has the same `opacity:0` + `inert` flaw the
    Experience timeline just fixed, and it is still there.** Eight project panels ship `height:0;opacity:0` + `inert`.
    Not touched — it is outside this task's scope and the Projects content is far more visible from the collapsed rows
    (name, tagline-adjacent summary) — but it is the same bug and the same fix applies.
  - **Measuring a closed `<details>` is a trap worth remembering.** The inner `<ul>`'s `getBoundingClientRect()` inside an
    unrendered content slot reports a **stale 52px while the whole panel measures 36px** — two earlier versions of the
    probe compared that number and "failed" a working component. `getComputedStyle().display` is also misleading: it
    still reports `block` for hidden content. The only trustworthy measure is the `<details>` box itself: closed it equals
    the `<summary>` height (36px), open it is 146px.
  - **Two contrast probes in this session were silently broken and both "passed" wrongly.** One parsed the computed colour
    with `/[\d.]+/` and assumed 0–255 RGB, but this design system uses `oklch()`, so it produced garbage — it reported
    **1.17:1** for body text that is plainly readable, and would equally have waved through a genuine 1.17:1 failure. Fix
    is to resolve any CSS colour by painting it to a 1×1 canvas and reading the pixel back, and to composite alpha against
    the resolved background first, because contrast is evaluated on the painted result. Measured properly, all 30 text
    nodes in the section clear AA at rest.
  - A **third** stale check counted `<li>` elements to verify the timeline's list structure and reported "14 structural,
    5 bullet" for 3 roles — it was counting the 11 `TagList` chip `<li>`s as structural, introduced with the per-role
    `<details>`. Nested lists inside a role are valid markup; the assertion was wrong, not the component.
- `ExperienceItem` (`content/types.ts`) gained `start: MonthKey`, `end: MonthKey | null` (`null` = current role, resolved
  to the present month at render, hence a client component), `outcome` (one line promoted above the bullets —
  `60% less manual paperwork`, `Best Capstone Project`, `RAG on Vertex AI and Gemini`), and `stack` (the tools each role
  used, authored per role rather than parsed out of the bullets — parsing "RAG" out of prose is a guess that quietly
  rots when a bullet is reworded, and a chip list that silently loses an item is worse than none). `meta` is untouched and
  remains the string that reaches the page; the numbers only drive geometry. `MonthKey` is a `` `${number}-${number}` ``
  template literal, not a `Date`: these are authored in content, never mutated, and a `Date` invites timezone arithmetic a
  calendar month does not have.
- **The outcome is the headline, not the bullets — the reverse of a usual resume block.** `outcome` gets the largest
  type in the stop and sits directly under the role, and the bullets are the evidence behind a disclosure. The strongest
  fact in each role is therefore on screen before any interaction, which is the main reason the section is readable at a
  glance.
- **Interaction:** rail fill is `scaleY` scrubbed to scroll via `useScroll({ offset: ["start 0.85", "end 0.4"] })`, so
  the only self-running motion answers the reader's own scroll position. Stops animate `opacity` only; `height`/`top`
  are never animated. Hover **and keyboard focus** both fill the marker, raise the outcome to full contrast, and drop
  the other stops to `opacity-55`. Stops are `tabIndex={0}` with no ARIA role — a list item being read, not a control
  being operated — so the treatment is not mouse-only. Verified: rail fill tracks scroll (0 → 0.05 → 0.37 → 0.68 as the
  section crosses the viewport), tab reaches all three stops with emphasis following focus, all 5 bullets present at
  full contrast with zero hidden nodes, one flat `<ol>` with 3 `<li>` and no nested list.
- Reduced motion: rail drawn full (`transform: none`), all stops at opacity 1, no dimming. The `useReducedMotion()`
  hook returns `null` before it settles, so `reduced = reduceMotion !== false` — truthiness would pick the animated
  branch and leave content invisible for anyone who asked for reduced motion.
- Known content quirks: `metadata`/`site`/navigation words match the writing voice in the source comments;
  keep copy, links, and `CONTACT_LINKS` in `contact.ts` in sync.
- **Skills ordering rule:** `TECH_STACK_GROUPS` is ordered by role relevance, AI first: `ai-ml`, `ai-apis`,
  `frontend`, `backend`, `data`, `languages`, `tooling`. The legend and the `StaggeredGrid` both derive from that
  array, so reordering the array reorders the page. Leading with a JS list reads as a web developer; leading with
  LangChain / LangGraph / RAG reads as an AI engineer, and the development stack becomes evidence of shipping
  rather than the headline. Inside `ai-ml` the order is orchestration and retrieval first, then libraries, then
  disciplines, because "Deep Learning" as a tile claims study while "LangGraph" claims shipping. Bento highlights
  are `langchain`, `langgraph`, `rag`, kept to three so the expanding band keeps its proportions.
  `TechIconKey` additions and their marks: `langgraph` and `pandas` use Simple Icons; `motion` (Framer) and
  `pgvector` have no official mark so they use lucide `Waves` and `DatabaseZap`.
- **Skills categories are visible, not hover-only.** `StaggeredGridItem` gained `groupLabel`, set on the first
  tile of each group; the grid renders it as a full-width header row. `StaggeredGrid` also gained `bentoLabel` for
  the band, which is pulled out of the AI group into its own labelled row ("Core of the AI work"). The old legend
  line above the grid was removed as redundant. Two constraints: a header must NOT carry the `grid__item` class,
  because the reveal assigns columns by reading the left edges of `.grid__item` and would animate a header as a
  tile; and headers use `role="presentation"` so the surrounding `role="list"` still exposes only technologies.
  `CategoryHeader` must stay at module scope, since the lint rule rejects components created during render.
- **Skills section is an index, not a tile grid.** `skills-section.tsx` renders `SkillsIndex`
  (`src/components/sections/skills-index.tsx`), driven by the same `TECH_STACK_GROUPS`. The VengeanceUI
  `StaggeredGrid` is no longer used anywhere and its file is dead. Design rationale, from research on how
  portfolios are read: recruiters spend ~15-30s on a resume and 45-90s on the site, so this section is built
  to be *read*; grouping by category is the recommended pattern and self-assessed percentages are rejected
  by every source as unmeasurable. The AI group leads and is the only header at full contrast, so hierarchy
  comes from contrast rather than size. Flat by design: no tiles, no per-item borders, no radii.
- **A "wait for the element" helper must wait for the BEHAVIOUR, not the DOM.** Three separate probe failures this
  session came from sampling across process boundaries, and each read as a product defect:
  1. `accordion-probe.mjs` waited for `[data-project-row] === 8`, true in the **server HTML** before React attaches
     handlers, so the click was swallowed. Failed 3/3 and looked like a reduced-motion bug in Projects.
  2. Pointer-driven motion needs **real** input. `dispatchEvent(new MouseEvent('mouseover'))` does not produce a
     pointer event, so `onPointerEnter` never fired; and a pointer left inside a bar from a previous step means no
     new `pointerenter` fires at all. Use CDP `Input.dispatchMouseEvent`.
  3. A hover target measured at `cy: -200` — above the viewport — silently does nothing. **Assert the target is on
     screen before dispatching at it.**
- **Synthesising a CSS `linear-gradient` in a canvas `fillStyle` does not work** when its stops use `color-mix()`
  with custom properties; canvas cannot resolve either. Measure gradients from real pixels or reason about them
  arithmetically rather than trying to composite them in JS.
- **Skills gained a composition bar, and it is also the section's only control** (`skills-index.tsx`). Grouping
  alone answers *which* categories exist, never *how much of the stack each one is* — the previous layout made
  "is this an AI portfolio that also ships, or a web portfolio with some AI in it?" a matter of opinion. The bar
  is **40 units wide, split into 7 segments sized by item count**, so AI/ML plus the model providers read as
  13 of 40. Measured: `0.225 / 0.100 / 0.174 / 0.100 / 0.174 / 0.125 / 0.100` against an expected
  `0.225 / 0.100 / 0.175 / 0.100 / 0.175 / 0.125 / 0.100` — max drift 0.001. **The figure is a `reduce` over
  `TECH_STACK_GROUPS`**, so it cannot drift when a technology is added; a hardcoded "33% AI" would be wrong
  within a year.
- **The bar is bidirectional, which is what makes it read as designed rather than assembled.** Hovering or
  focusing a segment emphasises its column below; hovering a column lights its segment above. One control that is
  also the overview, instead of a filter row sitting above a separate chart.
- **The composition bar's resting fill had to be made theme-relative, and the reason is worth keeping.**
  `bg-muted-foreground/25` measured **1.47:1** against the dark page and **1.37:1** against the light one — a
  clear WCAG 1.4.11 failure on a graphic whose entire job is to be read as a chart. The tempting argument is that
  the proportions are also stated in text, so the fill is decorative and exempt. That argument can be made to
  work and was rejected: it is arguing for an exemption rather than fixing the thing. **A single alpha cannot
  clear 3:1 in both themes**, because `muted-foreground` is light in dark and dark in light:

  | alpha | dark seg-vs-page | light seg-vs-page |
  |---|---|---|
  | 25% | 1.47:1 | 1.37:1 |
  | 55% | 2.98:1 | 2.12:1 |
  | **65%** | **3.79:1** | 2.49:1 |
  | **85%** | 5.76:1 | **3.54:1** |

  So the resting fill is `bg-muted-foreground/85` with `dark:bg-muted-foreground/65`, and hover goes to the full
  token. The count text stays `text-foreground`, which clears 4.5:1 on both fills (5.25:1 dark, 5.61:1 light).
  **The two constraints squeeze from opposite ends and 65/85 is the window where both hold at once.**
- **A muted-on-muted defect the broken colour probe had been hiding.** The 10px category label inside each segment
  was `text-muted-foreground`, sitting on a fill that is *itself* muted-foreground: **2.03:1 dark, 1.34:1 light**.
  It went unnoticed for several rounds because the probe in use resolved colours wrongly and reported the segment
  as far darker than it renders. Now `text-foreground`, matching the count beside it.
- **Canvas colour measurement has two traps, and both bit this session.**
  1. `getImageData` returns **premultiplied** values. Compositing them again in JS applies alpha twice. Fixed by
     painting the test colour onto an opaque page-coloured canvas and reading the pixel, so the browser composites
     once.
  2. A translucent background must be composited over **every** layer beneath it, not just the first ancestor
     that looks opaque. Walk the chain to the opaque backdrop, then paint bottom-up.
  Either mistake silently reports a fictitious failure (or hides a real one), and both did.
- **Two pieces of state, because "which category is emphasised" has two causes that must not fight.** `pinnedId`
  is a decision (click/tap) and must survive the pointer leaving; `previewId` is a hover/focus and must end when it
  does. `activeId = pinnedId ?? previewId`. The naive `openIndex ?? hovered` shape — the one `ProjectAccordion`
  had to be patched for — would drop the emphasis the moment the pointer moved off the bar onto a column.
  Activating the pinned segment again unpins it; Escape clears.
- **The segment label is only rendered when the share clears `LABEL_MIN_SHARE` (0.15)**, decided by comparing the
  known ratio rather than by measuring the DOM — the proportion is already in hand, so there is nothing to
  measure. At 320px that means 3 of 7 segments are labelled and 4 show only a count, instead of seven truncated
  words. Narrowest segment is 28px wide at 320px: below the 44px touch ideal, and unavoidably so for a 10% share.
- **The section's motion is BORROWED FROM HERO AND CONTACT, not invented to look like it.** The first version had
  `transition-colors duration-300` and read as dead next to the hero. It now runs the same four techniques those
  two sections already use, with the same numbers:

  | technique | borrowed from | here |
  |---|---|---|
  | spring `{ stiffness: 520, damping: 24, mass: 0.6 }` | `dragging-ball.tsx` hover/press | `TAP_SPRING`, segment fill + Experience bar |
  | pointer-following via `useMotionValue`, zero React re-renders | `raj-ball.tsx` fan riding the ball's `x`/`y` | each segment leans up to 4px toward the pointer |
  | staggered fan-out, `transitionDelay: i * stagger` | `radial-menu.tsx` | a category's items spring to full scale in sequence, 26ms apart |
  | ambient loop, frozen on reduce | `HeroGradientWaves` + `.skills-sheen` | the AI rule's 7s ink sweep (unchanged) |

  Measured, not assumed: lean `+3.62px` right / `-3.6px` left / `0.01` centred, still in flight at `-0.58` when
  the target was `3.62` (a real spring, not a tween); press squashes `0.9 → 0.606` and springs back; cascade reads
  `[0.974, 0.962, 0.948, 0.940, 0.940]` at +70ms settling to `[1,1,1,1,1]` at +350ms.
- **Every initial state is a TRANSFORM, never `opacity: 0`.** This is the rule that finally lets these sections
  animate. `initial={{ opacity: 0 }}` ships into the static HTML and a `whileInView` reveal needs an
  `IntersectionObserver` to fire, so with scripting off the whole section sits painted at zero — 40 technologies,
  gone. That is why `about-section.tsx`, `skills-index.tsx` and `experience-timeline.tsx` were all moved to
  `initial={false}`, which is safe and which also means nothing moves on entry at all. **`initial={{ y: 10 }}`
  resolves the two**: fully painted and readable in the static HTML (ten pixels low, not invisible), springing to
  rest when JS runs. Verified in the built `out/index.html`: `translateY(10px)` on the Skills columns,
  `translateY(12px)` on the Experience stops, and **zero** `opacity:0` in either section.
- **A bar sheen was tried and removed, for a measurable reason.** Sweeping `--background` across the composition
  bar breaks it: the light-theme resting fill sits at 3.54:1, so a white highlight keeps that ratio only at an
  alpha of **7% or less** — invisible. The effect was either imperceptible or a WCAG 1.4.11 failure. The sheen
  stays on the AI category's hairline, which carries no data. **Do not put a light overlay on a graphic that has
  to clear 3:1.**
- **`pointer-events-none` on the leaning contents span is load-bearing.** It sits above the fill, so it was the hit
  target and the fill's `whileHover`/`whileTap` never fired — measured press was `1 → 1.003 → 1` instead of a squash.
  Letting events fall through puts the fill back in front, and clicks still work because a press on a child bubbles
  to the `<button>`.
- **The button's box is transform-stable; every transform is on a child.** The bar's rect is cached once per gesture
  (`getBoundingClientRect` in a `pointermove` forces layout every frame) and is only valid because nothing moves
  the button itself. Same trade `raj-ball.tsx` makes, measuring the viewport once rather than per frame.
- **`--ease-spring` exists for the motion CSS has to own.** The `<details>` chevron turns because `details[open]`
  changed, and that state lives in the platform — there is no React state to hand a framer spring. A CSS
  `transition` is the only option, so the spring is a `linear()` curve that overshoots past 1 before settling.
  `--ease-change` is kept separately for pure state crossings: a colour should not overshoot past its target.
- **The Experience duration bar animates `scaleY`, never `scaleX`.** The bar's width *is* the encoded duration, so
  scaling X would shift the proportion. Verified under a live hover: `scaleY 1 → 1.35` with `scaleX` exactly 1 and
  the rendered width unchanged at 331px.
- **`viewport={{ margin: "-12% 0px" }}` legitimately leaves lower items un-triggered.** Parking a section's top at
  the viewport top and waiting measured `[0, 0, 10, 10]` for Skills and `[0, 0, 12]` for Experience — the negative
  margin is doing its job. Only a sweep through the whole section can assert that every item settles. **This is not
  a defect and the assertion was wrong**, not the component.
- **Column hover is deliberately mouse-only.** It is pure emphasis, and everything it emphasises is already visible
  and reachable via the bar's seven buttons, so making columns focusable would add seven more tab stops to a
  section that should be skimmable.
- **Reduced motion must never hide content here (bug found and fixed).** `useReducedMotion()` returns `null`
  until it settles, so a `reduceMotion ? false : { opacity: 0 }` test treats `null` as "motion allowed",
  applies the hidden initial state, and then leaves the section at `opacity: 0` for anyone who asked for
  reduced motion. `SkillsIndex` therefore computes `const reduced = hydrated && reduceMotion === true` and
  renders **plain elements** (not `motion.*` with `initial={false}`) whenever motion is reduced or still
  unknown. (The original `reduceMotion !== false` was the hydration bug described further down; the
  `hydrated &&` gate is the fix and the plain branch is what keeps the section readable without JS.)
  Verified: reduced-motion blocks measure `opacity: 1` with all 40 items present, the bar still renders and is
  still operable, and there are zero transitions over 300ms anywhere in the section.
- **`data-skills-readout` exists only for the probes.** The obvious selector,
  `[aria-hidden="true"].font-mono`, matches a bar segment's count span first — it is earlier in the DOM and also
  `aria-hidden` and `font-mono` — so a test using it read `"9"` as the readout text and reported a false failure.
  **When adding a test hook, check that the naive selector cannot reach the wrong element first.**
- **`getBoundingClientRect().top` is scroll-relative** and reported a phantom 8px "layout shift" when the
  Skills readout changed on hover — the shift was scroll jitter from a preceding `scrollIntoView`. The readout
  measures a constant 40px in every state at every width. Use `offsetTop` for layout-shift assertions.
- `TECH_STACK_HIGHLIGHT_IDS` are now marked in place at full contrast inside the AI group rather than pulled
  into a separate bento band, which had split the AI group and stranded three items under an unrelated
  category heading.
- `.skills-sheen` in `globals.css` is the section's only continuous animation (a 7s ink sweep across the AI
  rule). It is paused via `html:active-view-transition .skills-sheen` for the same reason the WebGL hero is,
  and `animation: none` under reduced motion.
- **`accordion-probe.mjs` had a hydration race that failed Projects under reduced motion.** Its
  `waitForAccordion` waits for `[data-project-row] === 8`, which is true in the **server HTML** before React has
  attached any handler, so a single click was swallowed by the un-hydrated tree and every row still read
  `aria-expanded="false"` 700ms later. Reproduced 3/3, looked like a reduced-motion bug, and was **not one**:
  verified over CDP that a real dispatched mouse click on row 2 under `reduce` does set `aria-expanded="true"`
  and opens the panel to 245px. Fixed by polling the click until the state actually flips, which tests
  hydration instead of luck. **Lesson: a "wait for the element" helper must wait for the behaviour, not the DOM.**
- **Achievements integrity rules:** only claims the public record supports. Team results are worded as team results
  and tagged `scope: "team"`, which the section renders as a "Team award" prefix. Excluded until the user's own
  certificate names them: the WiiZ Highest Workflow Creation and Most Active Participation awards, and the
  Capgemini Top 10 Side Quest prize (the team leader's individual result). The buildathon claim is
  **"Top 100 Finalist"**, not "Top 50". Five credentials seen earlier are absent pending issuer and date:
  Oracle Cloud AI Foundations, CII/NCVET applied ML foundation, Cloud Computing Engineering Gold, Google Cloud
  GenAI (EduSkills), Salesforce Developer virtual internship. `PROJECTS` is 8 entries ranked by substance, not
  stars, because this account's stars top out at 3 and three of the four 3-star repos are a tutorial, notes, and
  dotfiles; `PINNED_REPOS` is 6, matching GitHub's own pinned maximum.

## Showpiece effects (guest code, carefully adapted)

- **3D Paper** — `src/shaders/3d-paper/ThreeDPaper.tsx`. Author-verified vendored sources under
  `src/shaders/3d-paper/sources/` (from the `add-3d-paper` skill; digests validated by `verify:shaders` via
  `src/shaders/raw-document-loader.cjs`). The `next.config.ts` Turbopack `*.html?raw` rule is scoped to those
  four files; the loader never transforms them (hashes preserved).
- **Sketchbook** — `src/shaders/sketchbook/Sketchbook.tsx`, mounted in a sandboxed opaque-origin iframe; served
  CORS wildcard via `async headers()` for `/sketchbook/:path*`. Styles shared in `src/shaders/community.css`
  and `threeui.css`.
- **Contact ball (page-wide overlay)** — `src/components/layout/contact-ball.tsx` owns the position; the ball and the
  fan are its children. `position: fixed` full-viewport layer at `z-40` with `pointer-events: none`, so it can be
  dragged anywhere without eating page clicks; only `.drg-ball` and `.fan-opt` opt back in. It is `z-40` on purpose:
  under the 48px `z-50` header and under the `z-[100]` preloader. It renders inside `<main>` (that is where
  `PageShell` puts `children`, and it is the right landmark for a content control).
  - **Three separate clearances**, not one: `GAP=44` (air above the role line), `MARGIN=40` (edge clearance, grows
    to `OPEN_MARGIN=68+24+19=111` when open so the fan cannot open off-screen), and `TOP=48+HALF=76`. `TOP` is
    separate because the header is the one edge where "close to the screen" and "visible at all" differ; folding it
    into `MARGIN` would also push the ball 36px off the left/right edges.
  - **Start position** is measured from `#hero-role` (an `id` on the hero `<p>`, not a text query), after a
    `requestAnimationFrame` and guarded by a `parked` ref. Gotcha worth remembering: `place()` closes over `box`, so
    calling it from a mount-only effect hits `if (!box.w) return` and silently does nothing — the re-clamp effect
    then pulls the ball to the top-left corner. Anything that positions from a measured box must wait for the box.
  - The fan aims its middle option at the **viewport centre** (not up), read from the motion values so it re-aims
    mid-drag, gated to 1.5deg to avoid re-rendering 3 anchors at 60fps.
- **No `liquid-gooey`.** The stretch is a `transform` on an inner `.drg-squash` element, rotated to the velocity
  vector. Reason: the library's filter region is the size of its *group* (`dist/index.js:1923`), so a viewport-sized
  one re-rasterises ~1600x1060 of `feGaussianBlur`/`feComposite` per drag frame, on a page already running a WebGL
  wave field. The stretch is on an inner element on purpose — framer owns the outer transform for the drag and
  `whileTap`/`whileHover`, and two scales on one element fight.
- **Drag is not a tap.** Framer does *not* suppress the synthesized click after a drag (measured: click fires 15ms
  before `onDragEnd`), so `onPointerUp` stamps the time and `onClick` drops anything within 300ms. Two traps found
  the hard way: the stamp must be written in `onPointerUp` not `onDragEnd`, and `onDragEnd` must **clear**
  `dragging.current` — reusing `onDragStart` there leaves the flag true and every later tap stamps and suppresses
  itself, so the ball silently stops opening.
- **Bencho blocks** (globals.css big comment block) — `dragging-ball`, `eye-tracker`, contact fan, sourced from
  `bencho.dev`. **Prefer an already-vendored block over adding a new one:** each needs its own token bridge, and
  the About's eye-tracker is the reference for a standalone one (see Sections). Token map intentionally on the
  component root (`.ball-overlay`), not `:root`, so guest components can never look like native design tokens;
  `--fill-slab`/`--fill-on` inverted to ink-and-ground (a fixed white disc vanished on white, contrast ~1.06:1).
  Tones are `card | ink | bare`; `ink` (ball = `--foreground`, eyes = `--background`) is the one that stays legible
  on a bare page background in both themes, which is why the About avatar uses it. The overlay is `z-30`, under the
  mobile menu sheet at `z-40` — the menu is chrome and wins, the ball is page content and yields.
- **TextRoll (nav wordmark + labels)** — two stacked layers, base at `y:0` and a duplicate at `y:100%`, both rolling
  to `-100%`/`0` on the parent's `hovered` variant. Two traps, both found by measuring rather than reading:
  - The roll layer is `absolute inset-0`, which resolves against the **padding box**. The root carries
    `py-[0.1em]`, so the incoming copy sat 1.4px above the resting copy. Visible twice over: a ghost row of
    letter-tops under the wordmark at rest, and a 1.4px jump when the roll landed. Fixed with an inner `relative`
    wrapper so `inset-0` means the same line the base copy is on — aligned by construction, padding stated once.
  - The `prefers-reduced-motion` branch must keep `aria-hidden="true"`. It still renders visible text, just unanimated,
    and callers pair TextRoll with an `sr-only` label — which is a CSS clip, NOT `aria-hidden`, so it is always in the
    accessible name. Dropping it made every control announce itself twice: `"AchievementsAchievements"`.
- **Mobile nav is a full-height sheet, not a dropdown.** `NavMobilePanel` is `fixed inset-0 z-40 md:hidden` with the
  notch floating on top of it at `z-50`. It was an in-flow block after a `sticky` header, which broke two ways once you
  had scrolled: it was positioned by document flow, so at `scrollY 2200` its top edge was at `y=-2119` — off-screen,
  and `useBodyScrollLock` had already stopped the page scrolling, so the menu simply did not appear. It also stopped
  short of the fold, so on a landscape phone the icon rail sat below the viewport with no way to reach it. Full-height
  means the sheet IS the backdrop (tap to dismiss) and it covers the contact ball.
  - **Dismiss on `click`, never `pointerdown`.** Closing on pointerdown unmounts the sheet before the browser
    synthesises `click` on touchend, so the click resolves against the page underneath — measured: a tap on the sheet's
    empty middle jumped the page to `#contact`. A ghost click through your own dismiss gesture.
  - `sm:grid-cols-2` on the section links: six stacked 44px rows do not clear a 390px-tall landscape phone, three do.
  - `mt-auto` on the icon rail pins the socials to the bottom on a tall screen and collapses under the links when short.
  - `SiteHeader` closes the panel when `matchMedia("(min-width: 768px)")` flips. The panel is `md:hidden`, so
    rotating to desktop width hid it while `open` stayed true and the body stayed scroll-locked — page stuck until a
    reload.
- **Section anchors already carry `scroll-mt-20`** on `<section>` (`src/components/ui/section.tsx`). Do NOT also add
  `scroll-padding-top` to `html`: the two stack (measured 80+96=176) and it breaks `#top` ("back to top") by 96px.
- **PowerShell `Select-String -Path src\**\*.tsx` does not recurse.** It silently reports nothing, so a token that is
  present looks absent — this is how `scroll-mt-20` got "confirmed missing" and nearly got a duplicate rule added on
  top of it. Use the `grep`/Glob tools or pipe `Get-ChildItem -Recurse` into `Select-String`.
- **skiper-ui**: `skiper4.tsx` (`ThemeToggleButton2`, now demo-only; morph spring `MORPH_SPRING` stiffness 260
  damping 22; `<circle r>` seeded `r={8}` to avoid "undefined" from `getBBox` in some browsers), `skiper26.tsx`
  (`useThemeToggle`), `skiper40.tsx`.
- **WordsPreloader** (`src/components/ui/words-preloader.tsx`) — cold-load intro, mounted in `src/app/page.tsx`
  so it runs on the home page only (absent on `/paper` and the 404).
- **`Input.dispatchMouseEvent` with `type: "mouseWheel"` does not scroll this page.** A wheel-based scroll test
  built on it passes or fails at random and proves nothing. Use
  `Input.synthesizeScrollGesture`, where **negative `yDistance` scrolls down** and positive scrolls up — the sign is
  the opposite of the intuitive reading and is the usual reason a probe "confirms" a scroll that did not happen.
- **`Input.synthesizeScrollGesture` is async and smooth.** `await` it, then allow a beat (~3s) before reading
  `scrollY`; reading immediately returns the pre-animation value and makes a working scroll look broken.

## Hooks

`use-body-scroll-lock`, `use-escape-key`, `use-focus-containment`, `use-hydrated`, `use-scroll-spy` (in `src/hooks`).
`use-focus-containment` takes the trigger as a **ref**, not a detected `activeElement`: a tap does not focus the button
it taps on touch browsers, so the restore silently captured `<body>` and left focus stranded on the document.

## Curtain footer

The footer is **not at the end of the document**. It is a fixed layer at `z-0`, and `<main>` is opaque at `z-10` above
it, so it is invisible for the whole scroll and is uncovered only at the end, when the page slides up off the screen.
`curtain-runway` is one viewport of extra scroll that makes the translation possible. `CurtainScroll` (client,
renders nothing) drives it with GSAP ScrollTrigger; `SiteFooter` stays a **server component** so the footer is in the
static-export HTML — a footer that only mounts in an effect is a footer crawlers and plain `HTTP GET` clients never see.

- **A transform on `<main>` makes it the containing block for every `fixed` descendant.** The contact ball was mounted
  inside `<main>` and was silently captured by this; it now goes through `PageShell`'s new `overlay` prop. If you add
  another `position: fixed` overlay, put it there, not inside `children`.
- **The translate distance is `runway.offsetHeight`, never a number.** The runway is `100svh` and `window.innerHeight`
  is the *current* height; they diverge the moment the mobile URL bar collapses.
- **The runway is the trigger**, not the page's bottom edge: the runway sits immediately after, so its top edge *is*
  the page's bottom edge and there is no second measurement to disagree.
- **`autoAlpha`, never `opacity`, for anything that fades out over interactive content.** A transparent element is
  still hit-testable — fading the ball with `opacity` left it intercepting taps aimed at the footer's "Email me"
  (`elementFromPoint` returned the ball's eye SVG). Caught by a test, not by looking.
- **`.curtain-footer` needs `overflow-y: auto`.** It is a fixed, viewport-height box and its content does not fit a
  phone: 910px of content in a 664px viewport, 932px in 568px. With `hidden` the doormat links and the email line were
  clipped below the fold and unreachable — the widest link surface on the site, gone. Mobile spacing is tightened
  (short availability line under `sm`, reduced padding) so it nearly fits, and `auto` is the guarantee.
- **The wordmark fill uses `background-clip: text` on ONE text node.** The obvious build — outlined element plus a
  filled, clipped `::after` — misregisters by ~75px here, because `line-height: 0.78` makes the box 187px while the
  glyphs span 312px, so the two copies resolve against different line boxes. One node cannot drift.
- Reduced motion is a **CSS** branch (runway `display:none`, footer `static`), so the DOM is identical in both modes —
  no second tree, no hydration question. Verified: footer reachable, no transform, marquee off, wordmark at 45%.
- The footer mirrors `NAV_SECTIONS` as a doormat, so `nav a[href="#about"]` now matches **two** elements. Scope test
  selectors to `header nav …`.

## Accessibility pass (2026-10-01)

An audit of every route produced the fixes below. **Three of the bugs were mine**, introduced earlier in the
session; they are called out as such because the obvious instinct is to assume an inherited defect is not your
fault. Measured, not read.

### Fixed

- **The occluded footer was focusable (13 links).** The curtain leaves `.curtain-footer` behind an opaque
  `<main>` for the whole document, but nothing marked it `inert`. Hit-tested at `scrollY 0`: 13 of 13 footer
  links blocked by `<main>` yet still in the tab order, and since the container is `position: fixed` the browser
  cannot scroll a focused descendant into view, so tabbing produced no visible movement at all. Now `inert` in
  `PageShell` (server-rendered, so the hidden state is right before JS runs), released by a second ScrollTrigger
  in `CurtainScroll` on `onLeave`/`onEnterBack`. Verified: inert at `scrollY 0`, released once revealed, 0
  links blocked when visible.
- **Focus indicator was invisible in the light theme.** The shadcn base rule was `*{ @apply border-border
  outline-ring/50 }` — a colour only, leaving width and style to the UA default (measured `outline-style: auto`,
  `1px`), and `--ring` is `--vng-primary`, near-black in light. On the always-dark notch that measured **1:1**.
  Now `:focus-visible { outline: 2px solid var(--focus-ring, var(--ring)); outline-offset: 2px }`, and the notch
  and footer set `--focus-ring: #fafafa`. Measured after: 18.1:1 light, 19.06:1 dark.
- **Experience timeline failed AA whenever one stop was active** (mine). `opacity-55` on inactive stops composites
  against the page background *before* contrast is evaluated: muted body went 7.7:1 → **3.01:1** dark and
  4.74:1 → **2.12:1** light, 10/17 and 12/17 samples failing. `onFocus` triggered it too, so **tabbing** broke it.
  There is now no dimmed state: inactive stops hold full contrast and the active one is distinguished by its
  marker and its outcome line. Measured 0/17 failing at rest and hovered, both themes.
- **About was invisible without JavaScript** (mine, a real precedent in the codebase). Two `motion.div`s with
  `initial={{ opacity: 0 }}`, no `useReducedMotion()` guard. With script execution disabled: both wrappers at
  `opacity: 0` — the lead sentence, all three focus paragraphs and the whole Stack/Education sheet gone. Now
  renders plain elements when `reduceMotion !== false`.
- **MorphText ran an infinite blur+scale animation with no reduced-motion rule.** All six
  `prefers-reduced-motion` blocks in `globals.css` were read; none touched `morph-*`. It is the largest object on
  the hero (WCAG 2.2.2). Cancelling the animation alone would leave the rotator empty, since every word carries an
  inline `opacity: 0`, so the first word is pinned visible and the rest pinned hidden — the state the animation
  resolves to anyway, held still. Also dropped its render-blocking Google Fonts `@import`: the only third-party
  request on the site, and the family was never applied (the hero passes the site's Geist).
- **`/paper` had zero headings** — verified 0 `<h1>`/`<h2>`/`<h3>` in `out/paper.html`, and the certificate text is
  `ctx.fillText` on canvas, so the route's content existed only as pixels. Added an `sr-only` `h1`, an
  `aria-labelledby` section, and a visible text alternative.
- **The 404's links were all dead.** Only ids in the built document were `_R_` and `main`, against seven `#`
  fragments. Fixed at the source with a `homePrefix` prop threaded through `SiteHeader` → `NavSectionLinks` →
  `NavMobilePanel`, set to `"/"` on the 404 only, so the header's links match the doormat's.
- Skip link `z-[60]` → `z-[110]` (it was painted *behind* the `z-[100]` preloader for ~5s); `<main tabindex="-1">`
  so the skip link actually moves focus (it previously landed on Experience and skipped About); preloader `Skip`
  `text-white/45` → `/60` (4.487:1, needed 4.5:1 at 10px); `og:image` restored on `/paper` (a nested
  `openGraph` **replaces** the inherited object rather than merging, so the per-route override dropped `images`).
- Duplicate `nav aria-label="Primary"` while the mobile sheet was open → "Primary, secondary".

### Added

- **JSON-LD** (`src/content/json-ld.ts`): `Person` + `WebSite` are site-wide in the root layout; the home route
  adds `ProfilePage` + the work history as an `ItemList` of `Occupation`; `/paper` adds its own `WebPage` +
  `BreadcrumbList` and deliberately does **not** inherit the profile/work documents. Derived from
  `SITE` / `EXPERIENCE` / `AWARDS` / `EDUCATION`, so it cannot drift from the rendered page. `hasCredential`
  **excludes** `scope: "team"` awards — an edge to a team result is a statement about the person. Ongoing roles
  carry `duration` (ISO 8601) and no `endDate`; `startDate`/`endDate` cover the first/last day of the named month.
  `affiliation` (not `alumniOf`) is the in-progress university, and award display dates are normalised to ISO.
- **One `<script type="application/ld+json">` per document** (`src/components/seo/json-ld.tsx`). The first version
  joined them with `\n` into one tag, which is not valid JSON and which a crawler discards whole — caught in the
  export, not in review.
- **Web manifest** (`public/manifest.webmanifest`) + `public/icon.svg` + `apple-touch-icon.png`, generated from the
  SVG by `scripts/generate-touch-icons.mjs` (`npm run icons:touch`) so the raster cannot drift from the vector.

### SEO and discovery (2026-10-27)

- **Sitemap and robots are generated metadata routes, not committed files.** `src/app/sitemap.ts` and
  `src/app/robots.ts` replace `public/sitemap.xml` and `public/robots.txt`. Both declare
  `export const dynamic = "force-static"`; without it `output: "export"` fails while collecting `/sitemap.xml`.
- **Sitemap covers only routes that exist:** `/` (monthly, priority 1) and `/paper` (yearly, priority 0.6), both
  with `lastmod`. The home `<loc>` is `https://5at4am.me` with no trailing slash, matching the emitted canonical.
- **Robots** allows everything (including `_next`, so Google can render the page), emits `Host: 5at4am.me`, and
  points at `https://5at4am.me/sitemap.xml`.
- **Metadata** now sets root `robots`/`googlebot` (`max-image-preview:large`, unlimited snippet/video preview),
  a modest keyword list, creator/publisher, `en_IN` Open Graph locale, image `type`/`alt`, Twitter image alt,
  `appleWebApp`, and format detection. `/paper` restates `og:url`, `og:site_name`, `og:type`, `og:locale`, and
  images because a nested `openGraph` object replaces the root one. The explicit `/favicon.ico` metadata entry was
  removed; `src/app/favicon.ico` is a file convention and already emits the link.
- **One freshness date:** `SITE.updated = "2026-10-27"` drives sitemap `lastmod`, `ProfilePage`/`WebPage`
  `dateModified`, and the ongoing-role duration. Bump it when content changes.
- **Build check cleaned:** `scripts/build-site.mjs` no longer expects the removed `profile.html`; a clean build now
  checks only `index.html` and `paper.html`.
- **Verified in `site/`:** sitemap and robots parse; home JSON-LD is `Person, WebSite, ProfilePage, ItemList`;
  `/paper` JSON-LD is `Person, WebSite, WebPage, BreadcrumbList`; `/paper` has its own `og:url`; there is no
  duplicate favicon link.

### Semantic + motion pass (second round, 2026-10-01)

- **Projects had no subheadings at all.** The eight project names were bare `<span>`s inside buttons, so a
  heading-outline walk found `h2 Projects` with no children and then jumped to `h2 Skills` — while Experience, the
  neighbouring section, exposed its three roles as `h3`. Now `<h3>` per project, inside the trigger button. Legal, and
  it does **not** add a second stop to the accessible name: heading content is not concatenated into a button's name.
  The full page outline now reads h1 → h2 per section → h3 per item with no skipped levels.
- **The footer's group labels were `<p>`s and one group had no landmark at all.** "Sections" and "Elsewhere" are
  structural — they say what each group of links is — so they are now `<h3>`, each `nav` is `aria-labelledby` its own
  visible heading, and the old `aria-label="Footer"` (which duplicated the visible label) is gone. "Elsewhere" was a
  bare `<div>` of four links and a back-to-top that no landmark pointed at, so a screen reader's landmark list showed
  "Footer" and then nothing for the channels.
- **`aria-controls` pointed at an element that only existed while open.** `nav-mobile-panel.tsx` places
  `id="primary-menu"` inside `{open ? … : null}`, so the reference dangled whenever the panel was closed. Now
  `aria-controls={open ? "primary-menu" : undefined}` — `aria-expanded` already conveys "collapsed", and a dangling id
  is worse than none because a screen reader may offer to jump to something absent. Verified 0 of 10 collapsed buttons.
- **Escape on the contact fan stranded focus on `<body>`.** The same `open` change that re-adds `inert` to the arc made
  the focused node inert, so focus fell to `<body>` and the next Tab restarted from the top of the document.
  `RadialMenu` takes an optional `returnFocusTo` ref and restores focus on Escape; `DraggingBall` gained a `rootRef`
  and `raj-ball.tsx` wires the two. `setOpen` also became a `useCallback` — an unstable one re-armed the Escape listener
  on every render. Verified: focus lands back on the ball, `fanInert: true`, not `<body>`.
- **Two reduced-motion gaps closed.** `dragging-ball.tsx` consulted `reduce` only inside `settle()`, so `whileHover`
  and `whileTap` still squished — Framer does not disable those for anyone who asked for reduced motion. Both are now
  `undefined` rather than a zero-scale object. And the eye-tracker's 160ms blink fired every 2.6–5.8s regardless, at
  both call sites; it is now gated on the same `still` flag the spring and shape morph already used. Verified: hover
  under reduced motion leaves `transform` byte-identical.
- **The preloader declares each greeting's language.** Eight greetings in four scripts under `<html lang="en">`. Every
  layer is `aria-hidden` so nothing is mis-voiced today, but the document was displaying text it did not declare. One
  `lang` per script on the word layer: `fr es de zh-Hans ru ja hi`. `Hello` deliberately carries **no** `lang` — it is
  the document language, so declaring it would be noise.

### Traps recorded here

- **`themeColor` and `colorScheme` live on the `viewport` export, not `metadata`.** On `metadata` they compile
  without complaint and emit nothing. Verified absent from the built HTML until moved.
- **Layer order beats specificity — and `outline-ring/50` on `*` cannot be out-specified from `@layer base`.**
  Three attempts failed before the real cause was clear: a per-surface `header nav :focus-visible
  { outline-color: … }` lost; so did a `--focus-ring` custom property. The `*` rule's compiled
  `color-mix(in oklab, var(--ring) 50%, transparent)` outranked both. Moving the `:focus-visible` rule **out of
  `@layer base`** did not help either. What worked was removing `outline-ring/50` from the base rule entirely so
  `:focus-visible` owns the indicator outright. If a Tailwind v4 base rule beats a hand-written override, suspect
  the layer, not the selector.
- **`@property` silently un-inherits.** Registering a custom property to make it animatable resets its inheritance
  to whatever `inherits` says, and the default is `false`. An unregistered property inherits. This cost two rounds
  on the About wash: `--about-wash` was set to `1` on the mark, and measured `--about-wash: 1` on the mark while its
  `::after` computed `opacity: 0.34` — the registration's `initial-value`, every time, so hovering a paragraph looked
  like nothing happened. `inherits: true` fixed it; the painted pixel went from `25,25,27` to `58,58,59`. **When you
  register a property to animate it, check whether a child was relying on inheriting it.**
- **A gradient painted into an inline `mark` concentrates along the baseline.** Two attempts at the About wash
  painted `background-image` straight onto the mark and both came out looking like underlined links in screenshots
  (`engineering problem`, `outside a notebook`). The mark's height is the line box, so that is where the gradient's
  mass lands. A pseudo-element `inset: -0.12em -0.18em` is a real highlighter mark and cannot be misread as a rule.
- **Tailwind utilities cannot override an unlayered rule — not even `outline-none`.** The global
  `:focus-visible { outline: 2px solid … }` is unlayered (see the focus-indicator note above), and unlayered CSS
  outranks *every* `@layer`, `utilities` included. `outline-none` on the About paragraphs compiled, applied, and
  lost; measured still `outline: solid 2px`. Fixed with `[data-about-paragraph]:focus-visible { outline: none }` —
  specificity 0,2,0 against the bare pseudo-class's 0,1,0, in the same unlayered context. **When an unlayered rule
  seems unbeatable by a utility, it is: raise specificity, don't reach for `!important`.**
- **A focusable block of prose must not draw the control outline.** It drew a 2px white rectangle around a paragraph
  *and* its own 2px left rule. The left rule, the wash and the lifted text colour are the whole focus treatment, and
  all three are visible — nothing is lost, and keyboard users get exactly the state a pointer gets.
- **Screenshot every motion change.** Three separate defects here were invisible in the DOM and obvious in a
  screenshot: an underline-shaped wash, an invisible ignition caused by the `@property` inheritance, and paragraph
  spacing that had collapsed. Every one of them measured clean in JS.
- **`useReducedMotion()` IS `null` ON THE SERVER AND `false` IN THE BROWSER** (verified in
  `node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs`: the hook calls
  `initPrefersReducedMotion()` synchronously in its body, whose `isBrowser` guard returns early on the server, then
  captures the value with `useState`). So `reduceMotion !== false` — which this repo used in four components and which
  `memory.md` previously called "load-bearing" — is **`true` on the server and `false` in the browser**. It renders two
  different trees and React reports a hydration mismatch on **every page load**: About, Experience, Skills and the 404 all
  rendered their plain branch server-side and their animated branch client-side. **That note was wrong and cost a
  hydration error; the correct expression is `useHydrated() && useReducedMotion() === true`.** `useHydrated` is `false`
  for the server *and* the hydration render, so both pick the same branch.
- **A `whileInView` reveal and "visible without JS" are in direct conflict, and the visible state wins.** Once the
  server must render the animated branch, a hardcoded `initial={{ opacity: 0 }}` puts `opacity: 0` in the static HTML,
  and the reveal never fires without an `IntersectionObserver` — the content is in the DOM (measured 1017 chars, 8 marks,
  8 chips, 4 education rows) but painted at zero forever. Resolved with **`initial={false}`** on all four reveal wrappers
  in `about-section.tsx` and `skills-index.tsx`: the resting state is painted, the server and hydration render agree, and
  `whileInView` becomes a harmless no-op because the resting state IS the target. **The cost is that these blocks no
  longer animate in on the client.** That is the accepted trade and it is recorded at each call site.
- **Do not assert "no opacity:0 in the SSR HTML" as a proxy for "visible without JS".** It was a reasonable-looking
  check that became wrong the moment the hydration fix landed, and it passed for the wrong reason while the real defect
  stood. Assert the content is *present*, and measure visibility with `setScriptExecutionDisabled`.
- Reading `out/*.html` with a scoped `slice(indexOf('id="x"'), …)` is the reliable way to assert per-section
  markup; naive `/<ol class="flex flex-col">/` matches whichever list comes first on the page and reports an
  unrelated item count.
- `Input.dispatchMouseEvent` `mouseWheel` does not scroll this page. `Input.synthesizeScrollGesture` does, and
  **negative `yDistance` scrolls down**; it is async and smooth, so `await` it and allow ~3s before reading.

## Tooling / verification workflow

- The user keeps a `next dev` server on **:3000** (do not kill it).
- For probing after changes, start a throwaway production server when the build is clean:
  `node node_modules/next/dist/bin/next start -p 3278` with PID tracked in
  `C:\Users\aks10\AppData\Local\Temp\opencode\serv.pid`; kill + remove the PID file when done. Always start a
  fresh server; never trust a stale one.
- Headless-Chrome CDP probes live in `C:\Users\aks10\AppData\Local\Temp\opencode\*.mjs` (recent: `notchcheck.mjs`,
  `togglever*.mjs`, `aroundcheck.mjs`); screenshots go to `...\opencode\shots\`. Probe asserts geometry,
  computed styles, console/page errors, and screenshots both themes.
- After every change run: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- **Static export assertions:** `C:\Users\aks10\AppData\Local\Temp\opencode\verify-html.mjs` checks the built
  `out/*.html` for 43 invariants (footer `inert`, JSON-LD parses per block, `/paper` headings, 404 fragments
  resolve, manifest/icons/theme-color, timeline list validity, focus-ring CSS in the compiled bundle, About not
  hidden). `semantic.mjs` adds heading-outline and landmark checks (one h1, no skipped levels, project h3s, footer
  navs, `aria-controls`). Fast, no browser, and it is what catches things a screenshot will not.
- **`useHydrated`-gated components do not exist in the SSR HTML.** Grepping `out/index.html` for the preloader's
  per-word `lang` attributes found nothing and reported five failures — there was nothing to find. Anything asserted
  about those components has to be asserted against the live run (`runtime-verify.mjs` polls for the whole duration
  rather than sampling once, since at 2s only 2 of 8 words have rendered).
- **Browser assertions:** `verify-a11y.mjs` (footer inert lifecycle, focus-ring contrast per theme, timeline
  contrast at rest and focused, keyboard reach, About without JS, reduced motion) and `lean.mjs` (layout
  integrity, chat open/answer/Escape, footer release). Both randomise their debug port.
- **This machine runs out of RAM.** Repeated headless Chrome probes plus the user's own apps (CefSharp ~1 GB,
  Edge WebView2) exhaust 15 GB and the renderer then fails to respond to *any* `Runtime.evaluate`, including
  `document.title` — which looks exactly like a page bug and is not. When probes start timing out on a trivial
  expression, check `Get-CimInstance Win32_OperatingSystem` `FreePhysicalMemory` before touching site code. Kill
  stray `chrome.exe` and probe servers, but never the user's `next dev` on :3000.

## Hosting: 5at4am.me on GitHub Pages

- The live URL is **https://5at4am.me**. Served by the **`5at4am/5at4am.github.io`** user-site repo, *not* this
  one. `.github/workflows/publish-site.yml` mirrors `site/` into it on every push touching `site/**`.

- **THREE repos, do not confuse them.** Confirmed by `git ls-remote` on 2026-10-01:
  | Repo | Branch | What it is |
  |---|---|---|
  | `5at4am.github.io` | `main` | **The live site.** Built output only, no source. |
  | `5at4am-portfolio` | `pages-site` | **This app's source.** Local `main` tracks it. |
  | `5at4am-portfolio` | `main` | A *different, older* app, live at `5at4am.vercel.app`. |
  | `5at4am-portfolio` | `next` | Dead at `60b1c71`, predates the curtain footer. |
  - `5at4am/5at4am.github.io` came from the **GitHub Student Pack** (that is where the free `*.io` domain came
    from). Its `main` is unrelated history from this repo — it cannot be fast-forwarded against.
  - `5at4am-portfolio` has **no Pages site** (`gh api repos/5at4am/5at4am-portfolio/pages` → 404) and **no
    workflow runs ever** (`gh run list` is empty). The `publish-site.yml` mirror workflow has therefore never
    executed; `site/` has only ever reached the live repo by manual push. Its `PAGES_PAT` secret is not set
    either, so that workflow would fail at the clone step if it ever triggered.
  - Pages settings on `5at4am.github.io`, read via `gh api repos/5at4am/5at4am.github.io/pages`:
    `status: built`, `https_enforced: true`, `cname: 5at4am.me`, `custom_404: true`. **Enforce HTTPS is on** —
    the toggle the user could not click did get enabled, which retires the cert-issuance worry above.
  - `gh` (GitHub CLI 2.102.0) is installed at `C:\Program Files\GitHub CLI\gh.exe` and already authenticated as
    `5at4am` with `repo`/`workflow`/`read:org` scopes. It is **not on `PATH`** in this shell — prepend
    `$env:PATH = "C:\Program Files\GitHub CLI;$env:PATH"` per session, or call the exe by full path. Use it to
    read repo/Pages settings instead of asking the user to check the UI.
  - The two apps share the GitHub account but **not an ancestor commit**. `5at4am-portfolio` `main` has no
    `27630bf`, and vice versa. They are separate projects that happen to share a repo name, not two versions of
    one site. `git push` to this repo's `main` will be rejected as non-fast-forward, and **must never be forced**:
    it would destroy the source of a live Vercel deployment (sitemap, JSON-LD, `projects/[slug]` pages).
  - Local `main` was repointed to track `portfolio/pages-site`, so a plain `git push` is now correct and safe.
    Never `git push` to `portfolio main` from here.
  - The Pages repo is filled by **replacing its whole contents** with `site/` (same wholesale-swap the workflow
    does). A plain `git push site/` style merge would leave deleted routes live forever. Verified byte-identical
    by tree hash: local `HEAD:site` == `pages-site:site` == `5at4am.github.io` HEAD == `9a7a81a2`.
- Apex DNS points at all four Pages IPs (`185.199.108/109/110/111.153`); `www.5at4am.me` is a CNAME to the
  apex, so both hostnames must keep working. Registrar is Namecheap (`dns*.registrar-servers.com`).
- **The HTTPS cert gotcha, recorded 2026-10-01 because it cost real confusion.** Sharing the link showed
  "not secure" in browsers. `curl` failed with
  `curl: (60) schannel: SNI or certificate check failed: SEC_E_WRONG_PRINCIPAL`, and the served cert was
  `Subject: CN=*.github.io` — the wrong name entirely. Plain `http://` returned `200 OK`, which is what made it
  look like a deploy problem when it was never one.
  - Cause: `site/CNAME` is necessary but **not sufficient**. GitHub only mints a Let's Encrypt cert for a custom
    domain *after* the domain is saved in **repo Settings → Pages → Custom domain**. CNAME ships correctly via
    the mirror workflow and cert issuance is asynchronous, so a healthy deploy and a broken cert coexist
    silently. Nothing in the repo can cause or cure this; the fix is two UI clicks (save the domain, then tick
    **Enforce HTTPS**).
  - Cert issuance landed while we were watching: subject became `CN=5at4am.me`, valid to 2026-12-30, and
    `curl -sSI https://5at4am.me` returned `200 OK` over verified TLS.
  - **If this ever looks broken again, read this before touching code.** The site keeps serving over `http://`
    when Pages settings are reset, so HTTPS can be lost quietly with nothing visibly failing. Diagnose with
    `curl.exe -sSI https://5at4am.me` and inspect the subject:
    ```powershell
    $t=New-Object Net.Sockets.TcpClient("5at4am.me",443);$s=New-Object Net.Security.SslStream($t.GetStream(),$false,({$true} -as [Net.Security.RemoteCertificateValidationCallback]));$s.AuthenticateAsClient("5at4am.me");$s.RemoteCertificate.Subject
    ```
    `CN=*.github.io` means the domain was dropped from Pages settings and must be re-saved. A `curl: (60)` on
    `www` while the apex is clean means the cert covers only the apex.
  - **Enforce HTTPS greys out for a while even after the cert is valid** — GitHub's UI check lags issuance by
    minutes to hours. Do not redeploy in response; a redeploy cannot affect it. Hard-refresh
    (`Ctrl+Shift+R`) and, if still stuck, just wait and share the `https://` link.
- Fallback if GitHub never issues: Cloudflare in front of the domain terminates TLS with its own cert. Not
  needed while the Pages cert is valid.

## Theme lab (REMOVED)

`/theme-lab` existed as a theme-flash diagnostic and has been **deleted** (route + `theme-lab.tsx`). It was
never actually hidden: under `output: "export"` it shipped as a reachable page, and it looked bad because it
embedded skiper26's upstream demo with lorem ipsum copy and a `bg-muted2` token this theme does not define.
The reusable half survives as `use-theme-switch.ts`, which the real toggle uses.

The findings it produced are recorded above under Theme toggle and Current state, so nothing was lost by
deleting the page.

## Current state & known issues

- **Two build breakers found and fixed 2026-09-30, both worth remembering.**
  1. `src/app/globals.css` had three **lone `0x97` bytes** (offsets 28673, 29802, 31058; lines 742, 779, 826).
     A UTF-8 em dash is three bytes (`E2 80 94`); a single `0x97` is what one becomes when a UTF-8 file is
     written through Windows-1252. Turbopack could not decode the stylesheet and the whole `/page`
     endpoint failed with `TurbopackInternalError: failed to convert rope into string / invalid utf-8
     sequence of 1 bytes`. All three were inside **comments**, so no styles were ever affected. Fixed by
     byte-level replacement with `[System.IO.File]::ReadAllBytes` / `WriteAllBytes`; verified with a
     strict `UTF8Encoding($false, $true)` decode. Note `List[byte].AddRange([object[]])` fails in
     PowerShell 5.1 (silently drops the bytes), so use `MemoryStream` + `WriteByte` instead.
  2. `src/components/layout/curtain-scroll.tsx` called `tween.scrollTrigger?.addEventListener("update", …)`.
     `ScrollTrigger.addEventListener` is **static**, and its event list is only `scrollStart`, `scrollEnd`,
     `refreshInit`, `refresh`, `matchMedia`, `revert` — `"update"` was never valid. Per-trigger progress
     belongs on the config's `onUpdate`, which is also what keeps the fill driven by the same trigger as
     the tween rather than a second one.

- The theme toggle was just switched to the shadcn `@toggles/around` button (see Theme toggle). Verified live on
  the :3000 dev server: chip `[1359,12,36,36]`, clipPath present, theme flips both ways, wipe mask still
  `circle-blur` top-right + blur, 0 page errors.
- **Contact ball is done and verified.** Free-roaming overlay, verified live on :3000 with Playwright:
  `C:\Users\aks10\AppData\Local\Temp\opencode\ball.js` (35 checks: start position vs `#hero-role`, five corner drags,
  squash along travel and along a diagonal, fan fit/follow/aim, four close paths, drag-is-not-tap, a11y, eyes,
  scroll-independence) and `responsive.js` (32 checks across 375/390/768/1920 wide plus `prefers-reduced-motion`).
  Screenshots: `roam-{light,dark}-{1-closed,2-open-corner,3-open-lowleft}.png`. `tsc`, `lint`, and `build` clean.
  - Probing gotcha: a transform written by a rAF step cannot be sampled with a fixed `waitForTimeout` right after a
    drag — wait on `requestAnimationFrame` ticks, or the sample races the value and reads identity.
- `src/app/globals.css` hosts the `about-highlight` ink-wash utility (diagonal `color-mix` gradient on
  `--primary`, `box-decoration-break: clone`; NOT `:root`-scoped like the bencho tokens).
- The TextRoll hydration mismatch under forced reduced motion is fixed (the reduced branch waits for
  `useHydrated`, and both server and first client render emit the two-layer markup). Verified: no console errors in
  either motion mode.
- `next.config.ts` has no `output: "export"` committed (static-export work was in an earlier commit, `7c8f8d3`);
  a build previously succeeded with that flag uncommitted. Confirm desired export mode before a release build.

## Git

The working branch is `feat/animated-sections`, pushed to the `portfolio` remote
(`https://github.com/5at4am/5at4am-portfolio.git`). As of 2026-10-27 it carries the five commits that built the
animated sections (`67ff7b9` through `df43e2e`) plus five follow-up commits covering the live Experience beam,
the issuer bento for Achievements, the site shell and interaction primitives, the PWA and chat/SEO work, and the
docs and memory updates. `main` is never forced; see the hosting section for the three-repo topology. Commit
only when explicitly asked.
