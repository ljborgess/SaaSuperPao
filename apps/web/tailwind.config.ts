import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF6F1',
          100: '#F0E8DC',
          200: '#E0D0BC',
          300: '#C9AD8E',
          400: '#B08B66',
          500: '#8B6342',
          600: '#6B4423',
          700: '#553619',
          800: '#3F2812',
          900: '#2C1810',
          950: '#1A0E08',
        },
        surface: {
          50: '#FDFBF8',
          100: '#F8F4EE',
          200: '#F0EBE3',
          300: '#E5DDD3',
          400: '#D4C9BA',
        },
        accent: {
          gold: '#C4A77D',
          cream: '#FFF8F0',
          wheat: '#E8D5B5',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgb(44 24 16 / 0.04), 0 1px 2px -1px rgb(44 24 16 / 0.04)',
        card: '0 1px 3px 0 rgb(44 24 16 / 0.06), 0 4px 12px -2px rgb(44 24 16 / 0.05)',
        elevated: '0 4px 6px -1px rgb(44 24 16 / 0.08), 0 10px 24px -4px rgb(44 24 16 / 0.1)',
        sidebar: '4px 0 24px -4px rgb(44 24 16 / 0.12)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-1deg)' },
          '50%': { transform: 'translateY(-16px) rotate(1deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
