/**** @type {import('tailwindcss').Config} ****/
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
        },
        secondary: {
          DEFAULT: '#8b5cf6',
        },
        bg: '#f8fafc',
      },
    },
  },
  plugins: [],
}
