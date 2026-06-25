/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbeb',
          100: '#fbf7c7',
          200: '#f7ee8f',
          300: '#f1dd4f',
          400: '#eac520',
          500: '#d4af37', // Luxury Metallic Gold
          600: '#b48d27',
          700: '#906a1c',
          800: '#75541a',
          900: '#634518',
          950: '#3a250b',
        },
        charcoal: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#d9dadf',
          300: '#b8bac4',
          400: '#9093a3',
          500: '#717487',
          600: '#5a5c6d',
          700: '#4a4b59',
          800: '#3f404b',
          900: '#18181c', // Premium Dark background
          950: '#0f0f12',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
