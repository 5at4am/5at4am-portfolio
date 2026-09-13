import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system: pure black canvas + white accent + grays
        canvas: "#000000",
        accent: "#FFFFFF",
        "accent-deep": "#D4D4D4",
        "accent-warm": "#F5F5F5",
        paper: "#FFFFFF",
        "ink-muted": "#8A8A8A",
        "line-subtle": "#262626",
      },
      fontFamily: {
        sans: ["var(--font-onest)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(4rem, 12vw, 9rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(3rem, 8vw, 6rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(2.25rem, 5vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-sm": ["clamp(1.75rem, 3.5vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        glow: "0 0 80px -20px rgba(255, 255, 255, 0.5)",
        "glow-sm": "0 0 40px -12px rgba(255, 255, 255, 0.4)",
        card: "0 0 0 1px rgba(255, 255, 255, 0.08)",
      },
      animation: {
        "boil-1": "boil 1.2s ease-in-out infinite",
        "boil-2": "boil 1.2s ease-in-out 0.4s infinite",
        "boil-3": "boil 1.2s ease-in-out 0.8s infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        boil: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "33%": { transform: "translate(0.5px, -0.5px)" },
          "66%": { transform: "translate(-0.5px, 0.5px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;