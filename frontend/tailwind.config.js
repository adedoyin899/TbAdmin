/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#14B8A6',
          light: '#2DD4BF',
          dark: '#0F766E',
          deep: '#0D5A55',
          subtle: 'rgba(45, 212, 191, 0.12)',
        },
        sunset: {
          DEFAULT: '#FA520F',
          deep: '#CC3A05',
          orange: '#FF8A00',
          light: '#FFA110',
          subtle: 'rgba(250, 82, 15, 0.12)',
        },
        sunshine: {
          DEFAULT: '#FFB83E',
          300: '#FFD06A',
          700: '#FFA110',
        },
        cream: {
          DEFAULT: '#FFF8E0',
          light: '#FFFAEB',
          subtle: '#FFFDF7',
          deep: '#E6D5A8',
        },
        obsidian: {
          DEFAULT: '#0B0E14',
          card: '#12161F',
          sub: '#19202C',
          line: '#242C3C',
        },
        navy: '#0D1F1E',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sora: ['Sora', 'system-ui', 'sans-serif'],
        geist: ['Geist', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '14px',
        xl: '16px',
        '2xl': '20px',
        lg: '12px',
        md: '8px',
        sm: '6px',
        xs: '4px',
      },
      transitionTimingFunction: {
        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(17, 32, 42, 0.05)',
        DEFAULT: '0 4px 20px rgba(17, 32, 42, 0.06)',
        lg: '0 20px 48px rgba(17, 32, 42, 0.12)',
        glow: '0 0 24px rgba(250, 82, 15, 0.18)',
        'glow-teal': '0 0 24px rgba(45, 212, 191, 0.18)',
        'dark-sm': '0 1px 3px rgba(0, 0, 0, 0.3)',
        dark: '0 8px 24px rgba(0, 0, 0, 0.45)',
        'dark-lg': '0 24px 64px rgba(0, 0, 0, 0.65)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
