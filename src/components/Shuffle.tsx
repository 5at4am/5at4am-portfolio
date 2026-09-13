"use client";

import { useRef, useEffect, useState, useMemo, createElement } from "react";
import type { CSSProperties, ElementType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

import "./Shuffle.css";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

/**
 * Shuffle - React Bits Shuffle (JavaScript + CSS variant), TS-converted.
 *
 * Enhancement vs upstream: `fromText` prop. When provided, each letter strip
 * starts showing the ORIGINAL text's character at that position (instead of a
 * clone of the final char), so the animation reads as "fromText -> scramble ->
 * text" (e.g. "Satyam" -> "5at4am").
 */
type ShuffleProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
  shuffleDirection?: "left" | "right" | "up" | "down";
  duration?: number;
  maxDelay?: number;
  ease?: gsap.EaseString | gsap.EaseFunction;
  threshold?: number;
  rootMargin?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: CSSProperties["textAlign"];
  onShuffleComplete?: () => void;
  shuffleTimes?: number;
  animationMode?: "evenodd" | "random";
  loop?: boolean;
  loopDelay?: number;
  stagger?: number;
  scrambleCharset?: string;
  colorFrom?: string;
  colorTo?: string;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  triggerOnHover?: boolean;
  fromText?: string;
  hoverReveal?: boolean;
};

