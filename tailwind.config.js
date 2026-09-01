/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#05060B',
          900: '#05060B',
          800: '#090B15',
          700: '#0D1020',
          600: '#12162B',
        },
        panel: 'rgba(16, 20, 40, 0.55)',
        edge: {
          DEFAULT: '#8B5CF6',
          blue: '#3B82F6',
          cyan: '#22D3EE',
        },
        ink: {
          DEFAULT: '#E7ECFC',
          muted: '#8891B0',
          faint: '#5B6389',
        },
        win: '#22E3A6',
        loss: '#FF5D6C',
        pending: '#FFB84D',
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(59, 130, 246, 0.35)',
        'glow-purple': '0 0 24px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
      },
      backgroundImage: {
        hud: 'radial-gradient(circle at 15% 0%, rgba(59,130,246,0.14), transparent 40%), radial-gradient(circle at 85% 20%, rgba(139,92,246,0.14), transparent 45%)',
        'grid-lines':
          'linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '36px 36px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
