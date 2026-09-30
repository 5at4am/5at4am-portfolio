import { Skiper19 } from "@/components/ui/skiper-ui/skiper19";

/**
 * Full-bleed scroll-story interlude, placed between the projects and skills
 * sections where the two dense, text-heavy blocks need a visual break.
 *
 * **Why here.** `skiper19` is built as a full-bleed band, not as a card in the
 * `max-w-5xl` content column — it is a narrative beat between two resume
 * blocks, not a resume block itself. Projects is the last "what I built" section
 * and skills is "what I built it with", so the band sits between them and
 * carries that transition (the headline states the pipeline; the rising card
 * repeats identity, location, current role, and availability).
 *
 * **Not in the nav.** The section has no `NAV_SECTIONS` id, so the header
 * scroll-spy keeps reporting `projects` as active while it scrolls past. That is
 * deliberate: there is nothing to jump to. Adding an id would also make the
 * scroll-spy track a 350vh band.
 *
 * **Home page only.** The `/profile` route is a GitHub-style terminal view with
 * its own tighter rhythm, and a 350vh band would read as a mistake there.
 *
 * **Accessibility.** It renders one `<h2>` and no autoplaying animation — the
 * stroke reveal is driven by `useScroll`, so a reader who never scrolls simply
 * never triggers it, and a reduced-motion reader loses no information because
 * the same copy is present either way. The decorative path is `aria-hidden`.
 *
 * Behaviour, geometry, and the preserved-vs-adapted list live in
 * `src/components/ui/skiper-ui/skiper19.tsx`.
 */
export function StorySection() {
  return <Skiper19 />;
}
