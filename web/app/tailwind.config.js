/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Hubify warm editorial
        sand: {
          50:  '#f7f4ef',
          100: '#f0ebe3',
          200: '#ddd8ce',
          300: '#c8c0b4',
          400: '#a89e90',
          500: '#857870',
        },
        ink: {
          900: '#1c1a17',
          800: '#2a2724',
          700: '#3a3530',
          600: '#4e4842',
        },
        // VERITY accent — deep prussian blue (truth, intelligence)
        verity: {
          50:  '#eef3fb',
          100: '#d5e3f5',
          200: '#a8c5ea',
          300: '#6d9dd6',
          400: '#3a75bf',
          500: '#1e56a0',
          600: '#163f7a',
          700: '#102d58',
          800: '#0b1e3a',
          900: '#07121f',
        },
        // Score colors
        score: {
          high:   '#1a7a4a',
          mid:    '#b85c0a',
          low:    '#a01e1e',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'scan':       'scan 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
