import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiTailwindcss,
  SiFastapi,
  SiLangchain,
  SiMongodb,
  SiPostgresql,
  SiSupabase,
  SiDocker,
  SiGit,
  SiGithub,
  SiTensorflow,
  SiKeras,
  SiPandas,
  SiStreamlit,
} from "react-icons/si";

const LOGOS = [
  SiPython,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiTailwindcss,
  SiFastapi,
  SiLangchain,
  SiMongodb,
  SiPostgresql,
  SiSupabase,
  SiDocker,
  SiGit,
  SiGithub,
  SiTensorflow,
  SiKeras,
  SiPandas,
  SiStreamlit,
];

/**
 * LogoLoop - a horizontal marquee of tech-stack logos built with react-icons
 * (Simple Icons set). Two identical copies of the list scroll seamlessly via
 * CSS translateX(-50%). Pauses on hover. Reduced motion is handled by the
 * global override in globals.css (animation-duration → 0.01ms, which stops
 * the marquee at -50% — visually identical to 0% thanks to the duplicate).
 */
export default function LogoLoop() {
  return (
    <section
      aria-label="Technologies"
      className="relative overflow-hidden border-y border-white/5 py-8"
    >
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        <div className="flex items-center gap-12 pr-12">
          {LOGOS.map((Icon, i) => (
            <Icon key={i} className="h-8 w-8 text-paper/40 transition-colors duration-200 hover:text-paper" />
          ))}
        </div>
        <div className="flex items-center gap-12 pr-12" aria-hidden>
          {LOGOS.map((Icon, i) => (
            <Icon key={i} className="h-8 w-8 text-paper/40 transition-colors duration-200 hover:text-paper" />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-canvas to-transparent" />
    </section>
  );
}