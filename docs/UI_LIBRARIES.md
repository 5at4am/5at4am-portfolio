# UI Library Reference (tracked)

Status as of 2026-09-29. Verified by fetching each site and registry endpoint directly,
not taken from marketing copy.

## shadcn registries (wired into `components.json`)

These are config only. No components have been added. Install on demand:
`npx shadcn@latest add @vengeanceui/flip-text`

| Namespace | Endpoint | Catalog | Verified |
|---|---|---|---|
| `@magicui` | `https://magicui.design/r/{name}.json` | many | 200 |
| `@aceternity` | `https://ui.aceternity.com/registry/{name}.json` | many | 200 |
| `@vengeanceui` | `https://www.vengenceui.com/r/{name}.json` | 133 components | 200, `registry.json` index readable |
| `@skiper-ui` | `https://skiper-ui.com/r/{name}.json` | partial, some gated | 200 on `skiper31`, `skiper39`, `skiper62`; **401 on `skiper56`** (Pro) |

Note the namespace spelling: site is `vengenceui.com` but the namespace is `@vengeanceui`.
That is their spelling, kept so their own docs match.

## Not installable as registries

| Library | Reality | How to use |
|---|---|---|
| Animmaster Lib (`animmasterlib.dev`) | No registry, no npm package. Probed `/r/*.json` and `/registry/*.json`, both 404. | Copy-paste HTML demos (`/hero.html`, `/scroll.html`, `/3d.html`, `/text.html`, ...) |
| ThreeUI (`threeui.com`) | React/Three.js library, not a shadcn registry | `threeui-cli@0.3.1` installed as devDependency, 29 KB, no runtime deps |
| Taste Skill (`tasteskill.dev`) | Same repo as `Leonxlnx/taste-skill` | Already installed, as the `redesign-existing-projects` variant only |

## Declined, with reason

`@designcodeio/threeui@1.2.0` is real and MIT, but it was **not** installed:
- 53 MB unpacked
- peer dependency on `three` >=0.149 <1, not auto-resolved
- bundles two aliased copies of three.js: `three128` and `three165`

For a 17.8 KB static portfolio that would be pure weight. The 29 KB `threeui-cli` gives
access to the same source without the runtime cost. Say the word and I will install it anyway.

## Conflict with the portfolio rules

Several Vengeance components break the rules in `PORTFOLIO_CONTEXT.md` section 4. Do not add these:

| Component | Rule broken |
|---|---|
| `cursor-card` | no cursor animation or custom cursor |
| `stats-counter`, `animated-number` | no fake metrics or animated number counters |
| `testimonials-card`, `testinomial-card2` | no fake reviews or testimonials |
| `radial-glow-button`, `glow-border-card`, `aurora-hero`, `liquid-gradient` | likely purple or gradient glow, needs a hue check first |
| `smooth-scroll` | conflicts with restrained motion |

Skiper components need a separate look before use. `skiper31` as fetched:
- depends on `framer-motion` and `lenis/react` (project has `motion`, not `framer-motion`)
- uses `210vh` sections with scroll-linked transforms, which is the pinned and parallax
  motion the rules ban
- hardcodes a light theme (`bg-white`, `text-black`, `#f5f4f3`), clashing with the dark site
- references image assets like `/mac/Discord.png` that do not exist in this project
- free version requires attribution to Skiper UI

## Copy-paste libraries, no install
Pattern Craft, React Bits, Magic UI and Aceternity also have docs in `docs/`.
