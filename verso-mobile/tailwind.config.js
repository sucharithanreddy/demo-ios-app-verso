/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0B',
        paper: '#FAFAF7',
        surface: '#FFFFFF',
        accent: '#FF5C28',
        accentDark: '#E04E1F',
        muted: '#71717A',
        mutedLight: '#A1A1AA',
        border: '#E4E4E7',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
};
