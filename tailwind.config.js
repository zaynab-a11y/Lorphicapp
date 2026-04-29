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
        primary: '#0D9488',
        accent: '#F97316',
        background: '#FFFFFF',
        card: '#F0FDFA',
        border: '#CCFBF1',
        muted: '#64748B',
        foreground: '#0F172A',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 16px rgba(13,148,136,0.08)',
        'glow': '0 0 20px rgba(13,148,136,0.30)',
      },
    },
  },
  plugins: [],
}
