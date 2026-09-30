import { MapPin } from "lucide-react";

import { EDUCATION, SITE } from "@/content/site";

/** Initials shown in the avatar square, e.g. "5a" for 5at4am. */
const AVATAR_INITIALS = "5a";

/**
 * Profile header block: avatar, name, handle, role summary, and a meta row of
 * quick facts.
 */
export function ProfileIdentity() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-12 pb-14 sm:px-6 sm:pt-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div
          aria-hidden="true"
          className="flex size-24 shrink-0 items-center justify-center rounded-sm border border-border bg-muted font-mono text-3xl font-semibold text-foreground sm:size-32 sm:text-4xl"
        >
          {AVATAR_INITIALS}
        </div>

        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {SITE.name}
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            @{SITE.handle}
          </p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground">
            {SITE.role}. I build LLM, RAG, OCR, and multi-agent systems end to end
            with Python, FastAPI, and LangChain.
          </p>

          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4" />
              {SITE.location}
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="font-mono text-xs">
                SIH
              </span>
              CoalSutra prototype on Vercel
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="font-mono text-xs">
                CGPA
              </span>
              {EDUCATION.score.replace("CGPA ", "").replace("/", " / ")}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
