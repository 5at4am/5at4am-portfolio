"use client";

import { motion, useReducedMotion } from "motion/react";

import { ExternalLink } from "@/components/ui/external-link";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { Award } from "@/content/types";

/**
 * Achievements as an issuer-grouped bento, with a Bencho ink bloom on press.
 *
 * ── WHY THIS IS NOT THE EXPERIENCE TIMELINE ─────────────────────────
 * Eight credentials are not a sequence. They come from six issuers, and two of
 * those issuers produced more than one credential, so the question this section
 * answers is "which programmes, and what did each yield?" rather than "what
 * happened next?". `experience-timeline-beam.tsx` owns the chronological shape;
 * this one groups by issuer and lets the groups set the tile sizes.
 *
 * That grouping is the reason the layout can be an uneven bento instead of eight
 * equal tiles. The top result is a wide, dark feature; every multi-credential
 * programme takes two columns; the single certificates take one; and a summary
 * band closes the grid with the counts the grouping produces. This is the
 * Aceternity bento idea, applied to data that actually has a hierarchy.
 *
 * ── BENCHO INK BLOOM ────────────────────────────────────────────────
 * Pressing a tile blooms a short, soft pool of ink from the press point. It is a
 * background effect only: no text moves, no tile tilts, and nothing is revealed
 * on hover, so the section stays readable while the interaction is discoverable
 * by touch. The stylesheet removes it under reduced motion.
 *
 * ── WHY NOT TILT ────────────────────────────────────────────────────
 * The ledger this section replaces rejected a pointer tilt for a good reason: a
 * reading surface that tilts while the pointer crosses it is hard to read. The
 * same is true here, and one of these titles runs to a full sentence, so the
 * interaction is a bloom the tile sits on rather than a transform of the tile.
 *
 * Every credential title, issuer, date and scope is static text at full contrast.
 * The layout uses `initial={{ y: 8 }}` and never an opacity, so a reader without
 * JavaScript sees everything, eight pixels low at worst.
 */

const ENTER_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.7,
};

type IssuerGroup = {
  key: string;
  awards: readonly Award[];
};

/**
 * Group by issuer, preserving the rank order of `AWARDS`.
 *
 * The group order is the position of each issuer's first appearance, and the
 * content is already ordered by selectivity, so nothing here sorts by its own
 * opinion. `issuer` falls back to `org` because most credentials are issued by
 * the organisation printed on them; the explicit `issuer` exists for the WiiZ
 * pair, whose `org` strings differ despite coming from one programme.
 */
