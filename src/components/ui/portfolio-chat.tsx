"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CornerDownLeft, MessageCircle, Send, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { useEscapeKey } from "@/hooks/use-escape-key";
import { useFocusContainment } from "@/hooks/use-focus-containment";
import { cn } from "@/lib/utils";
import { answerQuestion, CHAT_SUGGESTIONS } from "@/content/chat";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  links?: { label: string; href: string }[];
};

const GREETING: Message = {
  id: 0,
  role: "assistant",
  text: [
    "Ask me anything about the portfolio.",
    "I answer from the text published on this site, so everything here is something",
    "you can read for yourself further down the page.",
  ].join(" "),
};

export type PortfolioChatProps = {
  className?: string;
};

/**
 * "Ask about the portfolio" popup.
 *
 * There is no model behind this and the panel says so, in the footer, in plain
 * words. That is deliberate and it is the only honest option for this site: it is
 * a static export on GitHub Pages, so there is no server to hold an API key and
 * no key that could be put in this bundle without being published to the world
 * for anyone to read and spend. So the answers come from `answerQuestion`, which
 * matches the query against the content modules and cannot state a fact they do
 * not already publish.
 *
 * On accessibility and layering, this is a dialog and is treated like one:
 * `useFocusContainment` keeps Tab inside and returns focus to the trigger on
 * close, Escape closes, and the trigger is a real `<button>` carrying
 * `aria-expanded`/`aria-controls`.
 *
 * The backdrop dismisses on `click`, never on `pointerdown`. Closing on
 * pointerdown unmounts the panel before the browser synthesises the click, so the
 * click resolves against the page underneath and navigates it; that is a measured
 * bug recorded in nav-mobile-panel.tsx, and it applies here too.
 *
 * The page behind is deliberately NOT scroll-locked. A small fixed panel must not
 * take the page away from someone reading it, so the panel is a layer, not a
 * modal takeover.
 */
export function PortfolioChat({ className }: PortfolioChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const nextId = useRef(1);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const close = useCallback(() => setOpen(false), []);
  useEscapeKey(open, close);
  useFocusContainment(panelRef, open, triggerRef);

  const ask = useCallback((question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const answer = answerQuestion(trimmed);
    const userId = nextId.current++;
    const answerId = nextId.current++;
    setMessages((current) => [
      ...current,
      { id: userId, role: "user", text: trimmed },
      { id: answerId, role: "assistant", text: answer.text, links: answer.links },
    ]);
    setDraft("");

    /*
     * Scroll after the DOM has the new node. Doing it in the same tick measures
     * the old scrollHeight and lands the log short, and rAF is the earliest point
     * at which the message is actually laid out.
     */
    requestAnimationFrame(() => {
      const log = logRef.current;
      if (log) log.scrollTop = log.scrollHeight;
    });
  }, []);

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close the portfolio assistant"
          onClick={close}
          className="fixed inset-0 z-[60] cursor-default bg-black/20 backdrop-blur-[1px]"
        />
      ) : null}

      <div className={cn("fixed bottom-4 right-4 z-[61] sm:bottom-6 sm:right-6", className)}>
        <AnimatePresence>
          {open ? (
            <motion.div
              ref={panelRef}
              id="portfolio-chat-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Ask about Satyam's portfolio"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="flex h-[min(34rem,calc(100dvh-7.5rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl shadow-black/20"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">Ask about the portfolio</h2>
                <button
                  type="button"
                  onClick={close}
                  className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  <span className="sr-only">Close</span>
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>

              {/*
                `role="log"` with `aria-live="polite"` so an answer arriving is
                announced instead of silently replacing itself. `polite` rather
                than `assertive` because a chat answer is not urgent, and
                assertive would interrupt whatever the visitor was reading.
              */}
              <div
                ref={logRef}
                role="log"
                aria-live="polite"
                aria-label="Conversation"
                className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
              >
                {messages.map((message) => (
                  <div key={message.id}>
                    <p
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                        message.role === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : /*
                             * The assistant bubble needs a visible edge, and in
                             * this theme neither a tonal step nor a border can
                             * provide one: `--muted` against `--popover` measured
                             * 1.09:1, `--card` against `--popover` is exactly 1.0:1
                             * because both are the same white, and `--border`
                             * against either is about 1.2:1, all far below the 3:1
                             * that non-text UI needs.
                             *
                             * So the separation is a shadow rather than a fill
                             * difference, which works regardless of how close the
                             * theme's surface tokens are, plus the border for the
                             * dark theme where a shadow has nothing to sit
                             * against.
                             */
                             "border border-border bg-card text-card-foreground shadow-sm"
                      )}
                    >
                      {message.text}
                    </p>
                    {message.links?.length ? (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {message.links.map((link) => (
                          <li key={link.href}>
                            <a
                              href={link.href}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}

                {messages.length === 1 ? (
                  <ul className="flex flex-wrap gap-2 pt-1">
                    {CHAT_SUGGESTIONS.map((suggestion) => (
                      <li key={suggestion.query}>
                        <button
                          type="button"
                          onClick={() => ask(suggestion.query)}
                          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                        >
                          {suggestion.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  ask(draft);
                  inputRef.current?.focus();
                }}
                className="border-t border-border p-3"
              >
                <div className="flex items-end gap-2">
                  <label htmlFor="portfolio-chat-input" className="sr-only">
                    Ask a question about the portfolio
                  </label>
                  <input
                    ref={inputRef}
                    id="portfolio-chat-input"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Ask about projects, stack, experience..."
                    autoComplete="off"
                    className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  />
                  <button
                    type="submit"
                    disabled={draft.trim().length === 0}
                    className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40"
                  >
                    <span className="sr-only">Send question</span>
                    <Send aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </form>

              {/*
                The honesty line, stated plainly and not buried. A chat panel that
                does not say what is behind it invites the reader to assume a
                language model is answering, which would be a claim about this site
                that is not true.
              */}
              <p className="flex items-start gap-1.5 border-t border-border px-4 py-2 text-[0.7rem] leading-snug text-muted-foreground">
                <CornerDownLeft aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
                Answers come straight from this site&rsquo;s content, not from an AI
                model. Nothing here can be asked that the page does not already
                answer.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls="portfolio-chat-panel"
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "ml-auto grid size-12 place-items-center rounded-full shadow-lg transition-all duration-300",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
            open
              ? "scale-90 bg-muted text-foreground opacity-0 pointer-events-none"
              : "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
          )}
        >
          <span className="sr-only">Ask about the portfolio</span>
          <MessageCircle aria-hidden="true" className="size-5" />
        </button>
      </div>
    </>
  );
}