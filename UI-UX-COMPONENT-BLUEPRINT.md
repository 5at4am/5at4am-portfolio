# PORTFOLIO UI/UX COMPONENT BLUEPRINT — Satyam Raj

> **Role:** Senior UI/UX Designer · Creative Director · Frontend Engineer · Motion Designer
> **Portfolio:** Personal Developer / AI + Full-Stack Portfolio
> **Audience:** Recruiters, hiring managers, engineering peers, potential collaborators

---

# 1. PORTFOLIO DESIGN DIRECTION

## Visual Identity: "Dark Editorial-Tech"

A black canvas with a single electric-orange accent, oversized geometric typography, and cinematic depth. The identity is **Linear × Raycast × editorial magazine** — restrained, precise, and confident — with an original orange-on-black signature that is unmistakably *yours*.

### Core principles

| Principle | Execution |
|---|---|
| **Typography is the hero** | Onest 800–900 at display sizes. Headlines carry the design; decoration stays out of their way. |
| **One accent, disciplined** | `#FF5D00` orange is the *only* accent. Never introduce a second brand color. |
| **Black is a material, not a default** | `#0D0101` canvas with layered depth: Aurora glow, grid pattern, noise, subtle borders. |
| **Motion has a job** | Every animation either reveals information, guides attention, or confirms interaction. Nothing loops for its own sake. |
| **Recruiter-first in 5 seconds** | Hero answers: *Who am I → What I build → What I'm good at → Where to see work.* |
| **Premium restraint** | Whitespace is generous. Borders are thin (`1px white/8`). Shadows are soft. Nothing shouts. |

### What stays from the current build (already working — do not replace)

- ✅ Aurora WebGL hero background (brand orange) — keep, but pause off-screen
- ✅ Mascot SVG (ip-as-logo style) — keep as brand mark, add hover micro-interaction
- ✅ Lenis smooth scroll — keep
- ✅ Design tokens (colors, Onest, radius, glow) — keep as the consistency backbone
- ✅ SSG project pages — keep
- ✅ HF image generation pipeline — keep for project thumbnails

### What gets rejected

- ❌ Testimonials — no social proof yet as a final-year student; fake testimonials hurt credibility
- ❌ Services section — premature; "What I Do" as a compact strip inside About instead
- ❌ Heavy 3D/WebGL scenes beyond Aurora — unjustified performance cost
- ❌ Particle effects, confetti, floating objects — gimmicky, violates Rule 2
- ❌ Anime.js as a standalone dependency — redundant with Framer Motion + GSAP for this scope

---

# 2. SECTION-BY-SECTION COMPONENT MAP

| # | Section | Component | Library | Priority | UX Value | Performance |
|---|---------|-----------|---------|----------|----------|-------------|
| 1 | Navbar | Glass pill nav + scroll progress bar + active-section highlight | Custom CSS + Framer Motion | P0 | 9 | 10 |
| 2 | Hero | Split-text reveal + Aurora bg + magnetic CTAs + terminal intro line | GSAP SplitText + React Bits (Magnetic) | P0 | 10 | 7 |
| 3 | About | Editorial split layout + animated stat counters + "What I Do" strip | React Bits (CountUp) + Framer Motion | P0 | 9 | 9 |
| 4 | Skills | Categorized chip cards + marquee strip + hover scramble on chips | React Bits (Text Scramble) + Custom | P1 | 8 | 9 |
| 5 | Projects | Spotlight cards + tilt + filter tabs + AI thumbnails | React Bits (Spotlight Card, Tilted Card) | P0 | 10 | 8 |
| 6 | Experience | Scroll-driven timeline with progress line | GSAP ScrollTrigger + Custom | P1 | 9 | 8 |
| 7 | Education | Compact card (merged into About, not standalone) | shadcn/ui Card | P2 | 6 | 10 |
| 8 | Achievements & Certs | Award grid with hover glow | Custom CSS + Framer Motion | P1 | 8 | 10 |
| 9 | GitHub Activity | Live pinned-repos strip via GitHub API | GitHub API + Custom | P2 | 7 | 7 |
| 10 | Resume | Sticky download CTA + inline PDF viewer | shadcn/ui Button + Custom | P1 | 9 | 9 |
| 11 | Contact | Form + contact cards + magnetic social buttons | Custom + Framer Motion | P0 | 9 | 9 |
| 12 | Footer | Minimal bar + back-to-top + local-time widget | Custom | P1 | 7 | 10 |
| — | Page transitions | Route fade/slide via App Router template | Framer Motion | P1 | 8 | 9 |
| — | Custom cursor | Blend-mode dot + ring (desktop only) | Custom CSS | P2 | 6 | 8 |
| — | Command palette | ⌘K search over projects/skills/links | Custom + Framer Motion | P2 | 8 | 8 |

