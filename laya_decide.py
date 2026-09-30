import json
from laya import Router

state = """Portfolio project for Satyam Raj, an AI engineer.
Ship target: single static page, lowercase index.html, GitHub Pages at 5at4am.me.
Installed but optional: Next.js 16, React 19, Tailwind v4, gsap 3.15, lenis, motion 13, aos 2.3.4,
shadcn/ui, lucide-react, @google/design.md.
Verified facts already supplied by the owner, content must not be invented:
name Satyam Raj, AI Engineer Intern at Estrel.ai, Bhopal India.
CoalSutra: SIH 2026 prototype, 109 passing offline tests, live on Vercel.
RAG Data Explorer. CGPA 8.34/10. Wiiz Platform Best Capstone Project.
STRICT RULES, no exceptions:
- No purple anywhere, no purple gradients or glows.
- No pill-shaped buttons or tags. Sharp or lightly rounded only.
- No emoji as icons. Lucide or plain text.
- No custom cursor.
- No parallax stacking, no pinned sections, no motion on every element.
  One or two restrained reveals maximum, respect prefers-reduced-motion.
- Hero states name, role, and what is built in one specific line. No vague hero text.
- No fake reviews, testimonials, metrics, or animated counters.
- No AI stock photos. Real screenshots or nothing.
- No AI-slop copy. Every line specific and true.
- No em-dashes anywhere.
Dark theme, accessible contrast, mobile readable. No images available yet."""

questions = {
    "framework": {
        "type": "choice",
        "instructions": "Choose how this single-page portfolio should be built for GitHub Pages.",
        "criteria": {
            "static_html": "Plain HTML, CSS and one small JS file. Lowercase index.html drops straight into the repo. Fastest, zero build step, no framework weight.",
            "next_export": "Reuse the existing Next.js 16 app with static export. Needs a build step, basePath config, and a deploy action, heavier for a one page site.",
        },
    },
    "reveals": {
        "type": "choice",
        "instructions": "Choose how many scroll reveal animations the site should have.",
        "criteria": {
            "one": "A single restrained reveal pattern used on section headings only.",
            "two": "Two distinct reveals, headings plus one more element type.",
            "none": "No scroll reveals at all, static page only.",
        },
    },
    "hero_stat": {
        "type": "noul",
        "instructions": "Should the hero contain a numeric stat or counter, given fake metrics are banned?",
        "criteria": {
            "true": "Yes, the hero should show a real number.",
            "false": "No, the hero should carry no number at all.",
        },
    },
    "imagery": {
        "type": "choice",
        "instructions": "Choose the project section treatment when no real screenshots exist yet.",
        "criteria": {
            "text_only": "Text only projects, no placeholder blocks pretending to be screenshots.",
            "placeholder": "Neutral placeholder frames reserved for screenshots to be added later.",
        },
    },
    "radius": {
        "type": "choice",
        "instructions": "Choose the corner radius treatment for a sharp but not harsh engineering look.",
        "criteria": {
            "sharp": "Fully square corners, radius 0.",
            "light": "Lightly rounded, radius 2 to 4px.",
        },
    },
    "aos": {
        "type": "choice",
        "instructions": "Choose what to do with the aos package, which is not React safe and is unused.",
        "criteria": {
            "keep": "Leave it installed but unused.",
            "remove": "Uninstall it to keep the dependency list honest.",
        },
    },
}

r = Router()
out = r.predict(state, questions)
print(json.dumps(out, indent=2, default=str))
