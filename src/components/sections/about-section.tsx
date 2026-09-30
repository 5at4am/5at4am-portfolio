"use client";

import { motion } from "motion/react";

import { Section } from "@/components/ui/section";
import { TagList } from "@/components/ui/tag-list";
import { ABOUT, EDUCATION, type AboutParagraph } from "@/content/site";

export type AboutSectionProps = {
  /**
   * - `default` — resume page: two-column layout. Left is the narrative
   *   (lead sentence, highlighted-keyword paragraphs, availability pill);
   *   right is a fact sheet of dark-glass cards (stack chips + education rows).
   * - `terminal` — profile page: education continues the bio as a paragraph,
   *   since the score already appears in the profile meta row.
   */
  variant?: "default" | "terminal";
};

/** Escapes regex metacharacters so highlight phrases can appear verbatim. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * One paragraph, with the listed phrases wrapped in an ink-wash accent mark.
 * Phrases are split on verbatim, case-sensitive matches so the wash only lands
 * on the exact words in the copy.
 */
function HighlightedParagraph({ text, highlights = [] }: AboutParagraph) {
  if (highlights.length === 0) {
    return <p className="leading-relaxed text-muted-foreground">{text}</p>;
  }

  const pattern = new RegExp(`(${highlights.map(escapeRegExp).join("|")})`, "g");
  const parts = text.split(pattern);

  return (
    <p className="leading-relaxed text-muted-foreground">
      {parts.map((part, index) =>
        highlights.includes(part) ? (
          <mark
            key={index}
            className="about-highlight bg-transparent font-medium text-foreground"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </p>
  );
}

/** One label/value row of the education fact sheet. */
function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-white/10 py-2.5 first:border-t-0">
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-100/60">
        {label}
      </dt>
      <dd className="text-right text-sm text-zinc-100">{value}</dd>
    </div>
  );
}

/** Shared dark-glass surface, tuned to the header notch and the toggle chip. */
const glassCard = "rounded-xl border border-white/10 bg-zinc-950/85 p-5 shadow-lg shadow-black/10 backdrop-blur-md";

/**
 * Bio and education. Shared by the home resume and the profile page; both read
 * from `ABOUT` / `EDUCATION` in the content layer.
 */
export function AboutSection({ variant = "default" }: AboutSectionProps) {
  if (variant === "terminal") {
    return (
      <Section id="about" title="About" variant={variant}>
        <div className="max-w-2xl space-y-5">
          <p className="leading-relaxed text-muted-foreground">{ABOUT.bio}</p>
          <p className="leading-relaxed text-muted-foreground">
            <strong className="font-medium text-foreground">
              {EDUCATION.degree}
            </strong>
            , {EDUCATION.institution}, {EDUCATION.period.replace("-", " to ")}.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section id="about" title="About">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] md:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl space-y-5"
        >
          <p className="text-lg font-medium leading-relaxed text-foreground">
            {ABOUT.lead}
          </p>
          {ABOUT.focus.map((paragraph) => (
            <HighlightedParagraph key={paragraph.text} {...paragraph} />
          ))}
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="space-y-5"
          aria-label="Fast facts"
        >
          <div className={glassCard}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-100/60">
              Stack
            </h3>
            <TagList items={ABOUT.stack} label="Working stack" tone="onDark" />
          </div>

          <div className={glassCard}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-100/60">
              Education
            </h3>
            <dl className="mt-3">
              <FactRow label="Degree" value={EDUCATION.degree} />
              <FactRow label="University" value={EDUCATION.institution} />
              <FactRow
                label="Period"
                value={EDUCATION.period.replace("-", " to ")}
              />
              <FactRow
                label="CGPA"
                value={EDUCATION.score.replace("CGPA ", "").replace("/", " / ")}
              />
            </dl>
          </div>
        </motion.aside>
      </div>
    </Section>
  );
}