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
        display: ['"DM Sans"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        surface: {
          DEFAULT: '#0a0a0a',
          50:  '#0f0f0f',
          100: '#141414',
          200: '#1a1a1a',
          300: '#242424',
          400: '#2e2e2e',
          500: '#3a3a3a',
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'float':     'float 6s ease-in-out infinite',
        'pulse-slow':'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':  'slideUp 0.5s ease-out',
        'fade-in':   'fadeIn 0.4s ease-out',
        'shimmer':   'shimmer 2s linear infinite',
      },
      keyframes: {
        float:    { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        slideUp:  { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      }
    }
  },
  plugins: [],
}