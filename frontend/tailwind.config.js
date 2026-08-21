/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        teal: '#2DD4BF',
        'teal-dark': '#0F766E',
        navy: '#0D1F1E',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        geist: ['Geist', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '16px',
        sm: '10px',
        xs: '7px',
      },
      transitionTimingFunction: {
        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(17, 32, 42, 0.06)',
        DEFAULT: '0 4px 16px rgba(17, 32, 42, 0.08)',
        lg: '0 24px 60px rgba(17, 32, 42, 0.16)',
        'dark-sm': '0 1px 3px rgba(0,0,0,0.3)',
        dark: '0 6px 22px rgba(0,0,0,0.4)',
        'dark-lg': '0 30px 70px rgba(0,0,0,0.55)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.2s ease',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
