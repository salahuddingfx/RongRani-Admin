/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Category colors - prevent purging dynamic classes
    'bg-pink-600', 'bg-pink-500', 'bg-pink-400',
    'bg-maroon', 'bg-maroon-light', 'bg-maroon-dark',
    'bg-amber-500', 'bg-amber-600', 'bg-yellow-500',
    'bg-red-500', 'bg-red-600', 'bg-red-700',
    'bg-purple-500', 'bg-purple-600', 'bg-purple-700',
    'bg-blue-500', 'bg-blue-600', 'bg-blue-700',
    'bg-green-500', 'bg-green-600', 'bg-emerald', 'bg-emerald-500',
    'bg-emerald-600',
    'bg-teal-500', 'bg-teal-600', 'bg-teal-700',
    'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700',
    'bg-rose-500', 'bg-rose-600',
    'bg-slate-600', 'bg-slate-700',
    'bg-pink-700',
    'bg-amber-400', 'bg-amber-700', 'bg-amber-800',
    'bg-blue-800',
    'bg-purple-800',
    'bg-orange-500', 'bg-orange-600', 'bg-gold',
    // Text colors
    'text-white', 'text-pink-600', 'text-maroon',
    // Hover states
    'hover:bg-pink-700', 'hover:bg-maroon-dark', 'hover:bg-amber-600',
  ],
  theme: {
    extend: {
      colors: {
        'cream': '#FFE4E6',
        'cream-light': '#FFF1F2',
        'cream-dark': '#FECDD3',
        'maroon': '#BE123C',
        'maroon-light': '#E11D48',
        'maroon-dark': '#9F1239',
        'gold': '#FFD700',
        'gold-light': '#FFE55C',
        'rose': '#FF69B4',
        'rose-light': '#FFB6C1',
        // Removed emerald, amber, purple, pink etc. to use Tailwind defaults
        'charcoal': '#1F2937',
        'charcoal-light': '#374151',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'slide-in-left': 'slideInFromLeft 0.8s ease-out',
        'slide-in-right': 'slideInFromRight 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'glow-pulse': 'pulse-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        slideInFromLeft: {
          'from': { transform: 'translateX(-100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
          'from': { transform: 'translateX(100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeInUp: {
          'from': { transform: 'translateY(30px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          'from': { transform: 'scale(0.8)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          'from': { 'box-shadow': '0 0 20px rgba(128, 0, 0, 0.3)' },
          'to': { 'box-shadow': '0 0 30px rgba(128, 0, 0, 0.6), 0 0 40px rgba(128, 0, 0, 0.3)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(128, 0, 0, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(128, 0, 0, 0.1)',
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 25px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 40px rgba(0, 0, 0, 0.16)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}