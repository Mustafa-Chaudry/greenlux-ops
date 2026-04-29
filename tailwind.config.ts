import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: "#0F3D2E",
          fresh: "#2E7D32",
          sage: "#D7E2D0",
          gold: "#C9A227",
          ivory: "#FAFAF5",
          charcoal: "#1F2933",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 61, 46, 0.12)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
