/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#090a0f',
          surface: '#111319',
          subtle: '#171a23',
          elevated: '#1e222e',
        },
        border: {
          subtle: '#1c202c',
          DEFAULT: '#272c3d',
          strong: '#3b4259',
        },
        primary: {
          DEFAULT: '#e50914',
          hover: '#f41b26',
          active: '#b80710',
          subtle: 'rgba(229, 9, 20, 0.12)',
        },
        accent: {
          amber: '#f59e0b',
          emerald: '#10b981',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.6)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
}