function groupByIssuer(awards: readonly Award[]): IssuerGroup[] {
  const groups = new Map<string, Award[]>();

  for (const award of awards) {
    const key = award.issuer ?? award.org;
    const list = groups.get(key);
    if (list) {
      list.push(award);
    } else {
      groups.set(key, [award]);
    }
  }

  return [...groups].map(([key, list]) => ({ key, awards: list }));
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Start the bloom at the pointer.
 *
 * The animation is a CSS keyframe selected by `data-bloom`. Re-setting the same
 * value would not restart a finished animation, so the attribute is cleared and
 * a reflow is forced first. That is one synchronous layout per press, not per
 * move, which is the cheap place to pay for it.
 */
function bloom(event: React.PointerEvent<HTMLElement>, reduced: boolean) {
  if (reduced) return;
  const element = event.currentTarget;
  const box = element.getBoundingClientRect();
  element.style.setProperty("--bloom-x", `${event.clientX - box.left}px`);
  element.style.setProperty("--bloom-y", `${event.clientY - box.top}px`);
  element.dataset.bloom = "false";
  void element.offsetWidth;
  element.dataset.bloom = "true";
}

/**
 * Transform-only entrance. See the file header for why the opacity is omitted.
 * Under reduced motion the same lift resolves with no duration instead of a
 * spring, so a reduced-motion reader cannot be left at the initial offset.
 */
function entrance(index: number, reduced: boolean) {
  return {
    initial: { y: 8 },
    whileInView: { y: 0 },
    viewport: { once: true, margin: "-8% 0px" },
    transition: reduced
      ? { duration: 0 }
      : { ...ENTER_SPRING, delay: Math.min(index, 6) * 0.04 },
  };
}

function FeatureTile({
  group,
  feature,
  reduced,
}: {
  group: IssuerGroup;
  feature: Award;
  reduced: boolean;
}) {
  return (
    <motion.article
      data-award-group={group.key}
      {...entrance(0, reduced)}
      onPointerDown={(event) => bloom(event, reduced)}
      className="ink-bloom ink-bloom-on-dark relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-5 text-zinc-50 transition-colors duration-300 hover:border-white/25 sm:col-span-2 sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 140% at 16% 0%, rgba(255,255,255,0.12) 0%, transparent 55%), radial-gradient(100% 120% at 90% 100%, rgba(255,255,255,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
            Top result
          </span>
          <span
            aria-hidden="true"
            className="font-mono text-[10px] tabular-nums text-zinc-500"
          >
            01
          </span>
        </div>

        <h3 className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          {group.key}
        </h3>
        <h4 className="mt-2 max-w-[24ch] text-2xl font-medium leading-[1.15] tracking-tight text-zinc-50 sm:text-3xl">
          {feature.title}
        </h4>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
          {feature.scope === "team" ? <span>Team result</span> : null}
          {feature.date ? (
            <span className="tabular-nums">{feature.date}</span>
          ) : null}
          {feature.credentialId ? (
            <span className="tabular-nums">ID {feature.credentialId}</span>
          ) : null}
          {feature.href ? (
            <ExternalLink
              href={feature.href}
              tone="onDark"
              className="font-mono text-[10px] uppercase tracking-[0.14em]"
            >
              Verify
            </ExternalLink>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

function IssuerTile({
  group,
  index,
  reduced,
  wide,
}: {
  group: IssuerGroup;
  index: number;
  reduced: boolean;
  wide: boolean;
}) {
  const count = group.awards.length;

  return (
    <motion.article
      data-award-group={group.key}
      {...entrance(index, reduced)}
      onPointerDown={(event) => bloom(event, reduced)}
      className={cn(
        "ink-bloom relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors duration-300 hover:border-foreground/20 hover:bg-card/60",
        wide && "lg:col-span-2",
      )}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="min-w-0 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-muted-foreground">
            {group.key}
          </h3>
          <span
            aria-hidden="true"
            className="font-mono text-xs tabular-nums text-muted-foreground"
          >
            {pad(count)}
          </span>
          <span className="sr-only">
            {count === 1
              ? "issued one credential"
              : `issued ${count} credentials`}
          </span>
        </div>

        <ul className="mt-4 flex-1">
          {group.awards.map((award, awardIndex) => (
            <li
              key={`${award.title}-${awardIndex}`}
              className={cn(
                awardIndex > 0 && "mt-4 border-t border-border/60 pt-4",
              )}
            >
              <h4 className="text-sm font-medium leading-snug text-foreground">
                {award.title}
              </h4>

              {/* The org is worth keeping when it says something the issuer
                  heading does not, e.g. the actual programme behind a WiiZ
                  credential. When it is the issuer itself it would be noise. */}
              {award.org !== group.key ? (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {award.org}
                </p>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {award.scope === "team" ? <span>Team result</span> : null}
                {award.date ? (
                  <span className="tabular-nums">{award.date}</span>
                ) : null}
                {award.credentialId ? (
                  <span className="tabular-nums">ID {award.credentialId}</span>
                ) : null}
                {award.href ? (
                  <ExternalLink
                    href={award.href}
                    className="font-mono text-[10px] uppercase tracking-[0.12em]"
                  >
                    Verify
                  </ExternalLink>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

function SummaryTile({
  credentials,
  issuers,
  teamResults,
  index,
  reduced,
}: {
  credentials: number;
  issuers: number;
  teamResults: number;
  index: number;
  reduced: boolean;
}) {
  const rows = [
    { label: "Credentials", value: credentials },
    { label: "Issuers", value: issuers },
    { label: "Team results", value: teamResults },
  ];

  return (
    <motion.article
      {...entrance(index, reduced)}
      onPointerDown={(event) => bloom(event, reduced)}
      className="ink-bloom relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-muted/30 p-5 lg:col-span-3"
    >
      <div className="relative z-10 flex h-full flex-col">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          At a glance
        </h3>

        {/* One column on a phone or tablet, so the tile can sit beside the last
            certificate and still fill the row. Three columns across the wide
            band at lg, where the summary spans three of the four grid columns. */}
        <dl className="mt-4 flex flex-1 flex-col justify-between gap-3 lg:grid lg:grid-cols-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0 lg:flex-col lg:items-start lg:justify-center lg:border-b-0 lg:border-l lg:border-border/60 lg:pb-0 lg:pl-4 lg:first:border-l-0 lg:first:pl-0"
            >
              <dt className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="font-mono text-2xl tabular-nums text-foreground">
                {pad(row.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </motion.article>
  );
}

export type AchievementsBentoProps = {
  awards: readonly Award[];
  className?: string;
};

export function AchievementsBento({
  awards,
  className,
}: AchievementsBentoProps) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const reduced = hydrated && reduceMotion === true;

  const groups = groupByIssuer(awards);
  const feature = groups[0];
  const featureAward = feature?.awards[0];

  if (!feature || !featureAward) return null;

  /* Derived, never hardcoded. The number of team results is a property of the
     content, so adding a personal certificate must not leave a stale "03" on the
     page. */
  const teamResults = awards.filter((award) => award.scope === "team").length;

  return (
    <div className={cn("w-full", className)}>
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Grouped by issuer, strongest first
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureTile
          group={feature}
          feature={featureAward}
          reduced={reduced}
        />

        {groups.slice(1).map((group, index) => (
          <IssuerTile
            key={group.key}
            group={group}
            index={index + 1}
            reduced={reduced}
            /* A programme that yielded two credentials gets two columns. The
               four-column arithmetic then lands exactly on three rows:
               feature 2 + WiiZ 2, NASSCOM 1 + Samatrix 2 + Cisco 1,
               DataFlair 1 + summary 3. */
            wide={group.awards.length > 1}
          />
        ))}

        <SummaryTile
          credentials={awards.length}
          issuers={groups.length}
          teamResults={teamResults}
          index={groups.length}
          reduced={reduced}
        />
      </div>
    </div>
  );
}
