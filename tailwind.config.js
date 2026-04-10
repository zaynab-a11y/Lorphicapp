/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#14B8A6',
        accent: '#F97316',
        background: '#0F172A',
        card: '#1E293B',
        border: '#334155',
        muted: '#9CA3AF',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'glow': '0 0 20px rgba(20,184,166,0.15)',
      },
    },
  },
  plugins: [],
}
