import Navbar from "@/components/navbar";
import SmoothScroll from "@/components/SmoothScroll";
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
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                Available for AI Engineering roles
              </p>
              <h1 className="mt-6 text-6xl font-black leading-none tracking-tight md:text-8xl">
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
                <br />
                <span className="text-accent">{profile.title}</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-muted">
                {profile.tagline}. Building with LLMs, RAG, and agentic workflows.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
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
            {/* Hero visual slot — replace the placeholder below with your image.
                Keep data-expand on the wrapper so the scroll animation still works. */}
            <div data-expand className="mx-auto w-full max-w-md">
              <div className="flex aspect-[4/5] items-center justify-center border border-white/10 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_12px)]">
                <p className="px-6 text-center text-sm text-ink-muted">
                  Hero visual — your image goes here
                </p>
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

      {/* Projects */}
      <section id="projects" className="border-t border-white/5 px-6 py-24 md:px-12">
        <WordReveal
          containerClassName="text-4xl font-extrabold tracking-tight md:text-5xl text-paper"
          baseOpacity={0}
          enableBlur
          baseRotation={5}
          blurStrength={10}
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
              {/* Project image slot — set project.image in src/lib/data.ts
                  (e.g. "/images/rag-data-explorer.png") to show it here. */}
              {project.image && (
                <img
                  src={project.image}
                  alt={project.title}
                  className="mb-5 aspect-video w-full border border-white/10 object-cover"
                />
              )}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold text-paper">{project.title}</h3>
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
              {project.links.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block text-sm font-medium text-accent hover:underline"
                >
                  View on GitHub →
                </a>
              )}
            </WordReveal>
          ))}
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
        >
          © {new Date().getFullYear()} {profile.name}. Built with Next.js.
        </WordReveal>
      </section>
        </main>
      </SmoothScroll>
    </>
  );
}