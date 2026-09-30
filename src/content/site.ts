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

/**
 * One greeting per language, revealed by the full-screen preloader on a cold
 * load, in order.
 *
 * Deliberately not the name, the alias, or the role: the hero says all of that
 * within a second of the overlay clearing, and a preloader that repeats it reads
 * as filler. A greeting is the one thing the page has no reason to say twice, and
 * it is what makes the language jump legible as a language jump.
 *
 * Two constraints produced this exact list:
 *
 * - **Lengths alternate** (5, 7, 4, 5, 2, 6, 5, plus conjuncts). The preloader
 *   sets one fluid type size for the whole run, so the size changes are what
 *   keep a single clamp from looking oversized on "Hola" and undersized on
 *   "Bonjour".
 * - **No cursive script.** The reveal masks each character separately, which
 *   would shatter Arabic joining and leave a row of isolated letterforms. Latin,
 *   Cyrillic, Han, and Devanagari all survive per-character masking; Arabic does
 *   not. Add "مرحبا" here and it will render broken.
 */
export const PRELOADER_WORDS = [
  "Hello", // English
  "Bonjour", // French
  "Hola", // Spanish
  "Hallo", // German
  "你好", // Chinese (Mandarin)
  "Привет", // Russian
  "こんにちは", // Japanese
  "नमस्ते", // Hindi
] as const;

export const HERO = {
  tagline:
    "I turn complex workflows into intelligent, AI-powered products.",

  subline:
    "AI Engineer Intern building practical AI systems, from LLM-powered applications to automated workflows.",
} as const;

/** One paragraph of the home About narrative. */
export type AboutParagraph = {
  text: string;
  /**
   * Exact phrases in `text` that get the inline accent underline on the home
   * page. Omit for a plain paragraph.
   */
  highlights?: readonly string[];
};

export const ABOUT = {
  /**
   * Full-length bio. Used by the profile page (terminal variant) and kept as a
   * single paragraph there; the home page composes `lead` + `focus` instead.
   */
  bio: "I'm Satyam Raj, a final-year B.Tech student in Computer Science & Engineering (AI & ML) and an AI Engineer Intern at Estrel.ai. My work centers on one practical problem: making complex information readable and repetitive work automatic. That has meant documentation automation tools, RAG pipelines, and applications that let people ask questions of their own data instead of digging through files. I treat AI as an engineering problem, and I build with Python, FastAPI, and LangChain, rounded out by the web stack needed to take a model from idea to interface.",

  /** Lead sentence for the home layout, slightly tighter than `bio`. */
  lead: "I'm Satyam Raj, a final-year B.Tech student in Computer Science & Engineering (AI & ML) and an AI Engineer Intern at Estrel.ai, where I get to ship AI software rather than just study it.",

  /** Paragraphs that follow the lead on the home page. */
  focus: [
    {
      text: "Most of my work centers on one practical problem: making complex information readable and repetitive work automatic. That has meant documentation automation tools, retrieval-augmented generation (RAG) pipelines, and applications that let people ask questions of their own data instead of digging through files.",
      highlights: [
        "documentation automation",
        "retrieval-augmented generation (RAG)",
        "their own data",
      ],
    },
    {
      text: "Working across a final-year degree and a real internship has taught me to treat AI as an engineering problem, not a demo: systems count only when they work outside a notebook.",
      highlights: ["engineering problem", "outside a notebook"],
    },
    {
      text: "I build with Python, FastAPI, and LangChain, rounded out by the web stack needed to take a model from idea to interface.",
      highlights: ["Python", "FastAPI", "LangChain"],
    },
  ],

  /** Primary working stack shown as mono chips in the About fact sheet. */
  stack: [
    "Python",
    "FastAPI",
    "LangChain",
    "RAG",
    "LLM Apps",
    "Automation",
    "TypeScript",
    "Next.js",
  ],
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