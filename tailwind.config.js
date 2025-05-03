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
        accent: {
          DEFAULT: "var(--accent)",
          20: "rgba(var(--accent-rgb), 0.2)",
          30: "rgba(var(--accent-rgb), 0.3)",
          50: "rgba(var(--accent-rgb), 0.5)",
        },
      },
      boxShadow: {
        "accent-glow": "0 0 20px var(--accent)",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      backgroundImage: {
        "dark-gradient": "linear-gradient(135deg, #000000 0%, #1F1F1F 100%)",
        "light-gradient": "linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)",
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-reverse': 'spin 2s linear infinite reverse',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};