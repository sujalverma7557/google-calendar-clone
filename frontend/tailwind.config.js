/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1a73e8',
          gray: '#5f6368',
          'gray-light': '#f8f9fa',
          'gray-border': '#dadce0',
        },
      },
    },
  },
  plugins: [],
}