---

# 3. DETAILED COMPONENT RECOMMENDATIONS

---

## 1. Navbar

### Purpose
Persistent orientation + instant access to sections, GitHub, LinkedIn, and resume. Must feel invisible until needed.

### Recommended UI Component
Glass pill navigation (current design) **upgraded with**:
- Scroll progress bar (2px orange line at the very top)
- Active-section highlight (pill background shifts as you scroll)
- Resume download button in the pill (replaces "Hire Me" — recruiters want the resume)

### Library
Custom CSS + Framer Motion (`useScroll` + `useSpring` for progress).

### Why This Component
The pill nav already matches the design language. The additions solve real recruiter needs: knowing where they are (progress + active section) and grabbing the resume in one click.

### Interaction
- **Hover:** link text shifts to orange; pill background lightens
- **Click:** Lenis smooth-scrolls to section; active pill updates
- **Scroll:** progress bar fills; nav gains backdrop-blur + border after 40px
- **Mobile:** hamburger → full-height overlay menu with staggered link entrance

### Animation
- Entrance: slide down + fade (300ms, ease-out)
- Progress bar: spring-smoothed (stiffness 100, damping 30)
- Active pill: layout-animated background (Framer Motion `layoutId`)
- Timing: 200–300ms micro-interactions

### Visual Hierarchy
1. Logo (SR mark) — brand anchor
2. Active section pill — orientation
3. Resume button — conversion
4. Links — secondary

### Mobile Behavior
Hamburger → overlay menu (full-screen, backdrop-blur, staggered links). Resume button stays visible in the bar.

### Performance Risk
**LOW** — CSS transforms + one scroll listener.

### Recommendation
UI Quality: 9/10 · UX Value: 9/10 · Performance: 10/10 · Portfolio Value: 9/10

---

## 2. Hero

### Purpose
The 5-second pitch. Must communicate identity, specialty, and proof of skill before the visitor scrolls.

### Recommended UI Component
**Layered hero:**
1. Aurora WebGL background (existing) — cinematic depth
2. **Split-text headline reveal** — "SATYAM" / "AI ENGINEER" masks up line-by-line with staggered character rise
3. **Terminal intro line** — `$ whoami → AI Engineer building with LLMs, RAG & agents` typed once, then fades
4. **Magnetic CTA buttons** — "View Projects" (solid orange) + "Download Resume" (ghost)
5. Mascot with idle float + hover react

### Library
GSAP SplitText (or React Bits Split Text) for the headline; React Bits Magnetic Button for CTAs; Framer Motion for the rest.

### Why This Component
The headline reveal is the single highest-impact animation on the page — it makes the first impression feel *crafted*. The terminal line is a developer-authentic identity hook. Magnetic buttons add premium tactility without noise.

### Interaction
- **Enter:** headline characters rise with mask reveal (staggered 0.02s); terminal types; CTAs fade up last
- **Hover (CTA):** button magnetically follows cursor within 40px radius; solid button glows
- **Hover (mascot):** mascot tilts toward cursor, chest light brightens
- **Scroll:** hero content parallaxes up slightly (0.15 factor) while Aurora stays fixed

### Animation
- Entrance: SplitText mask reveal — `y: 110% → 0`, stagger 0.02s, duration 0.8s, ease `power4.out`
- Terminal: type 1.2s, hold 1.5s, fade out
- Magnetic: translate toward cursor, spring back on leave (300ms)
- Scroll: parallax `y` transform, GSAP ScrollTrigger scrub 0.3

### Visual Hierarchy
1. Headline (display-xl, black weight)
2. Terminal line (identity proof)
3. CTAs (conversion)
4. Mascot (brand personality)
5. Aurora (atmosphere — must never compete with text)

### Mobile Behavior
- Aurora opacity reduced to 40% (battery + GPU)
- Headline scales down via `clamp()` (already handled)
- Magnetic effect disabled (no hover); CTAs full-width stacked
- Terminal line shortened

