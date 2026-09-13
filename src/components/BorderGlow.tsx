import Link from "next/link";

/**
 * BorderGlow - a pill CTA with a slowly rotating white arc on its border.
 * The arc is a conic gradient on an oversized span that rotates (transform
 * only); the wrapper's overflow-hidden + p-px exposes it as a 1px ring.
 * Reduced motion is handled by the global override in globals.css.
 */
export default function BorderGlow({
  href,
  onClick,
  children,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const base =
    "group relative inline-flex overflow-hidden rounded-full p-px transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

  const ring = (
    <>
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border border-white/25 transition-colors duration-300 group-hover:border-white/60"
      />
      <span
        aria-hidden
        className="absolute -inset-[100%] animate-[border-glow-spin_6s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.95) 25deg, transparent 50deg)",
        }}
      />
    </>
  );

  const inner = (
    <span className="relative z-10 rounded-full bg-canvas px-6 py-3 text-sm font-semibold text-paper">
      {children}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={`${base} ${className ?? ""}`}>
        {ring}
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${base} ${className ?? ""}`}>
      {ring}
      {inner}
    </button>
  );
}