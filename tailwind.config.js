export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        spotify: {
          base: '#121212',
          elevated: '#282828',
          highlight: '#1DB954',
          text: '#B3B3B3',
          subtle: '#181818',
          accent: '#1ed760',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
