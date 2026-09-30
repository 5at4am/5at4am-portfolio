import type { ExperienceItem } from "./types";

/**
 * Rendered by both the home resume and the GitHub-style profile page.
 * Single source of truth — edit here, both pages update.
 */
export const EXPERIENCE: readonly ExperienceItem[] = [
  {
    role: "AI Engineer Intern",
    org: "Estrel.ai",
    meta: "May 2026 to Present, Remote",
    bullets: [
      "Engineer AI workflow automation with Python, LLMs, and OCR for enterprise business processes.",
      "Built document-processing applications that automated paperwork and reduced manual effort by 60% across internal workflows.",
    ],
  },
  {
    role: "Agentic AI Intern (Capstone)",
    org: "Wiiz Platform",
    meta: "Dec 2025 to Jan 2026, Remote",
    bullets: [
      "Built a multi-agent Contract Risk Analyzer with LangChain to extract, classify, and summarize risks from legal contracts.",
      "Won Best Capstone Project and Highest Workflow Creation for the program.",
    ],
  },
  {
    role: "Generative AI Intern",
    org: "EduSkills Foundation x Google Cloud",
    meta: "Jan 2025 to Mar 2025, Remote",
    bullets: [
      "Built GenAI applications with Vertex AI, Gemini APIs, RAG, prompt engineering, vector search, and structured outputs.",
    ],
  },
];
