/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#f8fafc',
          card: '#1e293b',
          dark: '#0f172a',
          darker: '#0b0f19',
          blue: '#2563eb',
          blueHover: '#1d4ed8',
          accent: '#3b82f6',
          border: '#334155',
          textMuted: '#94a3b8',
          red: '#ef4444',
          green: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
