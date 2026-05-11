import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0D0D0D",
        "ink-2": "#141414",
        "ink-3": "#1C1C1C",
        cream: "#F4F1EA",
        "cream-2": "#EBE7DD",
        muted: "#8B847B",
        line: "#262626",
        "line-cream": "#E8E2D9",
        cyan: "#4CE9E9",
        violet: "#7B5CFF",
        amber: "#F77C27",
        red: "#E5484D",
      },
      fontFamily: {
        serif: ["DM Serif Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
        wide: "0.06em",
        wider: "0.1em",
        widest: "0.18em",
      },
      keyframes: {
        "aurora-pan": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(8%, -6%) scale(1.08)" },
          "66%": { transform: "translate(-6%, 4%) scale(0.96)" },
        },
        "marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.92)", opacity: "0.7" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
      },
      animation: {
        aurora: "aurora-pan 18s ease-in-out infinite",
        marquee: "marquee 38s linear infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
