/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16241F',
        paper: '#F4F6F2',
        card: '#FFFFFF',
        border: '#DDE3DC',
        muted: '#6B7A72',
        brand: {
          DEFAULT: '#1F5C4D',
          light: '#2D7A66',
          dark: '#143F35',
        },
        income: '#2F9E5B',
        expense: '#C1483B',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(22, 36, 31, 0.04), 0 1px 12px -2px rgba(22, 36, 31, 0.06)',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};
