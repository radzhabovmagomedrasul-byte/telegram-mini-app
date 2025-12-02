/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        'dash-bg': '#030314',
        'dash-surface': '#0b0f1f',
        'dash-surface-muted': '#161b2e',
        'dash-border': 'rgba(255,255,255,0.08)',
        'dash-text-muted': 'rgba(255,255,255,0.6)',
        'dash-accent': '#8b5cf6',
        'dash-positive': '#1be8b6',
        'dash-negative': '#ff6b8b',
        'dash-warning': '#ffd86f',
      },
      boxShadow: {
        'dash-neon': '0 25px 60px rgba(0,0,0,0.55)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.5rem',
        pill: '999px',
      },
      letterSpacing: {
        mega: '0.4em',
      },
    },
  },
  plugins: [],
}

