/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#0a0a0a',
        'surface-elevated': '#111111',
        'surface-glass': 'rgba(17, 17, 17, 0.6)',
        border: 'rgba(255, 255, 255, 0.06)',
        'border-subtle': 'rgba(255, 255, 255, 0.03)',
        primary: {
          DEFAULT: '#4ade80',
          50: '#f0fdf4',
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
        accent: {
          DEFAULT: '#34d399',
          glow: 'rgba(52, 211, 153, 0.15)',
        },
        muted: {
          DEFAULT: '#737373',
          foreground: '#a3a3a3',
        },
        foreground: {
          DEFAULT: '#fafafa',
          muted: '#a3a3a3',
          subtle: '#525252',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(74, 222, 128, 0.15)',
        'glow': '0 0 20px rgba(74, 222, 128, 0.2)',
        'glow-lg': '0 0 40px rgba(74, 222, 128, 0.25)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.04)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(74, 222, 128, 0.1)',
      },
      backdropBlur: {
        glass: '20px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
