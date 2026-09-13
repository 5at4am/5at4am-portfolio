import type { Profile } from "@/types";

export const profile: Profile = {
  name: "Satyam Raj",
  firstName: "Satyam",
  title: "AI Engineer",
  tagline: "Building AI systems that learn, create, and scale",
  email: "satraj6465@gmail.com",
  phone: "+91 7042416933",
  location: "Bhopal, India",
  linkedin: "https://linkedin.com/in/satyamraj001",
  github: "https://github.com/5at4am",
  summary:
    "Final-year B.Tech (AI & ML) student with hands-on experience building AI-powered business automation systems using LLMs, Retrieval-Augmented Generation (RAG), OCR pipelines, and workflow orchestration. Experienced in developing end-to-end AI applications with Python, FastAPI, LangChain, and modern AI frameworks through startup and industry internships. Passionate about solving real-world business problems using practical AI solutions.",
  education: {
    school: "LNCT University",
    degree: "B.Tech in Computer Science & Engineering (AI & ML)",
    cgpa: "8.34/10",
    location: "Bhopal, India",
    period: "2023 - 2027",
  },
  experience: [
    {
      role: "AI Engineer Intern",
      company: "Esterl.ai",
      period: "May 2026 - Present",
      location: "Remote",
      points: [
        "Engineered AI-powered workflow automation solutions using Python, LLMs, and OCR to streamline business operations for enterprise clients.",
        "Developed intelligent document-processing applications that automated paperwork and reduced manual effort by 60% across internal workflows.",
      ],
      tags: ["Python", "LLMs", "OCR", "Automation"],
      featured: true,
    },
    {
      role: "Agentic AI Intern (Capstone)",
      company: "Wiiz Platform",
      period: "Dec 2025 - Jan 2026",
      location: "Remote",
      points: [
        "Designed and implemented a multi-agent Contract Risk Analyzer using LangChain to extract, classify, and summarize risks from legal contracts.",
        "Awarded Best Capstone Project and Highest Workflow Creation for delivering one of the program's top AI solutions.",
      ],
      tags: ["LangChain", "Multi-Agent", "RAG", "Legal AI"],
      featured: true,
    },
    {
      role: "Generative AI Intern",
      company: "EduSkills Foundation × Google Cloud",
      period: "Jan 2025 - Mar 2025",
      location: "Remote",
      points: [
        "Developed GenAI applications using Vertex AI, Gemini APIs, and RAG techniques for document understanding and intelligent information retrieval.",
        "Worked with prompt engineering, vector search, and structured AI outputs for document understanding.",
      ],
      tags: ["Vertex AI", "Gemini", "RAG", "Vector Search"],
    },
  ],
  projects: [
    {
      slug: "rag-data-explorer",
      title: "RAG Data Explorer",
      description:
        "Query uploaded CSV datasets in natural language with a RAG pipeline built on LangChain.",
      longDescription:
        "A Retrieval-Augmented Generation (RAG) application built with LangChain that enables users to query uploaded CSV datasets in natural language. Implements a retrieval pipeline to provide context-aware, AI-generated insights from structured tabular data. It turns raw spreadsheets into conversational intelligence.",
      tech: ["Python", "LangChain", "FastAPI", "Pandas"],
      category: "RAG",
      links: {
        github: "https://github.com/5at4am",
      },
      imagePrompt:
        "Black and white futuristic data visualization dashboard, monochrome data streams flowing through neural network nodes, CSV tables transforming into insights, dark cinematic lighting, grayscale, high contrast, premium tech aesthetic",
      highlights: [
        "Natural language querying over structured CSV data",
        "Context-aware retrieval pipeline with embeddings",
        "FastAPI backend with streaming responses",
      ],
      year: "2025",
    },
    {
      slug: "ai-task-manager",
      title: "AI Task Manager",
      description:
        "Full-stack AI task management app that automates task creation, prioritization, and intelligent assistance.",
      longDescription:
        "A full-stack AI task management application built with FastAPI, React.js, and the Gemini API. Automates task creation, prioritization, and provides intelligent task assistance. An AI copilot for personal productivity.",
      tech: ["Python", "FastAPI", "React.js", "LangChain", "Gemini API"],
      category: "Full-Stack",
      links: {
        github: "https://github.com/5at4am",
      },
      imagePrompt:
        "Black and white futuristic AI task management interface, monochrome task cards and checkmarks, robot assistant organizing workflow, dark cinematic lighting, grayscale, high contrast, premium tech aesthetic",
      highlights: [
        "AI-powered task creation and prioritization",
        "Gemini API integration for intelligent assistance",
        "React.js frontend with FastAPI backend",
      ],
      year: "2025",
    },
  ],
  skills: [
    {
      category: "Languages",
      skills: ["Python", "Java", "JavaScript", "SQL"],
    },
    {
      category: "AI Engineering",
      skills: [
        "LangChain",
        "LLM Integration",
        "RAG",
        "AI Agents",
        "Multi-Agent Systems",
        "Prompt Engineering",
        "OCR Pipelines",
        "Vector Search",
        "Embeddings",
      ],
    },
    {
      category: "Frameworks",
      skills: ["FastAPI", "React.js", "Next.js", "Node.js", "Tailwind CSS", "Streamlit"],
    },
    {
      category: "Databases",
      skills: ["MongoDB", "PostgreSQL", "ChromaDB", "Supabase"],
    },
    {
      category: "Developer Tools",
      skills: ["Git", "GitHub", "Docker", "Postman", "Jupyter Notebook", "VS Code"],
    },
  ],
  achievements: [
    {
      title: "Best Capstone Project & Highest Workflow Creation",
      org: "Wiiz Platform Agentic AI Program",
      tier: "award",
    },
    {
      title: "Selected for Google Cloud Generative AI Virtual Internship",
      org: "EduSkills & Google Cloud",
      tier: "award",
    },
    {
      title: "Salesforce Developer with Agentblazer Champion",
      org: "SmartBridge & AICTE",
      tier: "cert",
    },
    {
      title: "Data Science Master Virtual Internship",
      org: "EduSkills & Altair",
      tier: "cert",
    },
    {
      title: "Deep Learning Practical with Python, TensorFlow & Keras",
      org: "Samatrix.io",
      tier: "cert",
    },
  ],
  whatIDo: [
    {
      title: "LLM Systems",
      description: "End-to-end LLM applications: integration, prompting, evaluation.",
      icon: "brain",
      href: "/projects/ai-task-manager",
    },
    {
      title: "RAG Pipelines",
      description: "Retrieval-augmented generation over documents, CSVs, and contracts.",
      icon: "search",
      href: "/projects/rag-data-explorer",
    },
    {
      title: "Agentic Workflows",
      description: "Multi-agent systems that automate real business operations.",
      icon: "bot",
      href: "/projects/rag-data-explorer",
    },
  ],
};

export const imagePrompts = {
  hero: "Black and white portrait of a futuristic AI humanoid robot head, glossy black surfaces, dramatic monochrome rim lighting, dark cinematic environment, high contrast, editorial style, grayscale, premium advertising aesthetic, 3D render",
  about: "Abstract neural network visualization, monochrome nodes connected by light streams on pure black background, depth of field, cinematic lighting, grayscale, premium tech aesthetic",
  mascot: "Extremely simple cute rounded robot mascot character, bold silhouette, two colors: white body with black face, solid black background, lower-left corner composition, neo-skeuomorphic subtle depth, minimal details, baby-like appeal, square image",
};