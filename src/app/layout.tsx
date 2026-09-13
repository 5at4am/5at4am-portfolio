import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({ subsets: ["latin"], variable: "--font-onest" });

export const metadata: Metadata = {
  title: {
    template: "%s - Satyam Raj",
    default: "Satyam Raj - AI Engineer",
  },
  description:
    "AI Engineer building with LLMs, RAG, and agentic workflows.",
  openGraph: {
    title: "Satyam Raj - AI Engineer",
    description:
      "AI Engineer building with LLMs, RAG, and agentic workflows.",
    url: "https://satyamraj.dev",
    siteName: "Satyam Raj",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Satyam Raj - AI Engineer",
    description:
      "AI Engineer building with LLMs, RAG, and agentic workflows.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${onest.variable} dark`}>
      <body>{children}</body>
    </html>
  );
}