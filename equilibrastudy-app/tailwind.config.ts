import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cian: { DEFAULT: '#00C8F5', text: '#003D4D', bg: '#D6F5FF' },
        amarillo: { DEFAULT: '#F5D800', text: '#6B5A00', bg: '#FFFACC' },
        verde: { DEFAULT: '#33D17A', text: '#074D22', bg: '#D6FFE9' },
        naranja: { DEFAULT: '#FF8040', text: '#6B2A00', bg: '#FFE9D6' },
        lavanda: { DEFAULT: '#9B59F5', text: '#3B0080', bg: '#EDE0FF' },
        rosa: { DEFAULT: '#F060A8', text: '#6B0040', bg: '#FFD6EE' },
        azul: { DEFAULT: '#4DA6FF', text: '#002B6B', bg: '#D6ECFF' },
      },
    },
  },
  plugins: [],
};

export default config;
