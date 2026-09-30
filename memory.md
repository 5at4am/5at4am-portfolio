# Project Memory — 5at4am

Persistent knowledge base for the `5at4am` project. Reads like a memory: stack, architecture, conventions,
decisions, current state, and how to verify work. Update this file whenever the project changes materially.

---

## Overview

A personal brand / portfolio site (name "5at4am") built on **Next.js 16 (App Router, Turbopack)** with React 19,
statically exported. Resume-style home page plus profile and 3D-paper showcase routes. Dark glass + zinc visual
language, GSAP reveals, view-transition theme switching, and a set of guest shader/component showpieces
(3D Paper, sketchbook, draggable ball, eye tracker, contact fan).

## Stack

| Area        | Choice |
| ----------- | ------ |
| Framework   | Next.js **16.3.6** (App Router, Turbopack, static export) |
| React       | **19.2.8** |
| Styling     | Tailwind CSS **v4** (`@import "tailwindcss"`), `tw-animate-css`, `shadcn/tailwind.css` |
| Motion      | `motion` (framer-motion v13) + `gsap` + `lenis` + `aos` |
| UI bits     | `@base-ui/react`, `lucide-react`, `react-icons`, `liquid-gooey`, `ogl`, `threeui-cli`, `shadcn` |
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

- `/` — resume home: `Hero → About → Experience → Projects → Skills → Achievements → Contact`
  (`src/app/page.tsx`). Pure composition; every string comes from `src/content`. Hero is not in the nav.
- `/profile` — profile page (`src/components/sections/profile-*`, `profile-header.tsx`, `src/app/profile/page.tsx`).
- `/paper` — 3D paper showcase (`src/components/layout/paper-header.tsx`, `src/app/paper/page.tsx`,
  `src/components/three-d-paper/connect-three-d-paper.tsx`).

`src/app/layout.tsx` owns the document shell: fonts, `<ThemeProvider>`, `WordsPreloader`, and a
skip link to `#main` (rendered by `PageShell`). The preloader lives in the layout so it never replays on
client-side route changes.

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

- `src/components/theme/theme-toggle.tsx` — the switch. Two halves kept separate:
  - **Face:** `Around` from `@/components/ui/around`, installed via `npx shadcn@latest add @toggles/around`.
    A CSS-driven sun morphing into a moon (clip morph + rays). It is intentionally **uncontrolled**: the icon
    follows the `.dark` class on `<html>` via `@custom-variant dark` — no mirrored state, no hydration mismatch.
    Sizing note: its svg is `1em`, so the wrapper pins it with `[&_svg]:size-6` inside a `size-8` chip
    (site-header supplies the `size-9` glass chip at `fixed right-3 top-3 z-50`).
  - **Transition:** `useThemeToggle` from `src/components/ui/skiper-ui/skiper26.tsx`, configured
    `{ variant: "circle-blur", blur: true, start: "top-right" }`. Wraps `next-themes` in
    `document.startViewTransition`, injecting `<style id="theme-transition-styles">` into `<head>` that wipes
    from the toggle corner (blurred circle, `cx=40 cy=0`, `350vmax`). Feature-detected; no-View-Transition
    browsers swap instantly. **Keep this wiring verbatim** when restyling the button.
- `ThemeProvider` (`theme-provider.tsx`): `next-themes` with `attribute="class"`, `defaultTheme="system"`,
  `enableSystem`, persisted under `localStorage["theme"]`. `<html suppressHydrationWarning>` is required because
  next-themes sets `.dark` in a blocking script ahead of hydration.

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

- **About** (`about-section.tsx` + `ABOUT`/`EDUCATION`/`AVAILABILITY` in `site.ts`) — two-column on home: left narrative (lead + paragraphs with `about-highlight` ink-wash marks on key phrases via `HighlightedParagraph`, quiet `motion` fade-up reveal, `motion/react`); right fact sheet of two dark-glass cards (Stack `TagList tone="onDark"` + Education `dl` rows). Availability pill was added then removed on request. `Section` shell shared by all home sections.
- `src/content/metadata.ts` — `rootMetadata` + `homeMetadata`; `src/content/types.ts` — shared types.
- Known content quirks: `metadata`/`site`/navigation words match the writing voice in the source comments;
  keep copy, links, and `CONTACT_LINKS` in `contact.ts` in sync.

## Showpiece effects (guest code, carefully adapted)

- **3D Paper** — `src/shaders/3d-paper/ThreeDPaper.tsx`. Author-verified vendored sources under
  `src/shaders/3d-paper/sources/` (from the `add-3d-paper` skill; digests validated by `verify:shaders` via
  `src/shaders/raw-document-loader.cjs`). The `next.config.ts` Turbopack `*.html?raw` rule is scoped to those
  four files; the loader never transforms them (hashes preserved).
- **Sketchbook** — `src/shaders/sketchbook/Sketchbook.tsx`, mounted in a sandboxed opaque-origin iframe; served
  CORS wildcard via `async headers()` for `/sketchbook/:path*`. Styles shared in `src/shaders/community.css`
  and `threeui.css`.
- **Bencho blocks** (globals.css big comment block) — `dragging-ball`, `eye-tracker`, contact fan. Token map
  intentionally on component roots, not `:root`, so guest components can never look like native design tokens;
  `--fill-slab`/`--fill-on` inverted to ink-and-ground (a fixed white disc vanished on white, contrast ~1.06:1).
- **skiper-ui**: `skiper4.tsx` (`ThemeToggleButton2`, now demo-only; morph spring `MORPH_SPRING` stiffness 260
  damping 22; `<circle r>` seeded `r={8}` to avoid "undefined" from `getBBox` in some browsers), `skiper26.tsx`
  (`useThemeToggle`), `skiper40.tsx`.
- **WordsPreloader** (`src/components/ui/words-preloader.tsx`) — cold-load intro in root layout.

## Hooks

`use-body-scroll-lock`, `use-escape-key`, `use-hydrated`, `use-scroll-spy` (in `src/hooks`).

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

## Current state & known issues

- The theme toggle was just switched to the shadcn `@toggles/around` button (see Theme toggle). Verified live on
  the :3000 dev server: chip `[1359,12,36,36]`, clipPath present, theme flips both ways, wipe mask still
  `circle-blur` top-right + blur, 0 page errors.
- **Build blocker (user handling):** untracked `src/components/layout/contact-ball.tsx` has one tsc error
  (`MotionValue` to `CSSProperties` cast) that fails `npx tsc --noEmit`; lint is clean. Do not modify it unless
  asked. The earlier `eye-tracker/` and `radial-menu/` errors were fixed and no longer block.
- `src/app/globals.css` hosts the `about-highlight` ink-wash utility (diagonal `color-mix` gradient on
  `--primary`, `box-decoration-break: clone`; NOT `:root`-scoped like the bencho tokens).
- **Pre-existing bug:** TextRoll hydration mismatch under forced reduced motion.
- `next.config.ts` has no `output: "export"` committed (static-export work was in an earlier commit, `7c8f8d3`);
  a build previously succeeded with that flag uncommitted. Confirm desired export mode before a release build.

## Git

History is intentionally shallow: `27630bf` Create Next App (no navbar), `c804111` first navbar design,
`7c8f8d3` build flag commit. Uncommitted working tree includes: notch header, Around toggle, 3D-paper page,
bencho/guest components, deleted story/credentials sections, and the untracked sections above. Commit only when
explicitly asked.