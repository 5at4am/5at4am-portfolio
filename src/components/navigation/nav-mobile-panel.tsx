"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { NavIconLinks } from "./nav-icon-links";
import { NavSectionLinks } from "./nav-section-links";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useEscapeKey } from "@/hooks/use-escape-key";

export type NavMobilePanelProps = {
  open: boolean;
  activeId: string;
  onClose: () => void;
};

/**
 * Slide-down navigation for small screens.
 *
 * Owns two side effects that belong to the panel rather than the header: it
 * locks body scroll while open and dismisses on Escape. Exiting the scroll lock
 * is handled by the hook's cleanup, so closing never strands the page.
 */
export function NavMobilePanel({ open, activeId, onClose }: NavMobilePanelProps) {
  const shouldReduceMotion = useReducedMotion();

  useBodyScrollLock(open);
  useEscapeKey(open, onClose);

  const motionProps = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="primary-menu"
          key="menu"
          {...motionProps}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="border-t border-border bg-background md:hidden"
        >
          <div className="mx-auto w-full max-w-5xl px-4 py-3 sm:px-6">
            <NavSectionLinks
              variant="bordered"
              activeId={activeId}
              onNavigate={onClose}
            />
          </div>
          <div className="mx-auto w-full max-w-5xl border-t border-border px-4 py-3 sm:px-6">
            <NavIconLinks onNavigate={onClose} />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
