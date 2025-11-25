import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        yale_blue: {
          DEFAULT: '#083d77',
          50: '#e6f0ff',
          100: '#b7d8fa',
          200: '#70b0f5',
          300: '#2889f0',
          400: '#0d63bf',
          500: '#083d77',
          600: '#07325f',
          700: '#052548',
          800: '#031930',
          900: '#020c18',
        },
        beige: {
          DEFAULT: '#ebebd3',
          50: '#fbfbf6',
          100: '#f7f7ed',
          200: '#f2f2e4',
          300: '#eeeedb',
          400: '#ebebd3',
          500: '#cece95',
          600: '#b2b258',
          700: '#7a7a38',
          800: '#3d3d1c',
          900: '#2a2a14',
        },
        naples_yellow: {
          DEFAULT: '#f4d35e',
          50: '#fdf6df',
          100: '#faedbe',
          200: '#f8e59e',
          300: '#f6dc7d',
          400: '#f4d35e',
          500: '#efc21e',
          600: '#bd970d',
          700: '#7e6509',
          800: '#3f3204',
          900: '#2a2102',
        },
        sandy_brown: {
          DEFAULT: '#ee964b',
          50: '#fceadb',
          100: '#f8d5b6',
          200: '#f5c092',
          300: '#f1ab6d',
          400: '#ee964b',
          500: '#e47615',
          600: '#ab5810',
          700: '#723b0b',
          800: '#391d05',
          900: '#251303',
        },
        tomato: {
          DEFAULT: '#f95738',
          50: '#feded7',
          100: '#fdbdb0',
          200: '#fb9b88',
          300: '#fa7a61',
          400: '#f95738',
          500: '#ed2e07',
          600: '#b22206',
          700: '#771704',
          800: '#3b0b02',
          900: '#250701',
        },
        // shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

