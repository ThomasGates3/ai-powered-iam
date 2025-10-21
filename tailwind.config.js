/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyan: {
          50: '#f0fffd',
          100: '#d0fffb',
          200: '#a1fff9',
          300: '#52ffba',
          400: '#00f0a0',
          500: '#00c98d',
          600: '#009b73',
          700: '#007056',
          800: '#004d3a',
          900: '#002820',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 240, 160, 0.3)',
        'cyan-glow-lg': '0 0 40px rgba(0, 240, 160, 0.4)',
      },
    },
  },
  plugins: [],
};
