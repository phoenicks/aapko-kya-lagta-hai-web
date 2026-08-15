/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface-1)",
        page: "var(--page)",
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        up: "var(--up-color)",
        down: "var(--down-color)",
        chip: "var(--chip-bg)",
        grid: "var(--gridline)",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "22px",
        sheet: "22px 22px 0 0",
      },
      boxShadow: {
        card: "0 20px 45px rgba(11,11,11,0.16), 0 2px 8px rgba(11,11,11,0.08)",
      },
    },
  },
  plugins: [],
};
