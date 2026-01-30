/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clean ocean theme - simplified palette
        ocean: {
          50: '#f0f7f9',
          100: '#daeef2',
          200: '#b8dde5',
          300: '#88c5d2',
          400: '#51a5b7',
          500: '#36899c',
          600: '#2f7084',
          700: '#2b5b6c',
          800: '#294c5a',
          900: '#0f1c22', // Main background - almost black with slight blue
          950: '#0a1216',
        },
        coral: {
          400: '#4ecdc4', // Primary accent - teal
          500: '#3eb8b0',
          600: '#2e948d',
        },
        mote: {
          400: '#ee7996', // Mote accent - soft coral pink
          500: '#e34d75',
        },
        fundemar: {
          400: '#5bb5d5', // Fundemar accent - soft blue
          500: '#3a9fc4',
        },
        gold: {
          400: '#f0c850', // Muted gold for accents
          500: '#d4a71a',
        },
        // Simplified surface colors
        surface: {
          DEFAULT: '#0f1c22',
          card: '#162229',
          lighter: '#1c2a32',
          hover: '#1a2830',
          border: '#243038',
        },
        text: {
          primary: '#e5ebed',
          secondary: '#8a9ba3',
          muted: '#7a8d96',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '8px',
        'xl': '10px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'DEFAULT': '0 1px 3px rgba(0, 0, 0, 0.4)',
        'md': '0 2px 6px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'stagger': 'fadeIn 0.3s ease-out',
        'stagger-1': 'staggerIn 0.4s ease-out both',
        'stagger-2': 'staggerIn 0.4s ease-out 0.1s both',
        'stagger-3': 'staggerIn 0.4s ease-out 0.2s both',
        'stagger-4': 'staggerIn 0.4s ease-out 0.3s both',
        'bounce-once': 'bounceOnce 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        staggerIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceOnce: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
