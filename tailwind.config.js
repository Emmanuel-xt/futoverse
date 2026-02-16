/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      clipPath: {
        "diagonal-cut": "polygon(0 0, 100% 0, 90% 100%, 10% 100%)",
      },
      colors: {
        primary: "#2D75FB",
        "secondary-500": "#FFB620",
        // "primary-500": "#FFB620",
        "light-1": "#FFFFFF",
        "light-2": "#FAFAFA",
        "light-3": "#D9D9D9",
        "light-4": "#5C5C7B",
        "gray-1": "#697C89",
        glassmorphism: "rgba(16, 16, 18, 0.60)",
        glassmorp: "rgba(16, 16, 18, 0.60)",
      },
      boxShadow: {
        "count-badge": "0px 0px 6px 2px rgba(219, 188, 159, 0.30)",
        "groups-sidebar": "-30px 0px 60px 0px rgba(28, 28, 31, 0.50)",
      },
      screens: {
        xs: "400px",
      },
      fontSize: {
        "heading-lg": ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
        "heading-md": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        "heading-sm": ["1rem", { lineHeight: "1.5rem", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};
