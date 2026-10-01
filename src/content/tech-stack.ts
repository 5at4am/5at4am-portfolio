/**
 * Technology showcase data for the Skills section.
 *
 * Pure data, no React. The StaggeredGrid is a presentation component, so the
 * mapping from this dataset to its item props lives in
 * `src/components/sections/skills-section.tsx`.
 *
 * No proficiency, rating, or experience numbers are stored here on purpose.
 *
 * ── WHY THIS ORDER ────────────────────────────────────────────────────────
 * The groups are ordered by relevance to the role being targeted, not by
 * chronology or by alphabet. AI and machine learning comes first, then the model
 * providers, then the development stack, then the supporting layers.
 *
 * The reasoning is that a reader skimming a skills list is scanning for fit.
 * Leading with a JavaScript list reads as a web developer; leading with
 * LangChain, LangGraph, and RAG reads as an AI engineer, and the development
 * stack that follows becomes evidence of shipping ability rather than the
 * headline. Everything below the AI groups is real and used, but it is
 * supporting evidence.
 *
 * Within the AI group the order is deliberate too: orchestration and retrieval
 * first, because those are the tools the production work actually runs on, then
 * libraries, then disciplines. "Deep Learning" as a tile is a claim about
 * study; "LangGraph" is a claim about shipping.
 */

/**
 * Key into `TECH_ICONS` (`src/components/ui/tech-icons.tsx`). Brands use their
 * official Simple Icons mark; abstract disciplines fall back to a lucide glyph.
 */
export type TechIconKey =
  | "python"
  | "java"
  | "javascript"
  | "typescript"
  | "sql"
  | "machine-learning"
  | "deep-learning"
  | "nlp"
  | "generative-ai"
  | "langchain"
  | "langgraph"
  | "rag"
  | "huggingface"
  | "scikit-learn"
  | "react"
  | "nextjs"
  | "motion"
  | "html"
  | "css"
  | "tailwind"
  | "shadcn"
  | "fastapi"
  | "nodejs"
  | "express"
  | "rest-api"
  | "postgresql"
  | "pgvector"
  | "supabase"
  | "sqlite"
  | "mongodb"
  | "chroma"
  | "pandas"
  | "git"
  | "github"
  | "docker"
  | "vercel"
  | "groq"
  | "openrouter"
  | "gemini"
  | "openai";

export type Tech = {
  /** Stable id, used as the React key and as the highlight-lookup key. */
  id: string;
  name: string;
  icon: TechIconKey;
};

export type TechGroup = {
  id: string;
  /** Full group name, revealed on a tile hover. */
  label: string;
  /** Short form for the section legend. */
  short: string;
  items: readonly Tech[];
};

export const TECH_STACK_GROUPS: readonly TechGroup[] = [
  {
    id: "ai-ml",
    label: "AI and machine learning",
    short: "AI & ML",
    items: [
      { id: "langchain", name: "LangChain", icon: "langchain" },
      { id: "langgraph", name: "LangGraph", icon: "langgraph" },
      { id: "rag", name: "RAG", icon: "rag" },
      { id: "huggingface", name: "Hugging Face", icon: "huggingface" },
      { id: "scikit-learn", name: "Scikit-learn", icon: "scikit-learn" },
      { id: "machine-learning", name: "Machine Learning", icon: "machine-learning" },
      { id: "deep-learning", name: "Deep Learning", icon: "deep-learning" },
      { id: "nlp", name: "NLP", icon: "nlp" },
      { id: "generative-ai", name: "Generative AI", icon: "generative-ai" },
    ],
  },
  {
    id: "ai-apis",
    label: "AI models and APIs",
    short: "AI APIs",
    items: [
      { id: "groq", name: "Groq", icon: "groq" },
      { id: "openai", name: "OpenAI API", icon: "openai" },
      { id: "gemini", name: "Google Gemini", icon: "gemini" },
      { id: "openrouter", name: "OpenRouter", icon: "openrouter" },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    short: "Frontend",
    items: [
      { id: "react", name: "React", icon: "react" },
      { id: "nextjs", name: "Next.js", icon: "nextjs" },
      { id: "motion", name: "Framer Motion", icon: "motion" },
      { id: "tailwind", name: "Tailwind CSS", icon: "tailwind" },
      { id: "shadcn", name: "shadcn/ui", icon: "shadcn" },
      { id: "html", name: "HTML", icon: "html" },
      { id: "css", name: "CSS", icon: "css" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    short: "Backend",
    items: [
      { id: "fastapi", name: "FastAPI", icon: "fastapi" },
      { id: "nodejs", name: "Node.js", icon: "nodejs" },
      { id: "express", name: "Express.js", icon: "express" },
      { id: "rest-api", name: "REST APIs", icon: "rest-api" },
    ],
  },
  {
    id: "data",
    label: "Data and vector stores",
    short: "Data",
    items: [
      { id: "postgresql", name: "PostgreSQL", icon: "postgresql" },
      { id: "pgvector", name: "pgvector", icon: "pgvector" },
      { id: "supabase", name: "Supabase", icon: "supabase" },
      { id: "chroma", name: "ChromaDB", icon: "chroma" },
      { id: "mongodb", name: "MongoDB", icon: "mongodb" },
      { id: "sqlite", name: "SQLite", icon: "sqlite" },
      { id: "pandas", name: "Pandas", icon: "pandas" },
    ],
  },
  {
    id: "languages",
    label: "Programming languages",
    short: "Languages",
    items: [
      { id: "python", name: "Python", icon: "python" },
      { id: "typescript", name: "TypeScript", icon: "typescript" },
      { id: "javascript", name: "JavaScript", icon: "javascript" },
      { id: "java", name: "Java", icon: "java" },
      { id: "sql", name: "SQL", icon: "sql" },
    ],
  },
  {
    id: "tooling",
    label: "Tooling and deployment",
    short: "Tooling",
    items: [
      { id: "docker", name: "Docker", icon: "docker" },
      { id: "git", name: "Git", icon: "git" },
      { id: "github", name: "GitHub", icon: "github" },
      { id: "vercel", name: "Vercel", icon: "vercel" },
    ],
  },
];

/**
 * Ids promoted into the grid's expanding bento band instead of a regular tile.
 * These are the tools the production AI work actually runs on, so they get the
 * wide hover-expand treatment rather than a plain grid cell. Kept to three so
 * the band keeps its proportions; Hugging Face and Scikit-learn stay as tiles.
 */
export const TECH_STACK_HIGHLIGHT_IDS: readonly string[] = [
  "langchain",
  "langgraph",
  "rag",
];
