import { ArrowUp } from "lucide-react";

import { ClientClock } from "./footer-clock";
import { SOCIAL_ICONS } from "@/components/ui/social-icons";
import { AVAILABILITY, SITE } from "@/content/site";
import { NAV_SECTIONS } from "@/content/navigation";
import { CONTACT_LINKS } from "@/content/contact";

/**
 * What runs across the marquee. Not a decorative word salad — every item is
 * something the page has actually claimed to build with, so the strip is a
 * summary rather than filler. Reused between the two copies because the
 * marquee has to render the sequence twice for a seamless wrap.
 */
const MARQUEE_ITEMS = ["Python", "FastAPI", "LangChain", "RAG", "LLM Apps", "Next.js", "TypeScript", "Automation"] as const;

function Marquee() {
  return (
    <div
      className="marquee border-y border-border py-3"
      /* The tilt is on the wrapper, not on the keyframes: a rotated
         repeating gradient would have to be re-tiled at the skewed width and
         the seam comes straight back. Rotating the whole strip and clipping it
         with the parent keeps the loop honest. */
      style={{ transform: "rotate(-2.5deg)", marginInline: "-6vw", width: "112vw" }}
      aria-hidden="true"
    >
      <div className="marquee-track font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={`${item}-${i}`} className="whitespace-nowrap">
            {item}
            <span className="px-6 text-border" aria-hidden="true">
              /&nbsp;
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Site footer, revealed as the page slides up off the screen.
 *
 * ── WHY THIS IS NOT A LINE OF TEXT ─────────────────────────────
 * A single "built by" row is what a page ships when the footer is the last
 * thing anyone gets to. This one is the end of the argument rather than the
 * end of the file: the availability statement is the one action this site
 * exists to produce, so it leads; the oversized handle is the identity the
 * whole page has been spelling; and the strip underneath is a summary of
 * what was actually built with.
 *
 * It is a server component. That is a hard constraint, not a default: the
 * site is statically exported, and a footer that only mounts in an effect or
 * behind `ssr: false` is a footer that crawlers, answer engines, and plain
 * `HTTP GET` clients never see. Every link below is a real anchor in the
 * served HTML, and `ScrollTrigger` is wired in a separate client component
 * (`CurtainScroll`) that renders nothing.
 */
export function SiteFooter() {
  return (
    <footer className="flex h-full flex-col justify-between bg-background">
      {/* ── the CTA and the name ── */}
      <div className="mx-auto w-full max-w-5xl px-4 pt-[clamp(2.5rem,7vh,6rem)] sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            {/* The eyebrow style the sections already use, so the footer
                arrives as part of the same system rather than a new one. */}
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Availability
            </p>
            {/* The short statement on a phone, the long one from `sm` up.
                Not a copy compromise: the trailing "the fastest way to reach
                me is email" is redundant next to an Email button, and it is
                two extra lines on the shortest screen the footer has to fit
                on. One sentence, one assertion, sized to the space. */}
            <p className="mt-4 text-xl leading-snug font-medium text-balance sm:text-3xl">
              {AVAILABILITY.statement}
              <span className="hidden sm:inline">
                {" "}
                {AVAILABILITY.statementWithChannel.replace(AVAILABILITY.statement, "").trim()}
              </span>
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
              <a
                href={CONTACT_LINKS[0].href}
                className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                Email me
              </a>
              <a
                href="#projects"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                See the work
              </a>
            </div>
          </div>

          {/* Location and where it is right now. The clock is the cheapest
              "this page is alive" signal there is, and for a portfolio it is
              also information: it tells a reader in another timezone what
              hours they are dealing with. Rendered server-side in the site's
              own timezone and hydrated to the visitor's, so it is honest
              either way — the label says which. */}
          <div className="shrink-0 lg:text-right">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {SITE.location}
            </p>
            <p className="mt-3 font-mono text-sm text-muted-foreground">
              <ClientClock />
            </p>
          </div>
        </div>
      </div>

      {/* ── the strip ──
          `mt` and the inner block's padding are both viewport-height scaled.
          The marquee is a fixed-height strip, but the space around it was
          sized in `rem`, so on a short desktop window it ate the budget the
          word and the doormat needed. */}
      <div className="mt-[clamp(1.5rem,4vh,4rem)]">
        <Marquee />
      </div>

      {/* ── oversized handle ──
          `background-clip: text` puts the fill and the outline on the same
          glyphs; see the `curtain-word` block in globals.css for why that
          matters here and why a stacked pseudo-element copy does not work at
          this line height. `aria-hidden` because the handle is already
          announced as the wordmark in the header, and a screen reader hearing
          "5at4am" twice is noise.

          The word is sized by viewport WIDTH (`19vw`) but bounded by viewport
          HEIGHT (`22vh`) with a `min()` of the two. Width alone was the
          original sizing, and it is wrong for this block specifically: the
          footer is exactly one viewport tall, so on a short-but-wide window
          (1280x720, 1366x768) the word is the biggest object in the footer at
          the exact moment the viewport has the least room for it, and the
          doormat falls below the fold. The `22vh` cap costs nothing on a
          tall window — `19vw` is the binding term there — and hands the height
          budget back where it is actually scarce. */}
      <div className="px-4 pt-[clamp(1rem,3vh,3.5rem)] pb-[clamp(0.5rem,1.5vh,1.5rem)] sm:px-6">
        <p
          data-curtain-word
          aria-hidden="true"
          className="curtain-word text-center text-[clamp(3.5rem,min(19vw,22vh),15rem)]"
        >
          {SITE.handle}
        </p>
      </div>

      {/* ── utility row ──
          The doormat: the sections mirrored at the bottom for anyone who has
          scrolled past the nav without using it, plus the channels and the
          profile. Quiet by design — the footer should not compete with the
          header for attention.

          The two groups carry a mono label each. Footer research is consistent
          on this: link lists scannable by intent beat one undifferentiated row,
          and the labels cost two short words. `Elsewhere` covers the channels
          and the back-to-top, which are not sections of the page. */}
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 border-t border-border px-4 py-5 sm:px-6 md:flex-row md:items-start md:justify-between md:gap-10 md:py-8">
          <nav aria-label="Footer">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Sections
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              {NAV_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    /* `py-2` on a bare text link. As plain inline text these
                       measure 18px tall, which is a poor thumb target on a
                       phone; 34px is comfortable without turning the row into
                       a stack of buttons and pushing the footer into a scroll.
                       WCAG 2.5.8's 24px floor is cleared either way. */
                    className="inline-block py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* `md:items-end` on the parent and `md:text-right` here, so on a wide
              screen both groups sit on one baseline instead of the label
              stacking above the icons. */}
          <div className="shrink-0 md:text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Elsewhere
            </p>
            <ul className="mt-2 flex items-center gap-1 md:justify-end">
              {CONTACT_LINKS.map((link) => {
                const Icon = SOCIAL_ICONS[link.icon];
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground"
                    >
                      {/* The icon is decorative; the address is the name. A
                          footer that says "GitHub" without saying whose is a
                          worse link than one that says the handle. */}
                      <span className="sr-only">{link.label}</span>
                      <Icon aria-hidden="true" className="size-4" />
                    </a>
                  </li>
                );
              })}
              {/* Back to top. The page is roughly two viewports of runway plus
                  the sections, and footer research treats this as a standard
                  affordance on long pages. An anchor rather than a scripted
                  scroll on purpose: `scroll-behavior: smooth` in `globals.css`
                  is gated behind `prefers-reduced-motion: no-preference`, so
                  this stays instant for anyone who asked for that, with no
                  second code path. */}
              <li>
                <a
                  href="#top"
                  className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground"
                >
                  <ArrowUp aria-hidden="true" className="size-4" />
                  <span className="sr-only">Back to top</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 border-t border-border px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <p>
            Built by {SITE.name}. {SITE.domain}
          </p>
          <p>
            {/* Build-time year, deliberately. Rendering the visitor's clock
                year here would need a client component and would mismatch the
                server's on every visit after New Year; a footer that says last
                January is a smaller lie than a hydration warning in the
                console on every page load. */}
            <span suppressHydrationWarning>© {new Date().getFullYear()}</span> ·{" "}
            <a
              href={`mailto:${CONTACT_LINKS[0].href.replace("mailto:", "")}`}
              className="inline-block py-1.5 transition-colors hover:text-foreground"
            >
              {CONTACT_LINKS[0].label}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}