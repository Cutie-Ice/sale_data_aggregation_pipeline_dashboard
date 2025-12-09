/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1d26', // Dark gray/blue for background
        surface: '#242936',    // Slightly lighter for cards
        primary: '#3b82f6',    // Blue
        secondary: '#10b981',  // Green (Teal-ish)
        accent: '#8b5cf6',     // Purple
        text: '#e2e8f0',       // Light gray for text
        muted: '#94a3b8',      // Muted text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
