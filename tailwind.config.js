/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#f6f1e8",
        night: {
          900: "#0c0a08",
          800: "#14110e",
          700: "#1c1814",
          600: "#2a241c",
        },
        gold: {
          300: "#ffe38a",
          400: "#ffd54a",
          500: "#f5c518",
          600: "#e0b000",
        },
      },
      boxShadow: {
        card: "0 20px 50px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
