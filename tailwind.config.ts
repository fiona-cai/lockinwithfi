import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)'],
        serif: ['var(--font-dm-serif-display)'],
      },
      colors: {
        'sage': {
          100: '#E2EFE2',
          200: '#7C9070',
          300: '#5F6F58',
        }
      },
      backgroundImage: {
        'gradient-custom': 'radial-gradient(circle at center, #E2EFE2, #FFFFFF)',
      }
    },
  },
  plugins: [],
}
export default config 