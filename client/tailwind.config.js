/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slateBlue: {
          DEFAULT: '#6D8196',
          light: '#8598AB',
          dark: '#546679',
          50: '#F4F7F9',
          100: '#E4EBF0',
          200: '#C7D4E0',
          500: '#6D8196',
          600: '#5A6E82',
          700: '#485869',
        },
        charcoal: {
          DEFAULT: '#4A4A4A',
          light: '#616161',
          dark: '#303030',
          800: '#2A2A2A',
        },
        silverGrey: {
          DEFAULT: '#CBCBCB',
          light: '#E2E2E2',
          dark: '#AFAFAF',
        },
        warmIvory: {
          DEFAULT: '#FFFFE3',
          darker: '#F7F7D5',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(74, 74, 74, 0.05), 0 1px 2px 0 rgba(74, 74, 74, 0.03)',
        'card': '0 2px 8px -1px rgba(74, 74, 74, 0.08), 0 1px 4px -1px rgba(74, 74, 74, 0.04)',
        'dropdown': '0 10px 25px -5px rgba(74, 74, 74, 0.12), 0 8px 10px -6px rgba(74, 74, 74, 0.08)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
