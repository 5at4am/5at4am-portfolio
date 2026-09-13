# Satyam Raj — Portfolio

Single-page portfolio for [Satyam Raj](https://satyamraj.dev), an AI Engineer
building with LLMs, RAG, and agentic workflows. Monochrome "Dark Editorial"
design with a pure-black canvas, white accents, and heavy GSAP motion.

## Tech Stack

| Layer            | Choice                                                   |
| ---------------- | -------------------------------------------------------- |
| Framework        | Next.js 15 (App Router, `src/` layout)                   |
| Language         | TypeScript (strict) · React 19                           |
| Styling          | Tailwind CSS 3.4 + CSS variables + per-component CSS     |
| Motion           | GSAP 3.15 (ScrollTrigger, ScrollSmoother, SplitText), framer-motion |
| Smooth scroll    | GSAP ScrollSmoother (`#smooth-wrapper > #smooth-content`)|
| Typography       | Onest via `next/font/google`                             |
| Icons            | `react-icons` (Simple Icons)                             |
| Image generation | Hugging Face Inference API (`stabilityai/sdxl-turbo`, FLUX fallbacks) |

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `npm run dev`             | Start the development server                   |
| `npm run build`           | Create a production build                      |
| `npm run start`           | Serve the production build                     |
| `npm run lint`            | Run ESLint via `next lint`                     |
| `npm run generate-images` | Batch-generate portfolio images (see below)    |

## Environment Variables

| Variable           | Required | Description                                 |
| ------------------ | -------- | ------------------------------------------- |
| `HUGGINGFACE_TOKEN`| Optional | HF token for the image-generation features. |

Copy `.env.local.example` to `.env.local` (if provided) or create it yourself.
The token is used by:

- `POST /api/generate-image` — on-demand image generation endpoint.
- `npm run generate-images` — CLI batch generator at `scripts/generate-images.ts`.

Without the token, the site renders fully; only image generation is disabled.
Never commit your token — `.env*.local` is gitignored.

## Project Structure

```
public/                 Static assets (resume.pdf, images/, robots.txt)
scripts/
  generate-images.ts    CLI batch image generator
src/
  app/
    globals.css         Tailwind + CSS variables + scrollbar styles
    layout.tsx          Root layout, metadata (title, OG, robots)
    page.tsx            The entire single-page site
  components/           OptionWheel, TextLoop, Shuffle, WordReveal, BorderGlow, …
  lib/
    data.ts             All site content (profile, projects, skills, experience)
    hf.ts               Hugging Face Inference API client
    smoother.ts         ScrollSmoother singleton store + scrollToTarget
    utils.ts            cn() helper (clsx + tailwind-merge)
  types/                Shared TypeScript interfaces
```

## Editing Content

All site copy — hero, about, experience, projects, skills, and contact — lives
in `src/lib/data.ts`. Edit that file to update any content without touching
components. Metadata lives in `src/app/layout.tsx`; colors and type scale are
defined in `tailwind.config.ts`.

## Notes

- One single scrollable page at `/`; the only route besides it is
  `POST /api/generate-image`.
- All animations respect `prefers-reduced-motion` (global kill-switch in
  `globals.css` plus per-component checks).
- `lenis`, `ogl`, `lucide-react`, and `ScrollReveal.tsx` are currently
  installed but unused.
- `.gitignore` already covers `.vercel`, so the project is ready to deploy to
  Vercel (or any Next.js host) as-is — no deployment config is required.

## License

All rights reserved. © Satyam Raj.