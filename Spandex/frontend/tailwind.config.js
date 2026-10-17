/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        paytm: {
          blue: "#00BAF2",
          dark: "#002E6E",
          light: "#F5F7FA",
          navy: "#002970",
          accent: "#00B9F1",
          gold: "#F5A623",
          green: "#21C179",
          red: "#FF4D4F"
        }
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.2)',
      }
    },
  },
  plugins: [],
}