### Performance Risk
**MEDIUM** — WebGL (Aurora) + SplitText. Mitigate: pause Aurora when off-screen via IntersectionObserver; SplitText runs once on mount.

### Recommendation
UI Quality: 10/10 · UX Value: 10/10 · Performance: 7/10 · Portfolio Value: 10/10

---

## 3. About Me

### Purpose
Humanize the developer. Answer "who is this person beyond the stack?" in under 15 seconds of reading.

### Recommended UI Component
**Editorial split layout** (current design) upgraded with:
- **Animated stat counters** — 60% (manual effort reduced), 2+ (years), 8.34 (CGPA), 5+ (certs) count up on scroll-into-view
- **"What I Do" strip** — 3 compact items (LLM Systems · RAG Pipelines · Agentic Workflows) replacing a separate Services section
- Education card (existing) stays

### Library
React Bits CountUp (or Framer Motion `useInView` + custom counter); Custom CSS.

### Why This Component
Counters turn static numbers into proof. The "What I Do" strip delivers the Services value without a full section — Rule 3 (one design language) and Rule 4 (recruiter-first) both served.

### Interaction
- **Scroll:** counters trigger at 60% viewport visibility, count up once (0.8–1.2s)
- **Hover (strip items):** border glows orange, icon scales 1.05
- **Click:** strip items deep-link to relevant project

### Animation
- Counters: ease-out exponential, 1s, trigger `whileInView`
- Strip: staggered fade-up (0.1s stagger)

### Visual Hierarchy
1. Summary paragraph (the story)
2. Counters (proof)
3. "What I Do" strip (capability)
4. Education card (credential)

### Mobile Behavior
Counters become 2×2 grid; strip stacks vertically; education card full-width.

### Performance Risk
**LOW** — counters are rAF-based, run once, no layout thrash.

### Recommendation
UI Quality: 9/10 · UX Value: 9/10 · Performance: 9/10 · Portfolio Value: 9/10

---

## 4. Skills / Tech Stack

### Purpose
Prove breadth without a wall of text. Recruiters scan for keywords — make them scannable and slightly interactive.

### Recommended UI Component
- **Categorized chip cards** (existing) with **hover text-scramble** on the category label
- **Marquee strip** (existing) — keep, it's the "wow" moment
- Optional: skill proficiency bars — **rejected** (subjective, recruiter-skeptical)

### Library
React Bits Text Scramble (category labels only); Custom CSS for chips.

### Why This Component
Scramble on category labels adds a subtle "this person knows frontend" signal without distracting. Chips stay scannable. No fake proficiency meters.

### Interaction
- **Hover (chip):** border → orange, background → `accent/10`, text → orange
- **Hover (category):** label scrambles once (400ms), then settles
- **Scroll:** marquee runs continuously (CSS animation, GPU-friendly)

### Animation
- Scramble: 400ms, characters cycle then resolve
- Marquee: 30s linear loop, `translateX(-50%)`, pause on hover

### Visual Hierarchy
1. Category labels (grouping)
2. Chips (keywords)
3. Marquee (energy)

### Mobile Behavior
Marquee continues (CSS-only, cheap); scramble disabled (no hover); chips wrap naturally.

### Performance Risk
**LOW** — CSS marquee + one-off scramble on hover.

### Recommendation
UI Quality: 8/10 · UX Value: 8/10 · Performance: 9/10 · Portfolio Value: 8/10

---

## 5. Featured Projects

### Purpose
The strongest proof of ability. Must make visitors *want* to click through to case studies.

### Recommended UI Component
**Spotlight cards** (cursor-following radial highlight) + **subtle 3D tilt** + **filter tabs** (All / RAG / Agents / Full-Stack) + **AI-generated thumbnails** (HF pipeline already built).

### Library
React Bits Spotlight Card + Tilted Card; Framer Motion for filter layout animation.

