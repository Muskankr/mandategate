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
        background: "#080c16",
        foreground: "#f1f5f9",
        navy: {
          950: "#060911",
          900: "#0b101e",
          850: "#0f1629",
          800: "#141c33",
          700: "#1d2948",
          600: "#27375e",
        },
        card: {
          DEFAULT: "#0f1629",
          hover: "#141d36",
          subtle: "#121a30",
          border: "#1e2947",
        },
        accent: {
          violet: "#8b5cf6",
          violetLight: "#a78bfa",
          violetDark: "#6d28d9",
          blue: "#3b82f6",
          blueLight: "#60a5fa",
          blueDark: "#1d4ed8",
          cyan: "#06b6d4",
        },
        status: {
          allowed: "#10b981",
          allowedBg: "rgba(16, 185, 129, 0.12)",
          pending: "#f59e0b",
          pendingBg: "rgba(245, 158, 11, 0.12)",
          blocked: "#ef4444",
          blockedBg: "rgba(239, 68, 68, 0.12)",
          info: "#6366f1",
          infoBg: "rgba(99, 102, 241, 0.12)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(139, 92, 246, 0.3)",
        "glow-blue": "0 0 25px -5px rgba(59, 130, 246, 0.3)",
        "glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;

