import {
  Box,
  BrainCircuit,
  Coffee,
  Database,
  Layers,
  Languages as LanguagesIcon,
  Network,
  Search,
  Sparkles,
  Webhook,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { IconType } from "react-icons";
import {
  SiCss,
  SiDocker,
  SiExpress,
  SiFastapi,
  SiGit,
  SiGithub,
  SiGooglegemini,
  SiHtml5,
  SiHuggingface,
  SiJavascript,
  SiLangchain,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenrouter,
  SiPostgresql,
  SiPython,
  SiReact,
  SiScikitlearn,
  SiShadcnui,
  SiSqlite,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import { TbBrandOpenai } from "react-icons/tb";

import type { TechIconKey } from "@/content/tech-stack";

/**
 * Brand marks come from Simple Icons (official logos, inlined as SVG paths, no
 * network request) with one Tabler brand icon where Simple Icons has no mark.
 * Disciplines without a brand logo get a lucide glyph; the technology name is
 * always rendered as text next to the icon, so the glyph is only ever a
 * supporting cue.
 */
const TECH_ICONS: Record<TechIconKey, IconType | LucideIcon> = {
  python: SiPython,
  // Simple Icons dropped the Oracle Java mark; the coffee cup is the shorthand.
  java: Coffee,
  javascript: SiJavascript,
  typescript: SiTypescript,
  sql: Database,
  "machine-learning": BrainCircuit,
  "deep-learning": Network,
  nlp: LanguagesIcon,
  "generative-ai": Sparkles,
  langchain: SiLangchain,
  rag: Search,
  huggingface: SiHuggingface,
  "scikit-learn": SiScikitlearn,
  react: SiReact,
  nextjs: SiNextdotjs,
  html: SiHtml5,
  css: SiCss,
  tailwind: SiTailwindcss,
  shadcn: SiShadcnui,
  fastapi: SiFastapi,
  nodejs: SiNodedotjs,
  express: SiExpress,
  "rest-api": Webhook,
  postgresql: SiPostgresql,
  supabase: SiSupabase,
  sqlite: SiSqlite,
  mongodb: SiMongodb,
  chroma: Layers,
  git: SiGit,
  github: SiGithub,
  docker: SiDocker,
  vercel: SiVercel,
  groq: Zap,
  openrouter: SiOpenrouter,
  gemini: SiGooglegemini,
  openai: TbBrandOpenai,
};

export type TechIconProps = {
  name: TechIconKey;
  className?: string;
};

/**
 * Decorative technology glyph. Every call site renders the technology name as
 * adjacent text, so the icon is hidden from assistive tech rather than
 * announced a second time.
 */
export function TechIcon({ name, className }: TechIconProps) {
  const Glyph = TECH_ICONS[name] ?? Box;
  return <Glyph aria-hidden="true" className={className} focusable="false" />;
}
