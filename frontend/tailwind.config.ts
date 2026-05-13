import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand:  '#D85A30',
        best:   '#3B6D11',
        worst:  '#993C1D',
        surface: '#FFFFFF',
        page:   '#F5F5F5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        condensed: ['var(--font-barlow-condensed)', 'Impact', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
