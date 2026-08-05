import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0d0e12",
        panel: "#14161d",
        ink: "#f3f4f6",
        muted: "#9ca3af",
        accent: "#c5a059",
        "besiktas-red": "#e11d48",
        // Admin panel color tokens (mapped to CSS vars)
        "a-bg":      "var(--a-bg)",
        "a-surface": "var(--a-surface)",
        "a-text":    "var(--a-text)",
        "a-muted":   "var(--a-muted)",
        "a-border":  "var(--a-border)",
        "a-sidebar": "var(--a-sidebar)",
        "a-primary": "var(--a-primary)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-ring": "pulse-ring 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "fade-up": "fade-up 0.8s ease forwards",
        "slide-in-right": "slide-in-right 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        "float": "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.9" },
          "50%": { transform: "scale(1.15)", opacity: "0.4" },
          "100%": { transform: "scale(0.85)", opacity: "0.9" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
    },
  },
  plugins: [],
  // Enable dark mode via class for admin panel dark toggle
  darkMode: "class",
};

export default config;
