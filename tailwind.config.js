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
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 
          '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 
          '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"SF Mono"', 'Monaco', 'Menlo', 'monospace'],
      },
      colors: {
        'ios-blue': '#007AFF',
        'ios-green': '#34C759',
        'ios-red': '#FF3B30',
        'ios-orange': '#FF9500',
        'ios-purple': '#AF52DE',
        'ios-pink': '#FF2D55',
        'ios-yellow': '#FFCC00',
        'ios-gray': {
          1: '#8E8E93',
          2: '#636366',
          3: '#48484A',
          4: '#3A3A3C',
          5: '#2C2C2E',
          6: '#1C1C1E',
        },
        'ios-bg': {
          primary: '#1C1C1E',
          secondary: '#000000',
          tertiary: '#2C2C2E',
        },
        'ios-text': {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.6)',
          tertiary: 'rgba(255, 255, 255, 0.4)',
        },
      },
      borderRadius: {
        'ios': '20px',
        'ios-lg': '28px',
        'ios-xl': '32px',
      },
      boxShadow: {
        'ios': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'ios-lg': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'ios-card': '0 1px 3px rgba(0, 0, 0, 0.2)',
      },
      spacing: {
        'ios': '16px',
        'ios-lg': '20px',
      },
    },
  },
  plugins: [],
}

