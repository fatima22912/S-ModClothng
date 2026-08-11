/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: '#E6197F',
          dark: '#A80F5C',
          light: '#FCE4F1',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Poppins"', 'sans-serif'],
      },
      keyframes: {
        'float-heart': {
          '0%': { transform: 'translateY(0) translateX(0) rotate(-8deg)', opacity: '0' },
          '10%': { opacity: '0.9' },
          '50%': { transform: 'translateY(-45vh) translateX(15px) rotate(8deg)' },
          '90%': { opacity: '0.7' },
          '100%': { transform: 'translateY(-85vh) translateX(-10px) rotate(-6deg)', opacity: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'float-heart': 'float-heart 7s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'pop-in': 'pop-in 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
