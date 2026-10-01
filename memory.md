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
  `ABOUT.lead` + `ABOUT.focus` (`AboutParagraph` with exact-match `highlights` rendered by `HighlightedParagraph`);
  `ABOUT.bio` remains the single-paragraph fallback for the profile `terminal` variant. Availability pill was added
  then removed on request. `Section` shell shared by all home sections.
- `src/content/metadata.ts` — `rootMetadata` + `homeMetadata`; `src/content/types.ts` — shared types.

- **Experience is a scaled timeline rail** (`src/components/sections/experience-timeline.tsx`), not a list. It was the
  only flat block on the page, sitting between Projects and Skills which both ask for attention, and the content
  decided the shape: three short roles in a tight window where the gaps are real information. Stops are ordered
  oldest-first by `start`, and the space between two stops is proportional to the months actually between them, so an
  8-month gap and a 3-month gap read as different sizes. **Only the gaps are scaled** — within a stop the height is
  content-driven, because a 2-month role carries the same text as a 12-month one and date-proportional heights would
  force truncation. **Each role's own duration is deliberately NOT printed:** the date range is already on the stop in
  full, and a bare "3 months" for the job sits a few pixels from a "3 months" for the gap in the same mono weight, which
  is a genuine ambiguity between two different quantities. One number per gap, none per stop.
- `ExperienceItem` (`content/types.ts`) gained `start: MonthKey`, `end: MonthKey | null` (`null` = current role, resolved
  to the present month at render, hence a client component), and `outcome` (one line promoted above the bullets —
  `60% less manual paperwork`, `Best Capstone Project`, `RAG on Vertex AI and Gemini`). `meta` is untouched and remains
  the string that reaches the page; the numbers only drive geometry. `MonthKey` is a `` `${number}-${number}` `` template
  literal, not a `Date`: these are authored in content, never mutated, and a `Date` invites timezone arithmetic a
  calendar month does not have.
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
- **Reduced motion must never hide content here (bug found and fixed).** `useReducedMotion()` returns `null`
  until it settles, so a `reduceMotion ? false : { opacity: 0 }` test treats `null` as "motion allowed",
  applies the hidden initial state, and then leaves the section at `opacity: 0` for anyone who asked for
  reduced motion. `SkillsIndex` therefore computes `const reduced = reduceMotion !== false` and renders
  **plain elements** (not `motion.*` with `initial={false}`) whenever motion is reduced or still unknown.
  Verified: reduced-motion blocks measure `opacity: 1` with all 40 items present.
- `TECH_STACK_HIGHLIGHT_IDS` are now marked in place at full contrast inside the AI group rather than pulled
  into a separate bento band, which had split the AI group and stranded three items under an unrelated
  category heading.
- `.skills-sheen` in `globals.css` is the section's only continuous animation (a 7s ink sweep across the AI
  rule). It is paused via `html:active-view-transition .skills-sheen` for the same reason the WebGL hero is,
  and `animation: none` under reduced motion.
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

History is intentionally shallow: `27630bf` Create Next App (no navbar), `c804111` first navbar design,
`7c8f8d3` build flag commit, `60b1c71` notch navigation + contact ball + preloader + export-driven deploy (this one
also swept in the deleted story/credentials sections and removed the tracked `__pycache__` files). Uncommitted as of
now: only the contact-ball bug fixes (`page.tsx`, `contact-ball.tsx`, `dragging-ball.tsx`) plus this `memory.md`
update. Commit only when explicitly asked.
