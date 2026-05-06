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
        primary: '#00CEC4',
        accent: '#F97316',
        background: '#FFFFFF',
        card: '#FFFFFF',
        border: '#E2E8F0',
        muted: '#64748B',
        foreground: '#0F172A',
        sidebar: '#111827',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 12px rgba(0,0,0,0.06)',
        'glow': '0 0 20px rgba(0,206,196,0.30)',
      },
    },
  },
  plugins: [],
}
