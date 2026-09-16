/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FFFDF9',
          100: '#FFFBF5',
          200: '#FAF8F2',
          300: '#F4EFE6',
        },
        paper: '#FAF9FE',
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        amberGold: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          subtle: '#FEF3C7',
          dark: '#B45309',
        },
        pastel: {
          lavender: '#E9D5FF',
          lavenderLight: '#F5EDFF',
          peach: '#FDA4AF',
          peachLight: '#FFF1F2',
          mint: '#A7F3D0',
          mintLight: '#ECFDF5',
          sky: '#A5F3FC',
          skyLight: '#ECFEFF',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
      boxShadow: {
        'soft-card': '0 4px 24px -2px rgba(109, 40, 217, 0.06), 0 2px 8px -1px rgba(0, 0, 0, 0.03)',
        'float-pill': '0 8px 30px rgba(124, 58, 237, 0.12)',
        'amber-glow': '0 4px 20px rgba(245, 158, 11, 0.18)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'spin-slow': 'spin 18s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
