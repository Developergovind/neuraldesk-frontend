/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#030308',
          900: '#080810',
          800: '#0d0d1a',
          700: '#111125',
          600: '#16162e',
          500: '#1e1e3a',
        },
        cyan: {
          400: '#22d3ee',
          DEFAULT: '#00d4ff',
          600: '#0891b2',
        },
        violet: {
          DEFAULT: '#7c3aed',
          400: '#a78bfa',
          600: '#6d28d9',
        },
        glass: 'rgba(255,255,255,0.04)',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'obsidian-gradient': 'linear-gradient(135deg, #080810 0%, #0d0d1a 50%, #111125 100%)',
        'cyan-glow': 'radial-gradient(circle at 50% 50%, rgba(0,212,255,0.15) 0%, transparent 70%)',
        'violet-glow': 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 70%)',
      },
      backdropBlur: {
        glass: '24px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-cyan': '0 0 40px rgba(0,212,255,0.3)',
        'glow-violet': '0 0 40px rgba(124,58,237,0.3)',
        card: '0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'bounce-dot': 'bounce-dot 1.2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
