import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-telefonica-sans)', 'system-ui', 'sans-serif'],
        telefonica: ['var(--font-telefonica-sans)', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        hairline: '100',
        thin: '200',
        light: '300',
        normal: '400',
        medium: '500',
        demibold: '600',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      colors: {
        telefonica: {
          blue: {
            DEFAULT: '#0066CC',
            dark: '#0052A3',
            light: '#0078D7',
          },
          gray: {
            50: '#F8F9FA',
            100: '#F2F4F6',
            200: '#E5E8EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          },
        },
      },
    },
  },
};

export default config;