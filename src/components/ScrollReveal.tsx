"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * ScrollReveal - fades/slides children in as they enter the viewport.
 * Uses Motion's whileInView (lighter than GSAP for simple reveals; GSAP is
 * reserved for pin/scrub work in ScrollExpand). Renders static under
 * prefers-reduced-motion.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}