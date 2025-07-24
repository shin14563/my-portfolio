/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#005f73',
          secondary: '#0a9396',
          background: '#f0f2f5',
          surface: '#ffffff',
          text: '#001219',
        },
      },
    },
  },
  plugins: [],
}