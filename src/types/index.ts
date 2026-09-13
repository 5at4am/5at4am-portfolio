export interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  points: string[];
  tags: string[];
  featured?: boolean;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  tech: string[];
  category: "RAG" | "Agents" | "Full-Stack";
  links: {
    github?: string;
    live?: string;
  };
  imagePrompt: string;
  image?: string;
  highlights: string[];
  year: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface Achievement {
  title: string;
  org: string;
  tier: "award" | "cert";
}

export interface WhatIDo {
  title: string;
  description: string;
  icon: "brain" | "search" | "bot";
  href: string;
}

export interface Profile {
  name: string;
  firstName: string;
  title: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  education: {
    school: string;
    degree: string;
    cgpa: string;
    location: string;
    period: string;
  };
  experience: Experience[];
  projects: Project[];
  skills: SkillGroup[];
  achievements: Achievement[];
  whatIDo: WhatIDo[];
}