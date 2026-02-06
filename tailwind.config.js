/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Chilean-inspired dark mode palette
        'chile-bg': {
          primary: '#0f0f14',
          secondary: '#1a1a24',
          card: '#242432',
        },
        'chile-accent': {
          red: '#e63946',      // Chilean flag red
          teal: '#2a9d8f',     // Ocean/nature
          gold: '#e9c46a',     // Desert/events
          purple: '#9b5de5',   // Mountains at dusk
        },
        'chile-text': {
          primary: '#f1f1f1',
          secondary: '#a0a0b0',
          muted: '#6b6b7b',
        },
        // Category colors
        'cat': {
          restaurant: '#ff6b6b',
          hiking: '#4ecdc4',
          event: '#ffe66d',
          museum: '#95e1d3',
          nature: '#38b000',
          unique: '#ff9f1c',
          art: '#c77dff',
          hotspring: '#ff8fab',
          beach: '#00b4d8',
          winery: '#9d4edd',
          historical: '#d4a373',
          viewpoint: '#ffd60a',
          shopping: '#f72585',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
