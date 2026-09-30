# PORTFOLIO CONTEXT - Satyam Raj

Everything in the FACTS section is verified against the real resume. Do not invent anything beyond it.

================================================================
1. FORMAT NOTE (MD vs JSON)
================================================================

Use this Markdown file, not JSON. Coding agents read prose + bullet context more reliably, and MD lets
you mix facts, rules, and examples in one paste. If your agent supports a persistent context file,
save this as PORTFOLIO_CONTEXT.md in the repo root.

================================================================
2. VERIFIED FACTS (from the actual resume - use exactly, change nothing)
================================================================

## Identity
- Name: Satyam Raj
- Alias: 5at4am
- Location: Bhopal, India
- Phone: +91 7042416933
- Email: satraj6465@gmail.com
- LinkedIn: https://linkedin.com/in/satyamraj001
- GitHub: https://github.com/5at4am
- Portfolio domain: 5at4am.me (hosted on GitHub Pages, repo: 5at4am/5at4am.github.io)

## Headline / positioning
AI Engineer Intern at Estrel.ai. Final-year B.Tech CSE (AI & ML) student building LLM, RAG, OCR, and
multi-agent systems end to end with Python, FastAPI, and LangChain.

## Summary (resume summary, reusable as About section)
Final-year B.Tech Computer Science student specializing in AI and ML, with internship and project
experience building LLM, RAG, OCR, and multi-agent applications. Develops end-to-end systems with
Python, FastAPI, LangChain, and modern web tools, with a focus on traceable document intelligence and
workflow automation.

## Education
- B.Tech in Computer Science & Engineering (AI & ML), LNCT University, Bhopal, 2023-2027
- CGPA: 8.34/10

## Experience (all remote, all real - use these exact titles and spellings)
1. AI Engineer Intern - Estrel.ai - May 2026 to Present
   - Engineers AI workflow automation with Python, LLMs, and OCR for enterprise business processes.
   - Built document-processing applications that automated paperwork and reduced manual effort by 60%
     across internal workflows.
   - NOTE: company spelling is "Estrel.ai" exactly (an old resume said "Esterl.ai" - that was wrong).
2. Agentic AI Intern (Capstone) - Wiiz Platform - Dec 2025 to Jan 2026
   - Built a multi-agent Contract Risk Analyzer with LangChain to extract, classify, and summarize risks
     from legal contracts.
   - Won Best Capstone Project and Highest Workflow Creation for the program.
3. Generative AI Intern - EduSkills Foundation x Google Cloud - Jan 2025 to Mar 2025
   - Built GenAI applications with Vertex AI, Gemini APIs, RAG, prompt engineering, vector search, and
     structured outputs.

## Projects
1. CoalSutra - https://github.com/5at4am/CoalSutra
   - Stack: FastAPI, Next.js 14, PostgreSQL/pgvector, OCR (RapidOCR/pdfplumber), RAG, Tailwind, Docker
     Compose, Groq LLM.
   - Smart India Hackathon 2026 prototype (Ministry of Coal problem statement) that turns
     mining/geological PDFs, scans, images, CSVs and spreadsheets into structured, traceable facts.
   - Features: grounded Q&A with page citations, automated report generation with fact checks, topic
     analysis, human review queue for cross-source conflicts, 109 passing offline tests.
   - Live deployment on Vercel.
   - IMPORTANT: describe it as an "SIH 2026 prototype". NEVER call him an "SIH finalist" or "SIH
     winner" - that is not true and he has flagged it before.
2. RAG Data Explorer - https://github.com/5at4am/rag_data_explorer
   - Stack: Python, LangChain, FastAPI, Pandas.
   - RAG app: upload a CSV dataset, query it in natural language, get context-aware insights.

## Technical Skills (as listed on the resume)
- Languages: Python, Java, JavaScript, SQL
- AI Engineering: LLMs, RAG, LangChain, AI agents, multi-agent systems, prompt engineering, OCR,
  vector search, embeddings
- Frameworks: FastAPI, React.js, Next.js, Node.js, Tailwind CSS, Streamlit
- Data & Tools: PostgreSQL, pgvector, MongoDB, ChromaDB, Supabase, Git, GitHub, Docker, Postman,
  Jupyter Notebook
