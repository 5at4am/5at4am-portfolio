import type { PinnedRepo, Project } from "./types";

/** Long-form project write-ups, used on the home resume. */
export const PROJECTS: readonly Project[] = [
  {
    name: "CoalSutra",
    tagline: "Smart India Hackathon 2026 prototype for a Ministry of Coal problem statement",
    bullets: [
      "Turns mining and geological PDFs, scans, images, CSVs, and spreadsheets into structured, traceable facts.",
      "Grounded Q&A with page citations, automated report generation with fact checks, topic analysis, and a human review queue for cross-source conflicts.",
      "109 passing offline tests. Deployed on Vercel.",
    ],
    stack: [
      "FastAPI",
      "Next.js 14",
      "PostgreSQL",
      "pgvector",
      "RapidOCR",
      "pdfplumber",
      "RAG",
      "Tailwind",
      "Docker Compose",
      "Groq LLM",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/5at4am/CoalSutra" },
      { label: "Live site", href: "https://coalsutra.vercel.app" },
    ],
  },
  {
    name: "RAG Data Explorer",
    tagline: "Retrieval augmented analysis over a CSV dataset",
    bullets: [
      "Upload a CSV dataset, query it in natural language, and get context-aware insights.",
    ],
    stack: ["Python", "LangChain", "FastAPI", "Pandas"],
    links: [
      { label: "GitHub", href: "https://github.com/5at4am/rag_data_explorer" },
    ],
  },
];

/**
 * Condensed repo cards for the GitHub-style profile page.
 * Kept separate from `PROJECTS` so each surface can have its own copy length.
 */
export const PINNED_REPOS: readonly PinnedRepo[] = [
  {
    name: "CoalSutra",
    description:
      "SIH 2026 prototype for a Ministry of Coal problem statement. Turns mining and geological PDFs, scans, images, CSVs, and spreadsheets into structured, traceable facts.",
    language: "Python",
    languageColor: "oklch(0.8 0.14 70)",
    href: "https://github.com/5at4am/CoalSutra",
  },
  {
    name: "rag_data_explorer",
    description:
      "Retrieval augmented analysis over a CSV dataset. Upload a CSV, query it in natural language, and get context-aware insights.",
    language: "Python",
    languageColor: "oklch(0.8 0.14 70)",
    href: "https://github.com/5at4am/rag_data_explorer",
  },
];
