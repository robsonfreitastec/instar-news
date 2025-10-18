/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.jsx",
    "./resources/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        instar: {
          primary: '#ac182e',
          'primary-dark': '#8a1424',
          'primary-light': '#c51e36',
          secondary: '#1f2937',
          accent: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
}

