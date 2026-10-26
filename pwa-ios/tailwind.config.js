/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: '#0B0F19',
          card: '#131B2E',
          surface: '#1A233A',
          gold: '#D4AF37',
          'gold-light': '#F3E5AB',
          accent: '#3B82F6',
          muted: '#94A3B8',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      backdropBlur: {
        ios: '25px',
      }
    },
  },
  plugins: [],
}
