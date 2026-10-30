/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        neo: "4px 4px 0px 0px rgba(0,0,0,1)",
        "neo-hover": "6px 6px 0px 0px rgba(0,0,0,1)",
        "neo-active": "2px 2px 0px 0px rgba(0,0,0,1)"
      },
      colors: {
        bgStart: "#facc15",  // yellow-400
        bgEnd: "#f9a8d4",    // pink-300
        primary: "#3b82f6",  // blue-500
        secondary: "#ec4899", // pink-500
      }
    },
  },
  plugins: [],
}
