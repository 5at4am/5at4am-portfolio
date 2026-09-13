import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { profile } from "@/lib/data";
import { siteUrl, siteName, ogImage } from "@/lib/site";

export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return profile.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = profile.projects.find((p) => p.slug === slug);
  if (!project) return {};

  const url = `${siteUrl}/projects/${project.slug}`;
  const description = project.description;

  return {
    title: `${project.title} — case study`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName,
      title: `${project.title} — ${siteName}`,
      description,
      images: [ogImage],
      publishedTime: `${project.year}-01-01`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — ${siteName}`,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = profile.projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const url = `${siteUrl}/projects/${project.slug}`;
  const related = profile.projects.filter((p) => p.slug !== slug);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${siteUrl}/#projects` },
      { "@type": "ListItem", position: 3, name: project.title, item: url },
    ],
  };

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.longDescription,
    url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    keywords: project.tech.join(", "),
    author: {
      "@type": "Person",
      name: profile.name,
      url: siteUrl,
    },
  };

  return (
    <main className="bg-canvas px-6 py-16 md:px-12">
      <div className="mx-auto max-w-3xl">
        {/* Minimal header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-paper"
        >
          <span aria-hidden="true">←</span> 5at4am
        </Link>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mt-8 text-sm text-ink-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-paper">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/#projects" className="transition-colors hover:text-paper">
                Projects
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-paper">
              {project.title}
            </li>
          </ol>
        </nav>

        {/* Title block */}
        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-paper/70">
              {project.category}
            </span>
            <span className="text-xs text-ink-muted">{project.year}</span>
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-paper md:text-6xl">
            {project.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            {project.description}
          </p>
        </header>

        {/* Image */}
        {project.image && (
          <img
            src={project.image}
            alt={`${project.title} — interface preview`}
            width={800}
            height={450}
            loading="eager"
            className="mt-10 aspect-video w-full border border-white/10 object-cover"
          />
        )}

        {/* Body */}
        <section aria-label="Overview" className="mt-10">
          <h2 className="text-2xl font-bold text-paper">Overview</h2>
          <p className="mt-4 leading-relaxed text-paper/85">{project.longDescription}</p>
        </section>

        {/* Highlights */}
        <section aria-label="Highlights" className="mt-10">
          <h2 className="text-2xl font-bold text-paper">Highlights</h2>
          <ul className="mt-4 space-y-3">
            {project.highlights.map((point) => (
              <li key={point} className="flex gap-3 leading-relaxed text-paper/75">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
        </section>

        {/* Tech */}
        <section aria-label="Technologies" className="mt-10">
          <h2 className="text-2xl font-bold text-paper">Technologies</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-paper/70"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap gap-4">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-accent hover:text-accent"
            >
              View source on GitHub
            </a>
          )}
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-accent hover:text-accent"
            >
              Launch live site
            </a>
          )}
        </div>

        {/* Related projects */}
        {related.length > 0 && (
          <section aria-label="More projects" className="mt-20 border-t border-white/5 pt-10">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent">
              More projects
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="group rounded-lg border border-white/10 p-5 transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  <h3 className="font-bold text-paper transition-colors group-hover:text-accent">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-16 text-sm text-ink-muted">
          © {new Date().getFullYear()} {profile.name}.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
      />
    </main>
  );
}