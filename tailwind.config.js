/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#090a0f",
        surface: {
          1: "#12141c",
          2: "#1a1d29",
          3: "#232738",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.08)",
          DEFAULT: "#262a3b",
          light: "#3a4058",
        },
        brand: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          accent: "#60a5fa",
        },
        text: {
          primary: "#ffffff",
          secondary: "#9ba3b8",
          muted: "#646b7e",
          hint: "#474d5d",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
