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
        bg: {
          main: '#06070d',
          card: '#0d0f1a',
          cardHover: '#131726',
          input: '#090b14',
          border: 'rgba(0, 240, 255, 0.15)',
        },
        accent: {
          DEFAULT: '#00f0ff', // Cyber Electric Cyan / Neon Cyan
          hover: '#00c3ff',
          glow: 'rgba(0, 240, 255, 0.25)',
        },
        neon: {
          cyan: '#00f0ff',
          purple: '#d946ef',
          pink: '#ff007f',
          green: '#39ff14',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 25px rgba(0, 240, 255, 0.35)',
        'neon-purple': '0 0 25px rgba(217, 70, 239, 0.35)',
        'neon-pink': '0 0 25px rgba(255, 0, 127, 0.35)',
      }
    },
  },
  plugins: [],
}
