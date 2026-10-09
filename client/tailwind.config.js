/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F1FAF4',
          100: '#E4F6EA',
          200: '#CDE9D6',
          300: '#A7F3D0',
          400: '#34D399',
          500: '#12A66A',
          600: '#00966B',
          700: '#008F5A',
          800: '#007A56',
          900: '#006B43',
          950: '#034D35',
        },
        sidebar: {
          dark: '#034D35',
          light: '#006B43',
          hover: '#007A56',
          active: '#00966B',
        },
        status: {
          lowStockBg: '#FEF3C7',
          lowStockText: '#D97706',
          lowStockBorder: '#FDE68A',
          outOfStockBg: '#FEE2E2',
          outOfStockText: '#DC2626',
          outOfStockBorder: '#FECACA',
          inStockBg: '#E8F8EE',
          inStockText: '#007A56',
          inStockBorder: '#CDE9D6',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 16px -4px rgba(0, 150, 107, 0.10), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'emerald': '0 4px 14px 0 rgba(0, 150, 107, 0.25)',
      }
    },
  },
  plugins: [],
}
