/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        study: {
          navy: '#17243A',
          'navy-dark': '#0F172A',
          'navy-light': '#24344D',
          ivory: '#F5F3EF',
          'ivory-dark': '#EBE8E1',
          surface: '#FFFFFF',
          slate: '#64748B',
          'slate-light': '#94A3B8',
          'slate-dark': '#334155',
          sage: '#B9C9B8',
          'sage-dark': '#4A6B56',
          'sage-light': '#E9EFE9',
          amber: '#D8A66A',
          'amber-dark': '#B45309',
          'amber-light': '#FDF3E7',
          border: '#E5E1DA',
          'border-dark': '#D5D0C5'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
