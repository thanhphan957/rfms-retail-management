/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f4f7fb",
          100: "#e8eef6",
          500: "#1d4ed8",
          600: "#1e3a8a",
          700: "#172554",
          900: "#0b1220",
        },
        accent: {
          500: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};
