import type { Education } from "./types";

/**
 * Site-wide identity and copy.
 * Keep shared content centralized for consistent updates.
 */
export const SITE = {
  name: "Satyam Raj",
  handle: "5at4am",
  role: "AI Engineer Intern at Estrel.ai",
  heroWords: ["Hello", "Satyam", "5at4am"] as const,
  domain: "5at4am.me",
  location: "Bhopal, India",
  url: "https://5at4am.me",
} as const;

export const HERO = {
  tagline:
    "I turn complex workflows into intelligent, AI-powered products.",

  subline:
    "AI Engineer Intern building practical AI systems, from LLM-powered applications to automated workflows.",
} as const;

export const ABOUT = {
  bio: "I'm Satyam Raj, a final-year B.Tech student in Computer Science & Engineering (AI & ML) and an AI Engineer Intern. I build AI-powered applications that make complex information easier to process and repetitive work easier to automate. My experience includes developing documentation automation tools, working with retrieval-augmented generation (RAG), and building applications that combine AI capabilities with practical software engineering. I work primarily with Python, FastAPI, LangChain, and modern web technologies, with a focus on turning ideas into usable products.",
} as const;

export const EDUCATION: Education = {
  degree: "B.Tech in Computer Science & Engineering (AI & ML)",
  institution: "LNCT University, Bhopal",
  period: "2023-2027",
  score: "CGPA 8.34/10",
};

/**
 * Compact education details for cards and overview grids.
 */
export const EDUCATION_COMPACT = {
  degree: "B.Tech CSE (AI & ML)",
  institution: "LNCT University",
  period: "2023 to 2027",
  score: "8.34 / 10",
} as const;

/**
 * Full-time career availability.
 */
export const AVAILABILITY = {
  statement:
    "Open to full-time AI engineering opportunities starting in 2027.",

  statementWithChannel:
    "Open to full-time AI engineering opportunities starting in 2027. The fastest way to reach me is email.",
} as const;