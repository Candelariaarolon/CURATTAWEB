import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cuero: {
          dark: "#6B4226",
          light: "#8B5A2B",
        },
        piedra: "#D8CFC0",
        hueso: "#E8E2D6",
        "blanco-roto": "#F5F1EA",
        carbon: "#1C1C1A",
        negro: "#17130f",
        "marron-oscuro": "#3b2b21",
        tierra: {
          DEFAULT: "#8a5a3b",
          light: "#b98a5f",
        },
        beige: "#d9c7ac",
        crema: "#f2e9da",
        blanco: "#fbf8f3",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "1px",
        md: "3px",
        lg: "4px",
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
      transitionTimingFunction: {
        DEFAULT: "ease",
      },
    },
  },
  plugins: [],
};

export default config;
