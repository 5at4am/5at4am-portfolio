import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
      <span className="select-none text-[10rem] font-black leading-none tracking-tight text-white/[0.06] md:text-[16rem]">
        404
      </span>
      <h1 className="relative -mt-28 text-3xl font-extrabold tracking-tight text-paper md:-mt-40 md:text-5xl">
        Page not found
      </h1>
      <p className="max-w-md text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        Back to home
      </Link>
    </main>
  );
}