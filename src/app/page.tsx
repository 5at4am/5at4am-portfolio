import Navbar from "@/components/navbar";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import Image from "next/image";
import Link from "next/link";
import { Award, BadgeCheck, Brain, Search, Bot } from "lucide-react";
import ScrollExpand from "@/components/ScrollExpand";
import WordReveal from "@/components/WordReveal";
import BorderGlow from "@/components/BorderGlow";
import LogoLoop from "@/components/LogoLoop";
import TextLoop from "@/components/TextLoop";
import Shuffle from "@/components/Shuffle";
import { profile } from "@/lib/data";

export default function Home() {
  return (
    <>
      {/* Fixed Navbar stays OUTSIDE the smoother so its fixed positioning and
          scroll-spy aren't affected by the wrapper transform. */}
      <Navbar />
      <ScrollProgress />
      <SmoothScroll>
        <main id="top" className="md:pl-[280px]">
          {/* Hero */}
      <ScrollExpand>
        <section className="relative flex min-h-[100dvh] items-center px-6 py-24 md:px-12">
          {/* Background looping text — diagonal, behind the hero content */}
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center -rotate-12 opacity-20">
            <TextLoop
              text={`${profile.name} ✦ ${profile.title}`}
              shape="wave"
              speed={90}
              direction="forward"
              separator="✦"
              curviness={90}
              fontSize={46}
              fontWeight={800}
              letterSpacing={2}
              uppercase
              color="#FFFFFF"
              ribbon
              ribbonColor="#262626"
              ribbonWidth={86}
              pauseOnHover={false}
              className="w-[140%]"
            />
          </div>
          <div className="relative z-10 grid w-full items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
            <div className="relative">
              {/* Soft ambient glow behind the name */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-4 -inset-y-10 text-7xl font-black leading-none tracking-tight text-white/[0.06] blur-3xl select-none md:text-9xl"
              >
                5at4am
              </span>

              <h1 className="relative z-10 mt-6 text-7xl font-black leading-none tracking-tight md:text-9xl bg-gradient-to-r from-white via-white/90 to-accent/60 bg-clip-text text-transparent">
                <Shuffle
                  tag="span"
                  text="5at4am"
                  fromText={profile.firstName}
                  shuffleDirection="right"
                  duration={0.35}
                  animationMode="evenodd"
                  shuffleTimes={3}
                  ease="power3.out"
                  stagger={0.03}
                  threshold={0.1}
                  triggerOnce={true}
                  triggerOnHover={true}
                  hoverReveal={true}
                  respectReducedMotion={true}
                  scrambleCharset="satyam540"
                  textAlign="left"
                />
              </h1>

              <p className="relative z-10 mt-5 text-xl font-medium tracking-[0.12em] text-paper/50">
                Satyam Raj
              </p>

              <p className="relative z-10 mt-3 text-sm font-medium uppercase tracking-[0.2em] text-accent">
                {profile.title}
              </p>

              <p className="relative z-10 mt-8 max-w-xl text-lg leading-relaxed text-ink-muted">
                {profile.tagline}. Building with LLMs, RAG, and agentic workflows.
              </p>

              <p className="relative z-10 mt-3 text-xs font-medium uppercase tracking-[0.2em] text-accent/70">
                Available for new roles
              </p>

              <div className="relative z-10 mt-8 flex flex-wrap gap-4">
                <BorderGlow href="#projects">View Projects</BorderGlow>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-accent hover:text-accent"
                >
                  Resume
                </a>
              </div>
            </div>
            {/* Hero visual — keep data-expand on the wrapper so the scroll animation still works. */}
            <div data-expand className="mx-auto w-full max-w-md">
              <div className="relative aspect-[4/5] overflow-hidden border border-white/10">
                <Image
                  src="/images/satyam_img.png"
                  alt={`${profile.name} — portrait`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 28rem"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>
      </ScrollExpand>

      <LogoLoop />

      {/* About */}
      <section id="about" className="border-t border-white/5 px-6 py-24 md:px-12">
        <WordReveal
          containerClassName="text-4xl font-extrabold tracking-tight md:text-5xl text-paper"
          baseOpacity={0}
          enableBlur
          baseRotation={5}
          blurStrength={10}
          dataSpeed={0.92}
        >
          About me
        </WordReveal>
        <WordReveal
          as="p"
          containerClassName="mt-8 max-w-2xl text-lg leading-relaxed text-paper/85"
          baseOpacity={0}
          enableBlur
          baseRotation={0}
          blurStrength={10}
        >
          {profile.summary}
        </WordReveal>
        <WordReveal
          as="div"
          containerClassName="mt-10 max-w-2xl border-l-2 border-accent/40 pl-6"
          baseOpacity={0}
          enableBlur
          baseRotation={0}
          blurStrength={10}
        >
          <p className="font-semibold text-paper">{profile.education.school}</p>
          <p className="mt-1 text-ink-muted">{profile.education.degree}</p>
          <p className="mt-2 text-sm text-ink-muted">{profile.education.location}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {profile.education.period} · CGPA {profile.education.cgpa}
          </p>
        </WordReveal>
      </section>

      {/* Experience */}
      <section id="experience" className="border-t border-white/5 px-6 py-24 md:px-12">
        <WordReveal
          containerClassName="text-4xl font-extrabold tracking-tight md:text-5xl text-paper"
          baseOpacity={0}
          enableBlur
          baseRotation={5}
          blurStrength={10}
          dataSpeed={0.92}
        >
          Experience
        </WordReveal>
        <div className="mt-10 max-w-3xl space-y-12">
          {profile.experience.map((exp) => (
            <WordReveal
              key={`${exp.company}-${exp.role}`}
              as="div"
              baseOpacity={0}
              enableBlur
              baseRotation={0}
              blurStrength={10}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-bold text-paper">{exp.role}</h3>
                <p className="text-sm text-ink-muted">
                  {exp.period} · {exp.location}
                </p>
              </div>
              <p className="mt-1 text-sm font-medium text-accent">{exp.company}</p>
              <ul className="mt-4 space-y-2">
                {exp.points.map((point, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-paper/75">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-paper/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </WordReveal>
          ))}
        </div>
      </section>

      {/* Achievements & certifications */}
      <section id="achievements" className="border-t border-white/5 px-6 py-24 md:px-12">
        <WordReveal
          containerClassName="text-4xl font-extrabold tracking-tight md:text-5xl text-paper"
          baseOpacity={0}
          enableBlur
          baseRotation={5}
          blurStrength={10}
          dataSpeed={0.92}
        >
          Achievements &amp; certifications
        </WordReveal>
        <ul className="mt-10 max-w-3xl space-y-6">
          {profile.achievements.map((a) => (
            <WordReveal
              key={a.title}
              as="li"
              baseOpacity={0}
              enableBlur
              baseRotation={0}
              blurStrength={10}
            >
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-accent">
                  {a.tier === "award" ? (
                    <Award className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <BadgeCheck className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <div>
                  <p className="font-semibold text-paper">{a.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{a.org}</p>
                </div>
              </div>
            </WordReveal>
          ))}
        </ul>
      </section>

      {/* Projects */}
      <section id="projects" className="border-t border-white/5 px-6 py-24 md:px-12">
        <WordReveal
          containerClassName="text-4xl font-extrabold tracking-tight md:text-5xl text-paper"
          baseOpacity={0}
          enableBlur
          baseRotation={5}
          blurStrength={10}
          dataSpeed={0.92}
        >
          Projects
        </WordReveal>
        <div className="mt-10 grid max-w-4xl gap-8 md:grid-cols-2">
          {profile.projects.map((project) => (
            <WordReveal
              key={project.slug}
              as="div"
              containerClassName="border border-white/10 p-6"
              baseOpacity={0}
              enableBlur
              baseRotation={0}
              blurStrength={10}
            >
              {/* Project image */}
              {project.image && (
                <img
                  src={project.image}
                  alt={`${project.title} — interface preview`}
                  width={800}
                  height={450}
                  loading="lazy"
                  className="mb-5 aspect-video w-full border border-white/10 object-cover"
                />
              )}
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/projects/${project.slug}`}
                  className="text-lg font-bold text-paper transition-colors hover:text-accent"
                >
                  {project.title}
                </Link>
                <span className="text-xs text-ink-muted">{project.year}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span key={t} className="rounded-full bg-white/5 px-3 py-1 text-xs text-paper/70">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-block font-medium text-accent hover:underline"
                >
                  View case study →
                </Link>
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-medium text-accent hover:underline"
                  >
                    View on GitHub →
                  </a>
                )}
              </div>
            </WordReveal>
          ))}
        </div>
      </section>

      {/* What I do */}
      <section id="what-i-do" className="border-t border-white/5 px-6 py-24 md:px-12">
        <WordReveal
          containerClassName="text-4xl font-extrabold tracking-tight md:text-5xl text-paper"
          baseOpacity={0}
          enableBlur
          baseRotation={5}
          blurStrength={10}
          dataSpeed={0.92}
        >
          What I do
        </WordReveal>
        <div className="mt-10 grid max-w-4xl gap-8 md:grid-cols-3">
          {profile.whatIDo.map((item) => {
            const Icon =
              item.icon === "brain" ? Brain : item.icon === "search" ? Search : Bot;
            return (
              <WordReveal
                key={item.title}
                as="div"
                baseOpacity={0}
                enableBlur
                baseRotation={0}
                blurStrength={10}
              >
                <Link
                  href={item.href}
                  className="group flex h-full flex-col rounded-lg border border-white/10 p-6 transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-accent transition-colors group-hover:border-accent/40">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-paper transition-colors group-hover:text-accent">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-block text-sm font-medium text-accent">
                    Learn more →
                  </span>
                </Link>
              </WordReveal>
            );
          })}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="border-t border-white/5 px-6 py-24 md:px-12">
        <WordReveal
          containerClassName="text-4xl font-extrabold tracking-tight md:text-5xl text-paper"
          baseOpacity={0}
          enableBlur
          baseRotation={5}
          blurStrength={10}
          dataSpeed={0.92}
        >
          Skills
        </WordReveal>
        <div className="mt-10 grid max-w-4xl gap-10 md:grid-cols-2">
          {profile.skills.map((group) => (
            <WordReveal
              key={group.category}
              as="div"
              baseOpacity={0}
              enableBlur
              baseRotation={0}
              blurStrength={10}
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent">
                {group.category}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-paper/70"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </WordReveal>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-white/5 px-6 py-24 md:px-12">
        <WordReveal
          containerClassName="text-4xl font-extrabold tracking-tight md:text-5xl text-paper"
          baseOpacity={0}
          enableBlur
          baseRotation={5}
          blurStrength={10}
          dataSpeed={0.92}
        >
          Let&apos;s talk
        </WordReveal>
        <WordReveal
          as="p"
          containerClassName="mt-6 max-w-xl text-lg text-ink-muted"
          baseOpacity={0}
          enableBlur
          baseRotation={0}
          blurStrength={10}
        >
          Open to AI engineering roles, freelance projects, and collaborations.
        </WordReveal>
        <WordReveal
          as="div"
          containerClassName="mt-10 flex flex-wrap gap-4"
          baseOpacity={0}
          enableBlur
          baseRotation={0}
          blurStrength={10}
        >
          <BorderGlow href={`mailto:${profile.email}`}>{profile.email}</BorderGlow>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-accent hover:text-accent"
          >
            GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-accent hover:text-accent"
          >
            LinkedIn
          </a>
        </WordReveal>
        <WordReveal
          as="p"
          containerClassName="mt-16 text-sm text-ink-muted"
          baseOpacity={0}
          enableBlur
          baseRotation={0}
          blurStrength={10}
          // Last element on the page: the section's py-24 padding keeps its
          // bottom 96px above the document bottom, so both start and end
          // of the default range are unreachable — use the full enter → max scroll range.
          wordAnimationStart="top bottom"
          wordAnimationEnd="bottom bottom-=96px"
          dataSpeed={0.9}
        >
          © {new Date().getFullYear()} {profile.name}. Built with Next.js.
        </WordReveal>
      </section>
        </main>
      </SmoothScroll>
    </>
  );
}