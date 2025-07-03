/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'airbnb-red': '#FF385C',
        'airbnb-dark': '#222222',
        'airbnb-gray': '#717171',
        'airbnb-light-gray': '#F7F7F7',
      },
    },
  },
  plugins: [],
}