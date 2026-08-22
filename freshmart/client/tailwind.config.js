/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#070b0a',
          50: '#0f1512',
          100: '#0c120f',
          200: '#0a0f0d',
          300: '#0d1411',
          400: '#111a16',
        },
        leaf: {
          50: '#eafff4',
          100: '#c9ffe4',
          200: '#94ffcd',
          300: '#52f7ae',
          400: '#22e88e',
          500: '#00d46a',
          600: '#00a854',
          700: '#048446',
          800: '#0a6839',
          900: '#0c5530',
          950: '#052e1a',
        },
        mint: {
          DEFAULT: '#00f5a0',
          soft: '#6ef5c4',
          pale: '#b8ffe2',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(0, 212, 106, 0.45)',
        card: '0 8px 30px -12px rgba(0, 0, 0, 0.55)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.55 },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}