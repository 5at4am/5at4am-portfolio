"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { SiteHeader } from "@/components/navigation/site-header";
import { CONTACT_LINKS } from "@/content/contact";
import { NAV_SECTIONS } from "@/content/navigation";

/**
 * Stagger for the blocks. Short, and in the same band as the rest of the site.
 */
const rise = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0 },
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Not found.
 *
 * Built on the research consensus for 404s rather than as an apology: offer a
 * way out immediately, give one clear action, and mirror the navigation so
 * someone who arrived by a stale link is not stranded. That means the real
 * header, the real section links, and the same CTA the footer uses.
 *
 * `<main id="main">` because the root layout's skip link targets it, and this
 * page deliberately does not use `PageShell`: the curtain that uncovers the
 * footer needs a runway of scroll, and a 404 has nothing to scroll. It is a
 * standalone frame instead, with no footer, because a footer full of links on a
 * page that does not exist is noise.
 *
 * The oversized 404 reuses the footer's outlined display treatment, which is
 * the one piece of the site's visual language loud enough to register as an
 * error state without turning the page into a joke.
 */
export default function NotFound() {
  // Null before the query settles, so it counts as reduced here too: rendering
  // the plain markup means the content is never hidden waiting on an animation
  // that may not be allowed to run. See skills-index.tsx for the same trap.
  const reduced = useReducedMotion() !== false;

  const blocks = [
    <p
      key="eyebrow"
      className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
    >
      <span aria-hidden="true">{"// "}</span>404
    </p>,
    <h1
      key="heading"
      className="mt-6 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl"
    >
      No page at this address.
    </h1>,
    <p
      key="body"
      className="mt-4 max-w-xl leading-relaxed text-muted-foreground"
    >
      The link is either old or mistyped. Everything this site has to say is one
      click away below.
    </p>,
  ];

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main
        id="main"
        className="relative flex flex-1 flex-col justify-center overflow-hidden px-4 py-20 sm:px-6"
      >
        <div className="mx-auto w-full max-w-5xl">
          {blocks.map((block, index) =>
            reduced ? (
              <div key={index}>{block}</div>
            ) : (
              <motion.div
                key={index}
                variants={rise}
                initial="hidden"
                animate="shown"
                transition={{ duration: 0.5, ease: EASE, delay: index * 0.06 }}
              >
                {block}
              </motion.div>
            ),
          )}

          {/* One clear action, then the quieter channel. Matches the footer's
              pairing so the two do not read as different sites. */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              Back home
            </Link>
            <a
              href={CONTACT_LINKS[0].href}
              className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {CONTACT_LINKS[0].label}
            </a>
          </div>

          {/* The doormat. A 404 is the page most likely to be reached from
              outside, so the navigation is mirrored here rather than left to
              the header alone. */}
          <nav aria-label="Sections" className="mt-12 border-t border-border pt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Sections
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              {NAV_SECTIONS.map((section) => (
                <li key={section.id}>
                  <Link
                    href={`#${section.id}`}
                    className="inline-block py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Oversized, outlined, and behind everything. Decorative: the heading
            already states the error, so this is there for the eye, not for
            screen readers. */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[6vw] left-1/2 -translate-x-1/2 select-none font-mono text-[28vw] leading-none font-bold text-transparent [-webkit-text-stroke:1px_var(--border)]"
        >
          404
        </p>
      </main>
    </div>
  );
}