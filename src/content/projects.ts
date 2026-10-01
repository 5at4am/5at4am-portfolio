import type { PinnedRepo, Project } from "./types";

/**
 * Long-form project write-ups, used on the home resume.
 *
 * Ordered by substance rather than by stars. Star counts on this account top out
 * at three, and three of the four three-star repositories are a tutorial, a
 * notes file, and a dotfiles repository, so a star sort would promote exactly
 * the work worth promoting least. What ranks here instead is real engineering
 * substance, then evidence that it runs (a live deployment, a test suite, a
 * fork), then recency, then fit with an AI engineering role.
 *
 * Descriptions are drawn from each repository's own README.
 */
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
      { label: "Live site", href: "https://coal-sutra.vercel.app" },
    ],
  },
  {
    name: "OmniMuse",
    tagline: "One chat interface for every model, plus a drop-in OpenAI-compatible gateway",
    bullets: [
      "Self-hosted, provider-agnostic LLM playground on FastAPI, LangChain, and LangGraph. Point it at any provider, model, base URL, or key.",
      "Live token streaming and per-thread memory over a single interface.",
      "Exposes an OpenAI-compatible `/v1` endpoint, so existing tools can be pointed at it without changes.",
    ],
    stack: ["Python", "FastAPI", "LangChain", "LangGraph"],
    links: [{ label: "GitHub", href: "https://github.com/5at4am/omnimuse" }],
  },
  {
    name: "Smart Manufacturing Condition Monitor",
    tagline: "Machine learning that predicts a machine's operating condition from live sensor readings",
    bullets: [
      "Predicts operating condition from sensor data and production KPIs to surface early warning signs of failure, downtime, and quality loss.",
      "Targets the cases where fixed threshold rules fall short, which is where a rules-based alert is least useful.",
    ],
    stack: ["Python", "Machine Learning", "Sensor Analytics"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/5at4am/Smart-Manufacturing--Condition-Monitor",
      },
    ],
  },
  {
    name: "ML Lab",
    tagline: "An interactive machine learning lab where concepts can be visualised, calculated, and broken",
    bullets: [
      "Each concept is worked through on one page: understood, visualised, calculated, built, experimented on, broken, and practised.",
      "Built as a static, fast-loading teaching surface rather than a slide deck.",
    ],
    stack: ["Next.js App Router", "React 19", "TypeScript", "Tailwind CSS v4", "SSG"],
    links: [{ label: "GitHub", href: "https://github.com/5at4am/ml-lab" }],
  },
  {
    name: "AI Task Manager",
    tagline: "Agentic task management that turns a natural-language goal into tracked subtasks",
    bullets: [
      "Understands natural-language goals, decomposes them into subtasks, and processes them with an LLM.",
      "Persistent contextual memory backed by RAG, so tasks carry context across sessions.",
      "Full-stack with JWT authentication and password reset. Deployed.",
    ],
    stack: ["Next.js", "LangChain", "Supabase", "PostgreSQL", "RAG", "Vercel", "Render"],
    links: [
      { label: "GitHub", href: "https://github.com/5at4am/AI-task-manager" },
      { label: "Live site", href: "https://ai-task-manager-fawn.vercel.app" },
    ],
  },
  {
    name: "RAG Data Explorer",
    tagline: "Retrieval augmented analysis over a CSV dataset",
    bullets: [
      "Upload a CSV dataset, query it in natural language, and get context-aware insights.",
      "Forks from readers who wanted to explore the same dataset, which is the clearest signal that it solved a real problem.",
    ],
    stack: ["Python", "LangChain", "FastAPI", "Pandas"],
    links: [
      { label: "GitHub", href: "https://github.com/5at4am/rag_data_explorer" },
    ],
  },
  {
    name: "LexiSoft",
    tagline: "A minimalist sanctuary for word exploration",
    bullets: [
      "Editorial-grade dictionary experience with mesh gradients, noise overlays, and considered typography.",
      "Smart typeahead for word lookup, built for reading rather than for speed.",
    ],
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Framer Motion"],
    links: [
      { label: "GitHub", href: "https://github.com/5at4am/lexisoft" },
      { label: "Live site", href: "https://lexisoft.vercel.app" },
    ],
  },
  {
    name: "Complete Data Science",
    tagline: "An implementation-first ML and AI engineering learning system",
    bullets: [
      "A deeply connected curriculum running from fundamentals through deep learning, NLP, generative AI, and LLMs.",
      "Continues into RAG, LangChain and LangGraph, AI agents, evaluation, and deployment.",
      "Built as connected modules and projects rather than isolated notebooks.",
    ],
    stack: ["Python", "Jupyter", "Machine Learning", "Deep Learning", "NLP", "RAG"],
    links: [
      { label: "GitHub", href: "https://github.com/5at4am/complete-data-science" },
    ],
  },
];

/**
 * Condensed repo cards for the GitHub-style profile page.
 * Kept separate from `PROJECTS` so each surface can have its own copy length.
 * Six is the number GitHub itself shows as pinned, so the card grid stops there
 * and the remaining projects stay in `PROJECTS`.
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
    name: "OmniMuse",
    description:
      "Provider-agnostic LLM playground with live streaming, per-thread memory, and an OpenAI-compatible /v1 gateway.",
    language: "Python",
    languageColor: "oklch(0.8 0.14 70)",
    href: "https://github.com/5at4am/omnimuse",
  },
  {
    name: "Smart-Manufacturing--Condition-Monitor",
    description:
      "Predicts a machine's operating condition from live sensor readings and production KPIs, for the failures fixed thresholds miss.",
    language: "Python",
    languageColor: "oklch(0.8 0.14 70)",
    href: "https://github.com/5at4am/Smart-Manufacturing--Condition-Monitor",
  },
  {
    name: "ml-lab",
    description:
      "Interactive machine learning lab. Every concept can be understood, visualized, calculated, built, experimented on, broken, and practiced.",
    language: "TypeScript",
    languageColor: "oklch(0.55 0.02 250)",
    href: "https://github.com/5at4am/ml-lab",
  },
  {
    name: "AI-task-manager",
    description:
      "Agentic task manager: natural-language goals decomposed into subtasks, with LLM processing and RAG-backed memory.",
    language: "JavaScript",
    languageColor: "oklch(0.85 0.13 90)",
    href: "https://github.com/5at4am/AI-task-manager",
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