### Why This Component
Spotlight + tilt is the single most "premium" interaction on modern portfolios — it makes static cards feel alive and rewards exploration. Filters demonstrate organization. AI thumbnails make each project visually distinct (Rule 4: show, don't tell).

### Interaction
- **Hover:** spotlight follows cursor (radial gradient at cursor position); card tilts max 4°; thumbnail scales 1.03; "View case study" arrow slides
- **Click:** navigates to `/projects/[slug]` (SSG page)
- **Filter:** cards re-layout with `layout` animation; active filter pill highlights
- **Scroll:** cards stagger in (0.12s)

### Animation
- Spotlight: `background: radial-gradient(600px at x y, accent/12, transparent)` — rAF or CSS var update
- Tilt: rotateX/rotateY via transform, spring back on leave (300ms)
- Filter: Framer Motion `layout` + AnimatePresence (200ms)

### Visual Hierarchy
1. Thumbnail (visual hook)
2. Title + year (identity)
3. Description (substance)
4. Tech chips + links (detail)

### Mobile Behavior
Tilt + spotlight disabled (no hover); cards stack; filter tabs horizontally scrollable; thumbnails use `next/image` with proper sizes.

### Performance Risk
**MEDIUM** — spotlight uses per-frame style updates. Mitigate: throttle to rAF, use `transform`/`background` only, disable on touch devices.

### Recommendation
UI Quality: 10/10 · UX Value: 10/10 · Performance: 8/10 · Portfolio Value: 10/10

---

## 6. Experience

### Purpose
Show career trajectory and impact with metrics. Timeline must be scannable top-to-bottom.

### Recommended UI Component
**Scroll-driven timeline** (existing structure) upgraded with:
- **Progress line** that fills as you scroll (orange gradient)
- **Sticky role headers** on desktop (role stays pinned while bullets scroll past)
- Metric callouts (e.g., "60% manual effort reduced") rendered as orange stat chips

### Library
GSAP ScrollTrigger (progress line); Custom CSS + Framer Motion for cards.

### Why This Component
The filling timeline line gives a sense of journey. Sticky headers make scanning fast. Metric chips surface the impact numbers recruiters hunt for.

### Interaction
- **Scroll:** timeline line fills proportionally (scrub); cards fade/slide in as they enter
- **Hover (card):** border glows; metric chip brightens
- **Click:** company name links to company site (if available)

### Animation
- Progress line: GSAP ScrollTrigger scrub, `scaleY` from 0→1, ease none
- Cards: fade-up + slight x-slide, stagger 0.1s, `power2.out`

### Visual Hierarchy
1. Role + company (identity)
2. Metric chips (impact)
3. Bullet points (detail)
4. Period/location (context)

### Mobile Behavior
Timeline line moves to left edge (existing pattern); sticky headers disabled; cards full-width.

### Performance Risk
**LOW–MEDIUM** — one ScrollTrigger instance; scrub is transform-only.

### Recommendation
UI Quality: 9/10 · UX Value: 9/10 · Performance: 8/10 · Portfolio Value: 9/10

---

## 7. Education

### Purpose
Credential proof. Does not deserve a full section for a final-year student.

### Recommended UI Component
**Compact card inside About** (already implemented). No standalone section.

### Library
shadcn/ui Card (or existing SketchyCard).

### Why This Component
Education is a supporting credential, not a headline. Merging it into About keeps the page tight (Rule 2: don't overuse sections).

### Interaction
- Hover: subtle border glow
- No click action needed

### Animation
- Fade-up on scroll-into-view (300ms)

### Visual Hierarchy
Secondary — below summary, counters, and "What I Do".

### Mobile Behavior
Full-width card, unchanged.

### Performance Risk
**LOW**

### Recommendation
UI Quality: 7/10 · UX Value: 6/10 · Performance: 10/10 · Portfolio Value: 6/10

---

## 8. Achievements & Certifications

### Purpose
Differentiate from other students. Awards and certs are social proof.

### Recommended UI Component
**Award grid** (existing) upgraded with hover glow + award icon animation. Group into two visual tiers: **Awards** (Best Capstone, Google Cloud selection) vs **Certifications** (Salesforce, Altair, Samatrix).

### Library
Custom CSS + Framer Motion.

### Why This Component
Two-tier grouping tells a story: "I win things" + "I complete things." Hover glow keeps it tactile.

### Interaction
- **Hover:** card border → orange/30, glow-sm shadow, award icon rotates 5°
- **Scroll:** staggered fade-up (0.08s)

### Animation
- Fade-up stagger, 500ms, `power2.out`

### Visual Hierarchy
1. Award titles (bold)
2. Issuing org (muted)

### Mobile Behavior
Single column; unchanged behavior.

### Performance Risk
**LOW**

### Recommendation
UI Quality: 8/10 · UX Value: 8/10 · Performance: 10/10 · Portfolio Value: 8/10

---

## 9. GitHub Activity

### Purpose
Live proof of active development. Recruiters check GitHub anyway — show it off.

### Recommended UI Component
**Pinned repos strip** — fetch top 3–4 repos via GitHub API (`/users/5at4am/repos?sort=updated`), render as compact cards with stars/forks/language. Server-side fetch with ISR (revalidate 6h).

### Library
GitHub REST API + Custom CSS.

### Why This Component
Live data beats static claims. ISR keeps it fresh without client-side loading states. Compact — doesn't compete with Featured Projects.

### Interaction
- **Hover:** card lifts 2px, language dot pulses
- **Click:** opens repo in new tab

### Animation
- Fade-up stagger on load (300ms)

### Visual Hierarchy
1. Repo name + description
2. Language + stars/forks

### Mobile Behavior
Horizontal scroll strip (snap points).

### Performance Risk
**LOW** — server-side fetch, cached 6h. Fallback: skeleton cards if API fails.

### Recommendation
UI Quality: 7/10 · UX Value: 7/10 · Performance: 7/10 · Portfolio Value: 7/10

---

## 10. Resume

### Purpose
One-click access to the PDF. Recruiters expect it in the nav AND the hero.

### Recommended UI Component
- **Navbar:** "Resume" button (replaces "Hire Me")
- **Hero:** "Download Resume" ghost CTA
- **Contact:** inline PDF embed (iframe) + download button

### Library
shadcn/ui Button + Custom.

### Why This Component
Resume access is a conversion goal — it belongs in the two highest-visibility locations. The PDF is already in the workspace (`Satyam's_Resume.pdf`).

### Interaction
- **Click:** downloads `/resume.pdf` (place file in `public/`)
- **Hover:** button glow

### Animation
- Standard button micro-interactions (200ms)

### Visual Hierarchy
Primary conversion element in nav + hero.

### Mobile Behavior
Native PDF viewer opens; button full-width in contact.

### Performance Risk
**LOW**

### Recommendation
UI Quality: 8/10 · UX Value: 9/10 · Performance: 9/10 · Portfolio Value: 9/10

---

## 11. Contact

### Purpose
Low-friction path to reach the developer. Must feel personal, not corporate.

### Recommended UI Component
- **Contact cards** (existing: email, phone, location) — keep
- **Contact form** (name, email, message) → `mailto:` fallback or Formspree/Resend endpoint
- **Magnetic social buttons** (GitHub, LinkedIn)

### Library
Custom + Framer Motion; React Bits Magnetic Button (reuse from hero).

### Why This Component
A form signals professionalism. Magnetic buttons tie the section to the hero's interaction language (consistency).

### Interaction
- **Focus (inputs):** border → orange, subtle glow
- **Submit:** success state (orange check) or error state (red) — drawably-style state machine
- **Hover (social):** magnetic pull + glow

### Animation
- Form fields: staggered fade-up (0.08s)
- Submit: button state transition (loading → success, 400ms)

### Visual Hierarchy
1. Form (primary action)
2. Direct contact cards (alternative)
3. Social links (secondary)

### Mobile Behavior
Form stacks; inputs ≥ 44px touch targets; keyboard-friendly.

### Performance Risk
**LOW**

### Recommendation
UI Quality: 9/10 · UX Value: 9/10 · Performance: 9/10 · Portfolio Value: 9/10

---

## 12. Footer

### Purpose
Quiet close + navigation fallback + personality.

### Recommended UI Component
Minimal bar (existing) + **back-to-top button** + **local-time widget** ("Bhopal · 14:32 IST" — updates live).

### Library
Custom CSS + Framer Motion.

### Why This Component
Local time is a subtle human touch that shows the developer is real and global. Back-to-top is a UX nicety.

### Interaction
- **Hover (back-to-top):** arrow slides up, orange glow
- **Click:** Lenis scrolls to top

### Animation
- Back-to-top: appears after 400px scroll (fade + slide, 300ms)

### Visual Hierarchy
Minimal — copyright, links, time.

### Mobile Behavior
Stacks; time widget hidden on very small screens (optional).

### Performance Risk
**LOW**

### Recommendation
UI Quality: 7/10 · UX Value: 7/10 · Performance: 10/10 · Portfolio Value: 7/10

---

## Optional: Command Palette (⌘K)

### Purpose
Raycast-style instant navigation — a strong "developer" signal and genuinely useful for power users.

### Recommended UI Component
Modal overlay with fuzzy search over: sections, projects, skills, links. Trigger: `⌘K` / `Ctrl+K` + a small button in the navbar.

### Library
Custom + Framer Motion (AnimatePresence).

### Why This Component
It's the single most recognizable "developer tool" pattern. Low cost, high memorability.

### Interaction
- **Type:** fuzzy-filter results (300ms debounce)
- **Enter:** navigates; **Esc:** closes
- **Click outside:** closes with fade

### Animation
- Open: scale 0.96→1 + fade (200ms, `power2.out`)
- Close: reverse (150ms)

### Visual Hierarchy
Search input → grouped results (Sections / Projects / Links).

### Mobile Behavior
Hidden (no keyboard); skip on touch devices.

### Performance Risk
**LOW** — mounts on demand.

### Recommendation
UI Quality: 9/10 · UX Value: 8/10 · Performance: 8/10 · Portfolio Value: 8/10

---

# 4. ANIMATION SYSTEM

## Philosophy
**"Motion as punctuation, not prose."** Every animation answers one question: *what should the user notice next?* If an animation doesn't direct attention, confirm an action, or reveal content, it's removed.

## Page transitions
- App Router `template.tsx` wraps pages in Framer Motion
- Transition: fade (opacity 0→1) + 8px upward slide, 400ms, `easeOutQuint`
- Exit: fade + 8px down, 250ms
- **Why:** fast, non-nauseating, works with SSG pages

## Scroll animations
| Pattern | Where | Trigger | Duration | Easing |
|---|---|---|---|---|
| Fade-up + 24px | Section headings, cards | `whileInView`, once, margin -80px | 600ms | `[0.22, 1, 0.36, 1]` |
| Staggered fade-up | Project cards, achievements | `whileInView`, stagger 0.08–0.12s | 500ms | `power2.out` |
| Split-text mask | Hero headline | on mount | 800ms | `power4.out` |
| Timeline fill | Experience | ScrollTrigger scrub | scroll-linked | none (linear) |
| Parallax | Hero content | ScrollTrigger scrub 0.3 | scroll-linked | none |

## Hover interactions
| Element | Effect | Duration |
|---|---|---|
| Buttons (accent) | Glow + scale 0.98 press | 200ms |
| Buttons (ghost) | Border → orange, text → orange | 200ms |
| Project cards | Spotlight + tilt 4° + thumbnail scale | 300ms |
| Chips | Border/bg/text → orange | 150ms |
| Nav links | Text → orange | 150ms |
| Social icons | Border → orange, icon → orange | 200ms |

## Cursor interactions (desktop only, P2)
- 8px orange dot (instant) + 32px ring (spring-follow, 150ms lag)
- Ring scales 1.5× over interactive elements (`a`, `button`, `[data-cursor]`)
- `mix-blend-mode: difference` for visibility on Aurora
- **Disabled** on touch devices and `prefers-reduced-motion`

## Text animations
- Hero headline: SplitText mask reveal (once)
- Terminal intro: type once, hold, fade (once)
- Skill category labels: scramble on hover (400ms)
- **No** continuous text distortion, no marquee text in hero

## Project interactions
- Filter tabs: layout-animated reflow
- Card hover: spotlight + tilt
- Case study page: content fade-up stagger

---

# 5. COMPONENT CONSISTENCY SYSTEM

## Colors (single source of truth — already in `tailwind.config.ts`)
| Token | Value | Usage |
|---|---|---|
| `canvas` | `#0D0101` | Background |
| `accent` | `#FF5D00` | Primary accent, CTAs, highlights |
| `accent-deep` | `#FF3B20` | Gradients, hover states |
| `accent-warm` | `#FF6A00` | Gradient transitions |
| `paper` | `#FFFAFA` | Text, cards |
| `ink-muted` | `#A8A0A0` | Secondary text |
| `line-subtle` | `#2A2A2A` | Borders, dividers |

**Rule:** orange appears only as accent. Never more than ~10% of any viewport.

## Typography
| Element | Font | Weight | Size |
|---|---|---|---|
| Display | Onest | 800–900 | `display-xl` → `display-sm` (clamp-based) |
| Headings | Onest | 700–800 | `text-2xl`–`text-4xl` |
| Body | Onest | 400 | `text-base`–`text-lg` |
| Labels | Onest | 500 | `text-xs`, tracking `0.2em`, uppercase, orange |

## Border radius
| Scale | Value | Used for |
|---|---|---|
| `rounded-full` | 9999px | Buttons, chips, pills, mascot |
| `rounded-2xl` | 1.25rem | Cards, inputs |
| `rounded-3xl` | 1.75rem | Large cards, hero containers |

## Shadows & glow
| Token | Value |
|---|---|
| `shadow-card` | `0 0 0 1px rgba(255,250,250,0.08)` |
| `shadow-glow-sm` | `0 0 40px -12px rgba(255,93,0,0.4)` |
| `shadow-glow` | `0 0 80px -20px rgba(255,93,0,0.5)` |

## Spacing
- Section padding: `py-24 md:py-32 lg:py-40`
- Card padding: `p-6 md:p-8`
- Grid gaps: `gap-6`–`gap-8`
- Container: `max-w-7xl px-6 md:px-10 lg:px-16`

## Animation timing & easing
| Type | Duration | Easing |
|---|---|---|
| Micro (hover/focus) | 150–200ms | `ease-out` |
| Standard (entrances) | 400–600ms | `[0.22, 1, 0.36, 1]` (easeOutQuint) |
| Hero (split text) | 800ms | `power4.out` |
| Page transition | 400ms | `easeOutQuint` |
| Reduced motion | all → 0.01ms | n/a |

---

# 6. MOBILE EXPERIENCE

| Element | Desktop | Mobile |
|---|---|---|
| Navbar | Pill nav + resume | Hamburger → overlay menu |
| Aurora | Full opacity | 40% opacity (battery/GPU) |
| Magnetic buttons | Magnetic pull | Disabled (no hover) |
| Spotlight/tilt cards | Spotlight + tilt | Disabled; static cards |
| Timeline | Center/right line | Left-edge line |
| Stats | 4-across | 2×2 grid |
| Filters | Inline tabs | Horizontal scroll snap |
| GitHub strip | Grid | Horizontal scroll snap |
| Command palette | ⌘K | Hidden |
| Custom cursor | Dot + ring | Hidden |
| Touch targets | — | ≥ 44px |
| Font sizes | `clamp()` handles scaling | Same |

**Rule:** every interaction must have a non-hover fallback. If it needs hover, it doesn't exist on mobile.

---

# 7. PERFORMANCE STRATEGY

## Budgets
- **First Load JS:** < 200 kB (currently 173 kB — healthy)
- **LCP:** < 2.5s
- **CLS:** 0 (all animations are transform/opacity)

## Tactics
1. **Aurora is the only WebGL** — pause it when off-screen (IntersectionObserver), reduce opacity on mobile, `prefers-reduced-motion` → static frame
2. **GSAP only where needed** — hero split-text + timeline scrub. Code-split via dynamic import so it doesn't load on project pages
3. **Framer Motion for entrances** — already tree-shaken; use `whileInView` with `once: true`
4. **CSS animations first** — marquee, boil strokes, pulse glow are pure CSS
5. **`next/image` everywhere** — AI-generated thumbnails get `sizes` + `priority` on LCP image
6. **ISR for GitHub data** — server-side fetch, revalidate 6h, skeleton fallback
7. **No layout thrash** — all motion via `transform`/`opacity`/`background`
8. **Lazy-load below fold** — project thumbnails `loading="lazy"`, hero image `priority`
9. **Fonts** — Onest with `display: swap`, only 400–900 weights needed
10. **Reduced motion** — global CSS kill-switch already in `globals.css`

---

# 8. FINAL RECOMMENDED STACK

| Layer | Choice | Verdict |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | ✅ Already in place |
| Styling | Tailwind CSS + CSS variables | ✅ Already in place |
| Base components | shadcn/ui (Button, Card, Input, Dialog) | ✅ Already configured |
| Entrances/transitions | Framer Motion | ✅ Already in place |
| Smooth scroll | Lenis | ✅ Already in place |
| WebGL atmosphere | React Bits Aurora (ogl) | ✅ Already in place |
| **Scroll-driven** | **GSAP + ScrollTrigger** | ➕ **Add** — hero split-text, timeline fill |
| **Premium interactions** | **React Bits: Magnetic Button, Spotlight Card, Tilted Card, CountUp, Text Scramble** | ➕ **Add** — install individually via shadcn CLI |
| **Live data** | GitHub REST API (server-side, ISR) | ➕ **Add** |
| **Resume** | PDF in `public/` + download buttons | ➕ **Add** |
| Anime.js | **Rejected** — redundant with Framer Motion + GSAP for this scope; adds a third animation runtime for zero unique value | ❌ |

**Dependency discipline:** the current bundle is 173 kB first-load. Adding GSAP (+~30 kB, code-split) and 5 React Bits components (+~15 kB total) keeps us under 220 kB. Anime.js would push past 240 kB for nothing — that's the rejection rationale.

---

# 9. FINAL COMPONENT BLUEPRINT

> Hand this to any frontend developer or coding agent.

## Build order (dependency-first)

### Phase 1 — Foundation (already done, verify)
- [x] Next.js 15 + TS + Tailwind + design tokens
- [x] Lenis smooth scroll
- [x] Aurora hero background
- [x] Mascot SVG
- [x] All sections with Framer Motion entrances
- [x] SSG project pages + HF image API

### Phase 2 — Install (P0)
```bash
# In E:\manager\portfolio
npx shadcn@latest add @react-bits/Magnetic-TS-TW
npx shadcn@latest add @react-bits/SpotlightCard-TS-TW
npx shadcn@latest add @react-bits/TiltedCard-TS-TW
npx shadcn@latest add @react-bits/CountUp-TS-TW
npx shadcn@latest add @react-bits/TextScramble-TS-TW
npm install gsap
```

### Phase 3 — Hero upgrade (P0)
1. Wrap headline in GSAP SplitText mask reveal (or React Bits Split Text)
2. Add terminal intro line (`$ whoami → ...`) with type-once animation
3. Wrap CTAs in Magnetic Button
4. Add mascot hover-tilt
5. Pause Aurora off-screen (IntersectionObserver)

### Phase 4 — Projects upgrade (P0)
1. Convert project cards to Spotlight Card + Tilted Card
2. Add filter tabs (All / RAG / Agents / Full-Stack) with layout animation
3. Wire AI-generated thumbnails (`npm run generate-images` → `public/images/`)
4. Add skeleton loading state for thumbnails

### Phase 5 — About + Skills (P1)
1. Add CountUp to the 4 stats
2. Add "What I Do" strip (3 items: LLM Systems · RAG Pipelines · Agentic Workflows)
3. Add Text Scramble to skill category labels

### Phase 6 — Experience + Achievements (P1)
1. Add GSAP ScrollTrigger timeline fill line
2. Add metric chips (60%, Best Capstone, etc.)
3. Split achievements into Awards vs Certifications tiers

### Phase 7 — GitHub + Resume (P1)
1. Add GitHub pinned-repos strip (server component, ISR 6h, skeleton fallback)
2. Copy `Satyam's_Resume.pdf` → `public/resume.pdf`
3. Add "Resume" button to navbar (replaces "Hire Me") + hero ghost CTA

### Phase 8 — Contact + Footer (P1)
1. Add contact form (name/email/message → Formspree or Resend)
2. Add magnetic social buttons
3. Add back-to-top + local-time widget to footer

### Phase 9 — Polish (P2, optional)
1. Command palette (⌘K)
2. Custom cursor (desktop only)
3. Scroll progress bar in navbar

## Acceptance criteria
- [ ] First Load JS < 220 kB
- [ ] Lighthouse Performance ≥ 90 on mobile
- [ ] All animations respect `prefers-reduced-motion`
- [ ] No hover-only interactions on mobile
- [ ] Recruiter can reach resume in ≤ 2 clicks from hero
- [ ] Every section answers: *what should the user notice next?*

---

## Quality check (final pass)

1. **Does every component have a purpose?** ✅ — each maps to a recruiter need or proof goal
2. **Is the website still easy to navigate?** ✅ — nav, ⌘K, back-to-top, clear section order
3. **Is the design cohesive?** ✅ — one token system, one accent, one easing language
4. **Impressive without gimmicky?** ✅ — Aurora + spotlight + split-text are the only "wow" moments
5. **Will recruiters understand it quickly?** ✅ — hero pitch, resume in nav, metric chips
6. **Does it demonstrate frontend skill?** ✅ — WebGL, GSAP, React Bits, motion discipline
7. **Will it perform well on mobile?** ✅ — hover effects disabled, Aurora reduced, CSS-first
8. **Are animations helping UX?** ✅ — reveal, orient, confirm. Nothing decorative-only
9. **Any unnecessary components?** ❌ removed — testimonials, services, proficiency bars, Anime.js
10. **Can anything be simplified?** ✅ — Education merged into About; achievements grouped in two tiers

**Verdict: Ship it.**