- HONESTY NOTE: Next.js, Node.js, PostgreSQL, MongoDB and Docker appear in the skills list but no
  resume bullet proves them yet. Fine to list them as skills; do NOT write project/experience claims
  around them beyond CoalSutra's real stack.

## Achievements & Certifications (all real)
- Best Capstone Project & Highest Workflow Creation - Wiiz Platform Agentic AI Program
- Team Pentos: top 50 of 8,000+ teams in India, Capgemini Exceller Agentic AI Buildathon
- Salesforce Developer with Agentblazer Champion - SmartBridge & AICTE
- Data Science Master Virtual Internship - EduSkills & Altair
- Deep Learning Practical with Python, TensorFlow & Keras - Samatrix.io

================================================================
3. WHAT TO PUT ON THE PORTFOLIO (vs what stays off)
================================================================

## INCLUDE
- Name, one-line specific headline (role + what he builds), Bhopal, India.
- Contact: email, LinkedIn, GitHub. Phone is optional on a public site.
- About/summary: the resume summary above, lightly shortened.
- Experience: all three internships with 1-2 bullets each.
- Projects: CoalSutra first (strongest, live + tested), RAG Data Explorer second. Each with stack tags,
  2-3 concrete bullets, GitHub link, live link where it exists.
- Skills: grouped exactly as the resume groups them.
- Achievements & certifications: the list above.
- CGPA 8.34/10: fine to include, it is solid.
- Education: degree, university, 2023-2027.

## DO NOT INCLUDE (resume-only or private info)
- Home/hostel address, PIN code - never on a public site.
- Enrollment number, Superset ID - application forms only.
- Salary, stipend, expected compensation, notice period - never public.
- "SIH finalist/winner" claims - false, forbidden.
- Fake metrics, visitor counters, testimonials, reviews - he has explicitly banned these.
- Percentages or numbers not in this file. The only metric allowed is the 60% manual-effort reduction,
  and it must stay attached to the Estrel.ai bullet, not turned into a hero stat.
- A third project (Telegram bot) exists but its GitHub repo has no code pushed yet - leave it out
  until the code is public.
- Graduation date precision ("27 July 2027") is for job forms; the site only needs "2023-2027" or
  "Class of 2027".

================================================================
4. DESIGN RULES (his own stated rules - apply strictly)
================================================================

- No purple anywhere: no purple gradients, glows, or accents.
- No pill-shaped buttons or tags. Sharp or lightly rounded corners only.
- No emoji used as icons. Use a real icon set (Lucide) or plain text.
- No cursor animation or custom cursor.
- No crazy scroll animations: no parallax stacking, pinned sections, or motion on every element. One or
  two restrained reveals max, respect prefers-reduced-motion.
- No vague hero text like "I craft digital experiences." State name, role, and what he builds in one
  specific line.
- No fake reviews, testimonials, metrics, or customer counters.
- No AI-generated stock photos. Real project screenshots or nothing.
- No AI-slop copy: no buzzword filler, every line says something specific and true.
- No em-dashes anywhere. Use a normal dash or rewrite the sentence.
- Dark theme is his current direction; keep contrast accessible (check with WebAIM Contrast Checker).

================================================================
5. INSTRUCTIONS FOR THE CODING AGENT
================================================================

1. Treat section 2 as the complete source of truth. If a fact is not in section 2, do not write it.
2. Build a single-page static site (plain HTML/CSS/JS or his existing setup) for GitHub Pages at
   5at4am.me. The entry file must be lowercase index.html - a capital Index.html breaks GitHub Pages.
3. Section order: Hero (name + specific headline + links) -> About -> Experience -> Projects -> Skills
   -> Achievements -> Contact.
4. Every project and experience bullet must be copy-pasteable from this file. Do not "improve" the
   claims.
5. Apply every rule in section 4 without exception.
6. Keep it one page, fast, and readable on mobile.
7. Before finishing, self-check: any purple? any pill shapes? any emoji icons? any number not from
   section 2? any em-dash? Fix all of these.
