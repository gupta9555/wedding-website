/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FBF6EE",
        ink: "#2B1B22",
        primary: {
          50: "#fdf2f5",
          100: "#fbe2e9",
          200: "#f3b9cb",
          300: "#e888a8",
          400: "#d15075",
          500: "#a8244d",
          600: "#8a1c40",
          700: "#7A1F3D",
          800: "#5c1730",
          900: "#3d0f20",
        },
        marigold: {
          50: "#fdf8ea",
          100: "#faedc4",
          200: "#f3d883",
          300: "#eabf4a",
          400: "#E0A72E",
          500: "#c68d1f",
          600: "#9e6f18",
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        sans: ["'Manrope'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px -2px rgba(122, 31, 61, 0.12), 0 8px 24px -8px rgba(122, 31, 61, 0.15)",
      },
    },
  },
  plugins: [],
}

