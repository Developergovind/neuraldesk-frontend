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
        // Base dark tones anchored at #2C2B30 (Dark Charcoal)
        obsidian: {
          950: '#2C2B30', // Base #2C2B30
          900: '#232227',
          800: '#2C2B30',
          700: '#38373d',
          600: '#434248',
          500: '#4F4F51', // Palette Muted Slate Gray
          400: '#6c6b70',
        },
        charcoal: {
          950: '#2C2B30',
          900: '#232227',
          DEFAULT: '#2C2B30',
          800: '#2C2B30',
          700: '#38373d',
          600: '#434248',
          500: '#4F4F51',
          400: '#6c6b70',
        },
        // Core Silver tone #D6D6D6
        silver: {
          light: '#f5f5f5',
          DEFAULT: '#D6D6D6',
          300: '#e5e5e5',
          400: '#D6D6D6',
          500: '#bfbfbf',
          600: '#9e9e9e',
        },
        // Primary Radiant Accent #F58F7C (Coral Salmon)
        coral: {
          300: '#fca595',
          400: '#F58F7C', // Palette Coral
          DEFAULT: '#F58F7C',
          500: '#e87762',
          600: '#d45c47',
          700: '#ba4834',
        },
        // Secondary Soft Accent #F2C4CE (Blush Rose)
        blush: {
          200: '#fdedf0',
          300: '#fae0e5',
          400: '#F2C4CE', // Palette Blush Rose
          DEFAULT: '#F2C4CE',
          500: '#e5aab6',
          600: '#d18f9d',
          700: '#b87483',
        },
        // Remap legacy cyan/violet so existing classes instantly inherit the new palette
        cyan: {
          300: '#fca595',
          400: '#F58F7C', // Mapped to Palette Coral
          DEFAULT: '#F58F7C',
          500: '#e87762',
          600: '#d45c47',
        },
        violet: {
          300: '#fae0e5',
          400: '#F2C4CE', // Mapped to Palette Blush
          DEFAULT: '#F2C4CE',
          500: '#e5aab6',
          600: '#d18f9d',
        },
        glass: 'rgba(214, 214, 214, 0.03)',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'obsidian-gradient': 'linear-gradient(135deg, #232227 0%, #2C2B30 50%, #38373d 100%)',
        'coral-glow': 'radial-gradient(circle at 50% 50%, rgba(245,143,124,0.12) 0%, transparent 70%)',
        'blush-glow': 'radial-gradient(circle at 50% 50%, rgba(242,196,206,0.10) 0%, transparent 70%)',
        'cyan-glow': 'radial-gradient(circle at 50% 50%, rgba(245,143,124,0.12) 0%, transparent 70%)',
        'violet-glow': 'radial-gradient(circle at 50% 50%, rgba(242,196,206,0.10) 0%, transparent 70%)',
      },
      backdropBlur: {
        glass: '24px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(214,214,214,0.08)',
        'glow-coral': '0 0 40px rgba(245,143,124,0.35)',
        'glow-blush': '0 0 40px rgba(242,196,206,0.3)',
        'glow-cyan': '0 0 40px rgba(245,143,124,0.35)',
        'glow-violet': '0 0 40px rgba(242,196,206,0.3)',
        card: '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(214,214,214,0.06)',
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
