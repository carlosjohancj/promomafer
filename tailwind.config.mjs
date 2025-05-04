/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        math: {
          light: '#FEF9C3',
          DEFAULT: '#FACC15',
          dark: '#CA8A04',
        },
        spanish: {
          light: '#D1FAE5',
          DEFAULT: '#10B981',
          dark: '#047857',
        },
        english: {
          light: '#FEE2E2',
          DEFAULT: '#EF4444',
          dark: '#B91C1C',
        },
        tech: {
          light: '#DBEAFE',
          DEFAULT: '#3B82F6',
          dark: '#1D4ED8',
        },
        history: {
          light: '#FFEDD5',
          DEFAULT: '#F97316',
          dark: '#C2410C',
        },
        cognitive: {
          light: '#F3E8FF',
          DEFAULT: '#A855F7',
          dark: '#7E22CE',
        },
        extras: {
          light: '#FCE7F3',
          DEFAULT: '#EC4899',
          dark: '#BE185D',
        },
      },
      fontFamily: {
        display: ['Comic Neue', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};