const Shuffle = ({
  text,
  className = "",
  style = {},
  shuffleDirection = "right",
  duration = 0.35,
  maxDelay = 0,
  ease = "power3.out",
  threshold = 0.1,
  rootMargin = "-100px",
  tag = "p",
  textAlign = "center",
  onShuffleComplete,
  shuffleTimes = 1,
  animationMode = "evenodd",
  loop = false,
  loopDelay = 0,
  stagger = 0.03,
  scrambleCharset = "",
  colorFrom,
  colorTo,
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = true,
  fromText,
  hoverReveal = false,
}: ShuffleProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [ready, setReady] = useState(false);

  const splitRef = useRef<GSAPSplitText | null>(null);
  const wrappersRef = useRef<HTMLElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const playingRef = useRef(false);
  const hoverHandlerRef = useRef<((e: Event) => void) | null>(null);
  const hoverEnterRef = useRef<((e: Event) => void) | null>(null);
  const hoverLeaveRef = useRef<((e: Event) => void) | null>(null);

  useEffect(() => {
    if ("fonts" in document) {
      if (document.fonts.status === "loaded") setFontsLoaded(true);
      else document.fonts.ready.then(() => setFontsLoaded(true));
    } else setFontsLoaded(true);
  }, []);

  const scrollTriggerStart = useMemo(() => {
    const startPct = (1 - threshold) * 100;
    const mm = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin || "");
    const mv = mm ? parseFloat(mm[1]) : 0;
    const mu = mm ? mm[2] || "px" : "px";
    const sign = mv === 0 ? "" : mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`;
    return `top ${startPct}%${sign}`;
  }, [threshold, rootMargin]);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      if (
        respectReducedMotion &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setReady(true);
        onShuffleComplete?.();
        return;
      }

      const el = ref.current;

      const start = scrollTriggerStart;

      const removeHover = () => {
        if (ref.current) {
          if (hoverHandlerRef.current) {
            ref.current.removeEventListener("mouseenter", hoverHandlerRef.current);
            hoverHandlerRef.current = null;
          }
          if (hoverEnterRef.current) {
            ref.current.removeEventListener("mouseenter", hoverEnterRef.current);
            hoverEnterRef.current = null;
          }
          if (hoverLeaveRef.current) {
            ref.current.removeEventListener("mouseleave", hoverLeaveRef.current);
            hoverLeaveRef.current = null;
          }
        }
      };

      const teardown = () => {
        if (tlRef.current) {
          tlRef.current.kill();
          tlRef.current = null;
        }
        if (wrappersRef.current.length) {
          wrappersRef.current.forEach((wrap) => {
            const inner = wrap.firstElementChild as HTMLElement;
            const orig = inner?.querySelector('[data-orig="1"]');
            if (orig && wrap.parentNode) wrap.parentNode.replaceChild(orig, wrap);
          });
          wrappersRef.current = [];
        }
        try {
          splitRef.current?.revert();
        } catch {
          /* noop */
        }
        splitRef.current = null;
        playingRef.current = false;
      };

      const build = () => {
        teardown();

        splitRef.current = new GSAPSplitText(el, {
          type: "chars",
          charsClass: "shuffle-char",
          wordsClass: "shuffle-word",
          linesClass: "shuffle-line",
          smartWrap: true,
          reduceWhiteSpace: false,
        });

        const chars = (splitRef.current.chars || []) as HTMLElement[];
        wrappersRef.current = [];

        const rolls = Math.max(1, Math.floor(shuffleTimes));
        const rand = (set: string) => set.charAt(Math.floor(Math.random() * set.length)) || "";
        const isVertical = shuffleDirection === "up" || shuffleDirection === "down";
        const metricsContext = isVertical
          ? document.createElement("canvas").getContext("2d")
          : null;

        const measureVerticalCell = (node: Element, lineBoxHeight: number) => {
          const computed = window.getComputedStyle(node);
          let fontHeight = 0;

          if (metricsContext) {
            metricsContext.font = [
              computed.fontStyle,
              computed.fontVariant,
              computed.fontWeight,
              computed.fontSize,
              computed.fontFamily,
            ].join(" ");

            const sample = `${node.textContent || "M"}${scrambleCharset}`;
            const metrics = metricsContext.measureText(sample);
            const ascent = metrics.fontBoundingBoxAscent;
            const descent = metrics.fontBoundingBoxDescent;
            if (Number.isFinite(ascent) && Number.isFinite(descent)) fontHeight = ascent + descent;
          }

          if (!fontHeight) {
            const probe = node.cloneNode(true) as HTMLElement;
            probe.textContent = `${node.textContent || "M"}${scrambleCharset}`;
            Object.assign(probe.style, {
              position: "absolute",
              visibility: "hidden",
              pointerEvents: "none",
              width: "auto",
              height: "auto",
              whiteSpace: "nowrap",
              lineHeight: "normal",
              fontFamily: computed.fontFamily,
              fontSize: computed.fontSize,
              fontStyle: computed.fontStyle,
              fontVariant: computed.fontVariant,
              fontWeight: computed.fontWeight,
              fontStretch: computed.fontStretch,
            });
            document.body.appendChild(probe);
            fontHeight = probe.getBoundingClientRect().height;
            probe.remove();
          }

          const overflow = Math.max(0, Math.ceil(fontHeight - lineBoxHeight));
          const padTop = Math.floor(overflow / 2);
          return { cellHeight: lineBoxHeight + overflow, padTop, padBottom: overflow - padTop };
        };

        chars.forEach((ch, idx) => {
          const parent = ch.parentElement;
          if (!parent) return;

          const w = ch.getBoundingClientRect().width;
          const h = ch.getBoundingClientRect().height;
          if (!w) return;

          const { cellHeight, padTop, padBottom } = isVertical
            ? measureVerticalCell(ch, h)
            : { cellHeight: h, padTop: 0, padBottom: 0 };

          const wrap = document.createElement("span");
          Object.assign(wrap.style, {
            display: "inline-block",
            overflow: "hidden",
            width: w + "px",
            height: isVertical ? cellHeight + "px" : "auto",
            marginTop: isVertical ? -padTop + "px" : "0",
            marginBottom: isVertical ? -padBottom + "px" : "0",
            verticalAlign: "bottom",
          });

          const inner = document.createElement("span");
          Object.assign(inner.style, {
            display: "inline-block",
            whiteSpace: isVertical ? "normal" : "nowrap",
            willChange: "transform",
          });

          parent.insertBefore(wrap, ch);
          wrap.appendChild(inner);

          // First visible glyph: the ORIGINAL text's char (fromText) so the
          // animation reads "Satyam -> scramble -> 5at4am".
          const firstOrig = document.createElement("span");
          firstOrig.textContent = fromText ? fromText[idx] ?? ch.textContent : ch.textContent;
          Object.assign(firstOrig.style, {
            display: isVertical ? "flex" : "inline-block",
            alignItems: isVertical ? "center" : "",
            justifyContent: isVertical ? "center" : "",
            height: isVertical ? cellHeight + "px" : "",
            lineHeight: isVertical ? h + "px" : "",
            width: w + "px",
            textAlign: "center",
          });

          ch.setAttribute("data-orig", "1");
          Object.assign(ch.style, {
            display: isVertical ? "flex" : "inline-block",
            alignItems: isVertical ? "center" : "",
            justifyContent: isVertical ? "center" : "",
            height: isVertical ? cellHeight + "px" : "",
            lineHeight: isVertical ? h + "px" : "",
            width: w + "px",
            textAlign: "center",
          });

          inner.appendChild(firstOrig);
          for (let k = 0; k < rolls; k++) {
            const c = ch.cloneNode(true) as HTMLElement;
            if (scrambleCharset) c.textContent = rand(scrambleCharset);
            Object.assign(c.style, {
              display: isVertical ? "flex" : "inline-block",
              alignItems: isVertical ? "center" : "",
              justifyContent: isVertical ? "center" : "",
              height: isVertical ? cellHeight + "px" : "",
              lineHeight: isVertical ? h + "px" : "",
              width: w + "px",
              textAlign: "center",
            });
            inner.appendChild(c);
          }
          inner.appendChild(ch);

          const steps = rolls + 1;

          if (shuffleDirection === "right" || shuffleDirection === "down") {
            const firstCopy = inner.firstElementChild;
            const real = inner.lastElementChild;
            if (real) inner.insertBefore(real, inner.firstChild);
            if (firstCopy) inner.appendChild(firstCopy);
          }

          let startX = 0;
          let finalX = 0;
          let startY = 0;
          let finalY = 0;

          if (shuffleDirection === "right") {
            startX = -steps * w;
            finalX = 0;
          } else if (shuffleDirection === "left") {
            startX = 0;
            finalX = -steps * w;
          } else if (shuffleDirection === "down") {
            startY = -steps * cellHeight;
            finalY = 0;
          } else if (shuffleDirection === "up") {
            startY = 0;
            finalY = -steps * cellHeight;
          }

          if (shuffleDirection === "left" || shuffleDirection === "right") {
            gsap.set(inner, { x: startX, y: 0, force3D: true });
            inner.setAttribute("data-start-x", String(startX));
            inner.setAttribute("data-final-x", String(finalX));
          } else {
            gsap.set(inner, { x: 0, y: startY, force3D: true });
            inner.setAttribute("data-start-y", String(startY));
            inner.setAttribute("data-final-y", String(finalY));
          }

          if (colorFrom) inner.style.color = colorFrom;
          wrappersRef.current.push(wrap);
        });
      };

      const inners = () => wrappersRef.current.map((w) => w.firstElementChild as HTMLElement);

      const randomizeScrambles = () => {
        if (!scrambleCharset) return;
        wrappersRef.current.forEach((w) => {
          const strip = w.firstElementChild as HTMLElement;
          if (!strip) return;
          const kids = Array.from(strip.children);
          for (let i = 1; i < kids.length - 1; i++) {
            kids[i].textContent =
              scrambleCharset.charAt(Math.floor(Math.random() * scrambleCharset.length));
          }
        });
      };

      const cleanupToStill = () => {
        wrappersRef.current.forEach((w) => {
          const strip = w.firstElementChild as HTMLElement;
          if (!strip) return;
          const real = strip.querySelector('[data-orig="1"]');
          if (!real) return;
          strip.replaceChildren(real);
          strip.style.transform = "none";
          strip.style.willChange = "auto";
        });
      };

      const play = () => {
        const strips = inners();
        if (!strips.length) return;

        playingRef.current = true;
        const isVertical = shuffleDirection === "up" || shuffleDirection === "down";

        const tl = gsap.timeline({
          smoothChildTiming: true,
          repeat: loop ? -1 : 0,
          repeatDelay: loop ? loopDelay : 0,
          onRepeat: () => {
            if (scrambleCharset) randomizeScrambles();
            if (isVertical) {
              gsap.set(strips, { y: (_i, t) => parseFloat(t.getAttribute("data-start-y") || "0") });
            } else {
              gsap.set(strips, { x: (_i, t) => parseFloat(t.getAttribute("data-start-x") || "0") });
            }
            onShuffleComplete?.();
          },
          onComplete: () => {
            playingRef.current = false;
            if (!loop) {
              // hoverReveal keeps the full char strips so hover can swap
              // between the text and fromText states without rebuilding.
              if (!hoverReveal) cleanupToStill();
              if (colorTo) gsap.set(strips, { color: colorTo });
              onShuffleComplete?.();
              armHover();
            }
          },
        });

        const addTween = (targets: HTMLElement[], at: number) => {
          const vars: gsap.TweenVars = {
            duration,
            ease,
            force3D: true,
            stagger: animationMode === "evenodd" ? stagger : 0,
          };
          if (isVertical) {
            vars.y = (_i, t) => parseFloat(t.getAttribute("data-final-y") || "0");
          } else {
            vars.x = (_i, t) => parseFloat(t.getAttribute("data-final-x") || "0");
          }

          tl.to(targets, vars, at);

          if (colorFrom && colorTo) {
            tl.to(targets, { color: colorTo, duration, ease }, at);
          }
        };

        if (animationMode === "evenodd") {
          const odd = strips.filter((_, i) => i % 2 === 1);
          const even = strips.filter((_, i) => i % 2 === 0);
          const oddTotal = duration + Math.max(0, odd.length - 1) * stagger;
          const evenStart = odd.length ? oddTotal * 0.7 : 0;
          if (odd.length) addTween(odd, 0);
          if (even.length) addTween(even, evenStart);
        } else {
          strips.forEach((strip) => {
            const d = Math.random() * maxDelay;
            const vars: gsap.TweenVars = {
              duration,
              ease,
              force3D: true,
            };
            if (isVertical) {
              vars.y = parseFloat(strip.getAttribute("data-final-y") || "0");
            } else {
              vars.x = parseFloat(strip.getAttribute("data-final-x") || "0");
            }
            tl.to(strip, vars, d);
            if (colorFrom && colorTo)
              tl.fromTo(strip, { color: colorFrom }, { color: colorTo, duration, ease }, d);
          });
        }

        tlRef.current = tl;
      };

      /**
       * Swap the visible glyph between the resting `text` ("5at4am") and the
       * revealed `fromText` ("Satyam"). Works by sliding each char strip to
       * its start (fromText) or final (text) position; the randomized
       * scramble glyphs in between make the swap read as a shuffle.
       */
      const swapTo = (target: "text" | "fromText") => {
        const strips = inners();
        if (!strips.length || playingRef.current) return;
        if (scrambleCharset) randomizeScrambles();

        const isVertical = shuffleDirection === "up" || shuffleDirection === "down";
        const fromOrigin = target === "fromText";
        const finish = () => {
          playingRef.current = false;
          onShuffleComplete?.();
        };

        playingRef.current = true;
        const vars: gsap.TweenVars = {
          duration,
          ease,
          force3D: true,
          stagger: animationMode === "evenodd" ? stagger : 0,
          onComplete: finish,
        };

        if (isVertical) {
          const attr = fromOrigin ? "data-start-y" : "data-final-y";
          vars.y = (_i: number, t: HTMLElement) =>
            parseFloat(t.getAttribute(attr) || "0");
        } else {
          const attr = fromOrigin ? "data-start-x" : "data-final-x";
          vars.x = (_i: number, t: HTMLElement) =>
            parseFloat(t.getAttribute(attr) || "0");
        }

        gsap.to(strips, vars);
      };

      const armHover = () => {
        if (!triggerOnHover || !ref.current) return;
        removeHover();

        if (hoverReveal && fromText) {
          const enter = () => {
            if (playingRef.current) return;
            swapTo("fromText");
          };
          const leave = () => {
            if (playingRef.current) return;
            swapTo("text");
          };
          hoverEnterRef.current = enter;
          hoverLeaveRef.current = leave;
          ref.current.addEventListener("mouseenter", enter);
          ref.current.addEventListener("mouseleave", leave);
          return;
        }

        const handler = () => {
          if (playingRef.current) return;
          build();
          if (scrambleCharset) randomizeScrambles();
          play();
        };
        hoverHandlerRef.current = handler;
        ref.current.addEventListener("mouseenter", handler);
      };

      const create = () => {
        build();
        if (scrambleCharset) randomizeScrambles();
        play();
        armHover();
        setReady(true);
      };

      const st = ScrollTrigger.create({
        trigger: el,
        start,
        once: triggerOnce,
        onEnter: create,
      });

      return () => {
        st.kill();
        removeHover();
        teardown();
        setReady(false);
      };
    },
    {
      dependencies: [
        text,
        duration,
        maxDelay,
        ease,
        scrollTriggerStart,
        fontsLoaded,
        shuffleDirection,
        shuffleTimes,
        animationMode,
        loop,
        loopDelay,
        stagger,
        scrambleCharset,
        colorFrom,
        colorTo,
        triggerOnce,
        respectReducedMotion,
        triggerOnHover,
        onShuffleComplete,
        fromText,
        hoverReveal,
      ],
      scope: ref,
    }
  );

  const commonStyle = useMemo(() => ({ textAlign, ...style }), [textAlign, style]);

  const classes = useMemo(
    () => `shuffle-parent ${ready ? "is-ready" : ""} ${className}`,
    [ready, className]
  );

  const Tag: ElementType = tag || "p";
  return createElement(Tag, { ref, className: classes, style: commonStyle }, text);
};

export default Shuffle;