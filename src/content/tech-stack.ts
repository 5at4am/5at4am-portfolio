/**
 * Technology showcase data for the Skills section.
 *
 * Pure data, no React. The VengeanceUI staggered grid is a presentation
 * component, so the mapping from this dataset to its item props lives in
 * `src/components/sections/skills-section.tsx`.
 *
 * No proficiency, rating, or experience numbers are stored here on purpose.
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
  | "rag"
  | "huggingface"
  | "scikit-learn"
  | "react"
  | "nextjs"
  | "html"
  | "css"
  | "tailwind"
  | "shadcn"
  | "fastapi"
  | "nodejs"
  | "express"
  | "rest-api"
  | "postgresql"
  | "supabase"
  | "sqlite"
  | "mongodb"
  | "chroma"
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
    id: "languages",
    label: "Programming languages",
    short: "Languages",
    items: [
      { id: "python", name: "Python", icon: "python" },
      { id: "java", name: "Java", icon: "java" },
      { id: "javascript", name: "JavaScript", icon: "javascript" },
      { id: "typescript", name: "TypeScript", icon: "typescript" },
      { id: "sql", name: "SQL", icon: "sql" },
    ],
  },
  {
    id: "ai",
    label: "AI and machine learning",
    short: "AI & ML",
    items: [
      { id: "machine-learning", name: "Machine Learning", icon: "machine-learning" },
      { id: "deep-learning", name: "Deep Learning", icon: "deep-learning" },
      { id: "nlp", name: "NLP", icon: "nlp" },
      { id: "generative-ai", name: "Generative AI", icon: "generative-ai" },
      { id: "langchain", name: "LangChain", icon: "langchain" },
      { id: "rag", name: "RAG", icon: "rag" },
      { id: "huggingface", name: "Hugging Face", icon: "huggingface" },
      { id: "scikit-learn", name: "Scikit-learn", icon: "scikit-learn" },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    short: "Frontend",
    items: [
      { id: "react", name: "React", icon: "react" },
      { id: "nextjs", name: "Next.js", icon: "nextjs" },
      { id: "html", name: "HTML", icon: "html" },
      { id: "css", name: "CSS", icon: "css" },
      { id: "tailwind", name: "Tailwind CSS", icon: "tailwind" },
      { id: "shadcn", name: "shadcn/ui", icon: "shadcn" },
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
    label: "Databases and tools",
    short: "Data & Tools",
    items: [
      { id: "postgresql", name: "PostgreSQL", icon: "postgresql" },
      { id: "supabase", name: "Supabase", icon: "supabase" },
      { id: "sqlite", name: "SQLite", icon: "sqlite" },
      { id: "mongodb", name: "MongoDB", icon: "mongodb" },
      { id: "chroma", name: "ChromaDB", icon: "chroma" },
      { id: "git", name: "Git", icon: "git" },
      { id: "github", name: "GitHub", icon: "github" },
      { id: "docker", name: "Docker", icon: "docker" },
      { id: "vercel", name: "Vercel", icon: "vercel" },
    ],
  },
  {
    id: "ai-apis",
    label: "AI APIs",
    short: "AI APIs",
    items: [
      { id: "groq", name: "Groq", icon: "groq" },
      { id: "openrouter", name: "OpenRouter", icon: "openrouter" },
      { id: "gemini", name: "Google Gemini", icon: "gemini" },
      { id: "openai", name: "OpenAI API", icon: "openai" },
    ],
  },
];

/**
 * Ids promoted into the grid's expanding bento band instead of a regular tile.
 * These are the core of the AI engineering work, so they get the wide
 * hover-expand treatment rather than a plain grid cell.
 */
export const TECH_STACK_HIGHLIGHT_IDS: readonly string[] = [
  "langchain",
  "rag",
  "huggingface",
];
