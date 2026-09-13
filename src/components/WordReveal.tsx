"use client";

import {
  useEffect,
  useRef,
  useMemo,
  Children,
  isValidElement,
  cloneElement,
  createElement,
} from "react";
import type { ReactNode, RefObject, ElementType, ReactElement } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./WordReveal.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * WordReveal - React Bits ScrollReveal (GSAP variant), enhanced.
 * Splits ALL text content (strings or JSX, recursively) into words and
 * reveals them word-by-word, scrubbed to scroll position: container rotates
 * baseRotation -> 0, words fade baseOpacity -> 1 and blur -> 0 as the
 * section scrolls through the viewport.
 *
 * Enhancements vs upstream:
 * - Accepts JSX children (recursively splits every text node into words;
 *   each text node's words are grouped in a .word-group span so flex/grid
 *   layouts keep their item structure).
 * - `as` prop for the container tag (h2 default; p/div/li/span for body text).
 * - Cleanup scoped with gsap.context (upstream kills ALL ScrollTriggers,
 *   which would break ScrollExpand's pin).
 * - Renders static under prefers-reduced-motion.
 */
type WordRevealProps = {
  children: ReactNode;
  as?: ElementType;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationStart?: string;
  wordAnimationEnd?: string;
  /**
   * Parallax scroll speed (0.5 = half speed, 1.5 = faster). Placed as a
   * `data-speed` attribute consumed by ScrollSmoother when `effects: true`.
   * Rendered as a static (no-op) attribute otherwise — safe to pass always.
   */
  dataSpeed?: number;
};

const splitTextNodes = (children: ReactNode): ReactNode => {
  return Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      const text = String(child);
      return (
        <span className="word-group">
          {text.split(/(\s+)/).map((word, i) =>
            word.match(/^\s+$/) ? (
              word
            ) : (
              <span className="word" key={`w-${i}`}>
                {word}
              </span>
            )
          )}
        </span>
      );
    }
    if (isValidElement(child)) {
      const childProps = child.props as { children?: ReactNode };
      if (childProps.children != null) {
        return cloneElement(child as ReactElement<{ children?: ReactNode }>, {
          children: splitTextNodes(childProps.children),
        });
      }
      return child;
    }
    return child;
  });
};

const WordReveal = ({
  children,
  as = "h2",
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  dataSpeed,
  rotationEnd = "bottom bottom",
  wordAnimationStart = "top bottom-=40%",
  wordAnimationEnd = "bottom bottom",
}: WordRevealProps) => {
  const containerRef = useRef<HTMLElement | null>(null);

  const splitText = useMemo(() => splitTextNodes(children), [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    const ctx = gsap.context(() => {
      if (baseRotation !== 0) {
        gsap.fromTo(
          el,
          { transformOrigin: "0% 50%", rotate: baseRotation },
          {
            ease: "none",
            rotate: 0,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: "top bottom",
              end: rotationEnd,
              scrub: true,
            },
          }
        );
      }

      const wordElements = el.querySelectorAll(".word");

      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, willChange: "opacity" },
        {
          ease: "none",
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: wordAnimationStart,
            end: wordAnimationEnd,
            scrub: true,
          },
        }
      );

      if (enableBlur) {
        gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: "none",
            filter: "blur(0px)",
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: wordAnimationStart,
              end: wordAnimationEnd,
              scrub: true,
            },
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationStart, wordAnimationEnd, blurStrength]);

  return createElement(
    as,
    {
      ref: containerRef,
      className: `scroll-reveal ${containerClassName}`.trim(),
      ...(dataSpeed !== undefined && { "data-speed": dataSpeed }),
    },
    createElement(
      "span",
      { className: `scroll-reveal-text ${textClassName}`.trim() },
      splitText
    )
  );
};

export default WordReveal;