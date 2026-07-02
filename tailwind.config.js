/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0c0a1e",
      },
      boxShadow: {
        glow: "0 0 40px rgba(124,58,237,0.35)",
      },
    },
  },
  plugins: [],
};
