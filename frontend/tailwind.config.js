/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#18181C',
        card:    '#232328',
        modal:   '#1E1E24',
        input:   '#141418',
        't1':    '#F0F0F2',
        't2':    '#9A9AA8',
        't3':    '#55555F',
        blue:    '#378ADD',
        green:   '#1D9E75',
        danger:  '#E24B4A',
      },
    },
  },
}