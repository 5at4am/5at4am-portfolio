import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/data";
import { siteUrl, siteName, ogImage } from "@/lib/site";

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s — ${profile.name}`,
    default: `${profile.name} — ${profile.title}`,
  },
  description:
    "Satyam Raj (5at4am) — AI Engineer building LLM applications, RAG pipelines, and agentic workflows with Python, LangChain, and FastAPI. Portfolio, projects, and experience.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName,
    title: `${profile.name} — ${profile.title}`,
    description:
      "AI Engineer building LLM applications, RAG pipelines, and agentic workflows.",
    url: siteUrl,
    images: [ogImage],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.title}`,
    description:
      "AI Engineer building LLM applications, RAG pipelines, and agentic workflows.",
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  alternateName: "5at4am",
  jobTitle: profile.title,
  url: siteUrl,
  email: `mailto:${profile.email}`,
  telephone: `+${profile.phone.replace(/\D/g, "")}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bhopal",
    addressCountry: "IN",
  },
  sameAs: [profile.github, profile.linkedin],
  alumniOf: profile.education.school,
  knowsAbout: [
    "Large Language Models",
    "Retrieval-Augmented Generation",
    "AI Agents",
    "Python",
    "LangChain",
    "FastAPI",
  ],
  image: `${siteUrl}/images/satyam_img.png`,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: siteName,
  description:
    "AI Engineer building LLM applications, RAG pipelines, and agentic workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${onest.variable} dark`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}