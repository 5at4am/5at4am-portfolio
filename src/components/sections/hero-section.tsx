import { HeroGradientWaves } from "@/components/ui/gradient-waves/hero-gradient-waves";
import { MorphText } from "@/components/ui/morph-text";
import { HERO, SITE } from "@/content/site";

/**
 * Above-the-fold introduction: role line, the morphing name, and a one-line
 * summary, floating over an achromatic gradient wave field.
 *
 * The visible headline animates, so it is hidden from assistive tech and a
 * real `<h1>` carries the name for crawlers and screen readers. The wordmark
 * reuses the site's Geist variable so the morph does not introduce a third
 * typeface. The wave field renders to its own WebGL canvas behind the copy
 * (pointer parallax included) and is decorative, so it is hidden from
 * assistive tech.
 */
export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0">
        <HeroGradientWaves />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
        {/* `id` is not decoration: the contact ball is a fixed overlay that
            parks itself directly above this line on load, and this is how it
            finds it. An id rather than a text match, because the string is
            content and will be edited. */}
        <p
          id="hero-role"
          className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
        >
          {SITE.role}
        </p>

        <h1 className="sr-only">{SITE.name}</h1>
        <div aria-hidden="true" className="w-full py-14 sm:py-20">
          <MorphText
            words={[...SITE.heroWords]}
            interval={2400}
            fontSize="clamp(2.75rem, 11vw, 7.5rem)"
            fontFamily="var(--font-geist-sans)"
            className="text-foreground"
          />
        </div>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {HERO.tagline}
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {HERO.subline}
        </p>
      </div>
    </section>
  );
}
