# Motion Project Templates

Copy this file per project and fill in the blanks. Sections: 1 Brief, 2 Motion Language,
3 Shot-by-Shot Timing Sheet, 4 Motion Style Guide, 5 Effect Log, 6 Review Checklist.

The decisions in section 2 are the ones the main guide calls the "motion language lock"
([§20](./motion-design.md#lock-the-motion-language)). Filling them in before opening the
animation software is the highest-value step in the process — it converts every later choice
from a fresh judgement into a lookup.

---

## 1. Brief

| Field | Your answer |
|---|---|
| Project name | |
| Client / brand | |
| Goal (one sentence) | |
| Audience | |
| Platform(s) | |
| Length | |
| Aspect ratios needed | |
| **Frame rate** (24 / 25 / 30 / 60) | |
| Will it be seen muted? (yes / no / both) | |
| Call to action | |
| Brand assets (logo, fonts, colours) | |
| References (links or file names) | |
| Deadline | |
| Software | |

**Frame rate is a project decision, not a platform default.** Set it here, set the sequence
to match it, and never relink footage at a different rate without re-timing — every frame
number in section 3 depends on it.

---

## 2. Motion Language (fill before animating)

**Core decisions** — these seven are what the anti-repetition rule counts. At least **3 of
these 7** must differ from the previous project.

| Decision | Choice | Differs from last project? |
|---|---|---|
| Easing family | | |
| Shape language | | |
| Transition types (max 3) | | |
| Camera behaviour | | |
| Type behaviour | | |
| Background style | | |
| Rhythm (fast / medium / slow) | | |

**Context** — record these, but they do not count toward the three.

| Decision | Choice |
|---|---|
| Tone (one word) | |
| Register rung (see [§2](./motion-design.md#register-decide-what-kind-of-motion-this-is)) | |
| Signature technique (one only) | |
| Supporting technique 1 | |
| Supporting technique 2 | |
| Palette (3 to 5 hex) | |
| Muted-view fallback (what carries the message without sound) | |

If a decision you need is not in this table, add a row — but add it deliberately, because
inventing per shot is where inconsistency comes from.

---

## 3. Shot-by-Shot Timing Sheet

**`frames = seconds x fps`**, using the frame rate from section 1.

| # | Time in | Time out | Frames | On-screen text / content | Motion in | Hold | Motion out | Easing | Sound | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 0:00 | 0:03 | 90 | HOOK: | | | | | | |
| 2 | | | | | | | | | | |
| 3 | | | | | | | | | | |
| 4 | | | | | | | | | | |
| 5 |  |  |  |  |  |  |  |  |  |  |
| 6 |  |  |  |  |  |  |  |  |  |  |
| 7 |  |  |  |  |  |  |  |  |  |  |
| 8 |  |  |  |  |  |  |  |  |  |  |
| 9 | | | | | | | | | | CTA |
| 10 | | | | | | | | | | LOGO HOLD (1.5 s+) |

### Example row (filled)

| # | Time in | Time out | Frames | Content | Motion in | Hold | Motion out | Easing | Sound |
|---|---|---|---|---|---|---|---|---|---|
| 2 | 0:03 | 0:08 | 150 | "Give your team superpowers" | Line mask slide-up, 4-frame stagger per word, 18 frames | 1.2 s | Slide-up exit, 12 frames | Expo-out in, cubic-in out | Soft riser into a pop at word 4 |

Note that the exit is shorter than the entrance (12 frames against 18). That is the rule,
not an accident of this row.

### Pacing guide

| Video type | Visual change every |
|---|---|
| Energetic social | 1.5 to 3 s |
| Product or SaaS | 2 to 4 s |
| Premium, calm | 4 to 6 s |

### Sound hit plan (pick 3 to 5)

| Time | Visual moment | Sound |
|---|---|---|
| | | |
| | | |
| | | |

---

## 4. Motion Style Guide (one page per brand)

**Brand:** ____________

### Principles (pick 3 words)

e.g. "Confident, smooth, precise"

1. ____
2. ____
3. ____

### Register

- Rung (1 functional / 2 confirming / 3 expressive / 4 ambient / 5 signature): ____
- Maximum signature moments per piece: ____
- Transitions allowed (max 3): ____

### Timing

| Type | Duration | Easing |
|---|---|---|
| Micro (icon, toggle) | ____ ms | ____ |
| Entrance | ____ ms | ____ |
| Exit | ____ ms | ____ |
| Hold between major changes | ____ ms | ____ |
| Scene transition | ____ ms | ____ |
| Hero reveal | ____ ms | ____ |
| Stagger step | ____ ms | ____ |
| Logo hold | ____ ms | ____ |

Exits should be shorter than entrances. Holds are not optional.

### Shapes and icons

- Corner radius: ____
- Stroke weight: ____
- Icon style (line / filled / duotone): ____
- Signature shape (carrier element): ____

### Type

- Display font: ____
- Text font: ____
- Entrance style: ____
- Highlight style (colour, marker, weight): ____
- Maximum words for per-letter animation: ____
- Reading time rule for a headline: ____

### Colour and backgrounds

- Primary: ____ Secondary: ____ Accent: ____ Neutral: ____
- Gradient rules (speed, grain %): ____
- Glass or shadow rules: ____
- Text-over-motion contrast verified against which frame? ____

### Do and don't

| Do | Don't |
|---|---|
| | |
| | |
| | |

### Sound

- Hit style: ____
- Ambient bed: ____
- Music mood and tempo: ____

---

## 5. Effect Log

Record every finished project. **Review it before starting the next one** — after the project
is done you already know which parts you were happy with, and that is exactly when you will
justify repeating them.

| Date | Project | Signature technique | Easing | Shape language | Transitions used | Background | Result / what to change |
|---|---|---|---|---|---|---|---|
| | | | | | | | |
| | | | | | | | |
| | | | | | | | |
| | | | | | | | |
| | | | | | | | |

**Next project must differ in at least 3 of the 7 core decisions:** ____________

---

## 6. Review Checklist

The full version is in
[§33](./motion-design.md#review-checklists). This is the short form.

### Design

- [ ] One focal point at any moment
- [ ] Palette limited to 3 to 5 colours
- [ ] Two typefaces maximum
- [ ] Safe margins respected (centre 70% for vertical key text)
- [ ] Contrast checked against moving backgrounds, at the worst frame

### Motion

- [ ] Entrances eased (ease-out), exits eased (ease-in) and shorter
- [ ] Stagger offsets small and consistent
- [ ] Holds of 0.7 to 1.2 s between major changes
- [ ] No more than 3 transition types
- [ ] Signature technique appears clearly, not on every shot
- [ ] Every loop returns exactly to its first frame

### Message

- [ ] Hook in the first 3 seconds
- [ ] Each text block readable (about `words / 3` seconds plus 0.5 s)
- [ ] CTA clear and held
- [ ] Logo held 1.5 s or more

### Sound

- [ ] 3 to 5 key hits aligned to visuals
- [ ] Voice clear above music
- [ ] Muted version still communicates

### Delivery

- [ ] Watched on a phone, full screen
- [ ] Exported for each platform and ratio
- [ ] Frame rate matches the sequence settings
- [ ] Filenames and versions labelled
- [ ] Licences checked for fonts, music, footage, libraries
