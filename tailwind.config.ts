import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#F6F8FB",
        card: "#FFFFFF",
        navy: {
          50: "#EAF0F7",
          400: "#2E5A87",
          600: "#123761",
          700: "#0B2545",
          900: "#071A33",
        },
        techblue: {
          400: "#4A93E0",
          500: "#1B6FC9",
          600: "#155CA6",
        },
        gold: {
          400: "#DDBB55",
          500: "#C9A227",
          600: "#A8871F",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-plex-sans)", "sans-serif"],
      },
      backgroundImage: {
        "blueprint-grid":
          "linear-gradient(rgba(11,37,69,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(11,37,69,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
    },
  },
  plugins: [],
};

export default config;
