/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        brand: '#1A3A2A',
        paper: '#FDFAF4',
        cream: '#F4F0E8',
        body: '#2C2418',
        muted: '#9A8F7A',
        divider: '#D8CEB8',
        sage: '#A8D4BA',
        mid: '#6BA88A',
        dim: '#4A7A62',
        faint: '#2E5A42',
        chip: '#E6EDE8',
      },
    },
  },
  plugins: [],
}
