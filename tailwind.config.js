/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
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
    'text-white', 'text-pink-600', 'text-maroon',
    'hover:bg-pink-700', 'hover:bg-maroon-dark', 'hover:bg-amber-600',
  ],
  theme: {
    extend: {
      colors: {
        'maroon': '#BE123C',
        'maroon-light': '#E11D48',
        'maroon-dark': '#9F1239',
        'gold': '#FFD700',
        'gold-light': '#FFE55C',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'elevated': '0 4px 16px rgba(0,0,0,0.08)',
        'drawer': '4px 0 24px rgba(0,0,0,0.08)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
