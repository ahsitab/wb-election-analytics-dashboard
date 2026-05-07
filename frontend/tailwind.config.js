/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tmc: '#00B140', // Green
        bjp: '#FF9933', // Saffron
        cpim: '#DE2024', // Red
        inc: '#00BFFF', // Blue
        others: '#A0A0A0', // Gray
        background: '#0f172a', // slate-900
        panel: 'rgba(30, 41, 59, 0.7)', // slate-800 with opacity
      },
    },
  },
  plugins: [],
}
