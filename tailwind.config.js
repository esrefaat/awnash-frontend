/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'arabic': ['Cairo', 'Noto Kufi Arabic', 'sans-serif'],
      },
      colors: {
        // Awnash Design System Colors
        awnash: {
          primary: '#FFCC00',          // Caterpillar Yellow
          'primary-hover': '#E6B800',
          'primary-light': '#FFF8CC',
          'primary-dark': '#CC9900',
          
          accent: '#0073E6',           // Blueprint Blue
          'accent-hover': '#005BB5',
          'accent-light': '#E6F3FF',
          'accent-dark': '#004C99',
          
          secondary: '#000000',        // Black
          'secondary-hover': '#1F1F1F',
          'secondary-light': '#3F3F3F',
          'secondary-lighter': '#6B6B6B',
        },
        // Keep standard Tailwind grays for dark mode
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  // Add RTL support
  corePlugins: {
    direction: true,
  }
}