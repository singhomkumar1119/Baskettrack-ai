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
        court: {
          navy: '#070b14',
          card: '#0d1527',
          surface: '#121c33',
          border: '#1e293b',
          muted: '#64748b',
          orange: '#f97316',
          orangeGlow: '#ea580c',
          amber: '#f59e0b',
          accent: '#ff5500',
          make: '#22c55e',
          miss: '#ef4444',
          movement: '#3b82f6',
          ball: '#a855f7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(249, 115, 22, 0.35)',
        'glow-green': '0 0 25px -5px rgba(34, 197, 94, 0.35)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.35)',
        'glow-purple': '0 0 25px -5px rgba(168, 85, 247, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
