/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eva: {
          primary: '#0066ff',
          secondary: '#00ccff',
          accent: '#ff6b35',
          success: '#00ff88',
          warning: '#ffaa00',
          error: '#ff4444',
          dark: '#0a0a0a',
          light: '#f8fafc'
        }
      },
      fontFamily: {
        'eva': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-eva': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #0066ff' },
          '100%': { boxShadow: '0 0 20px #0066ff, 0 0 30px #0066ff' }
        }
      }
    },
  },
  plugins: [],
}