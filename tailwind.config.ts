import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "monospace",
        ],
      },
      colors: {
        // Existing semantic shadcn tokens, kept so the app dashboard / portal /
        // auth surfaces continue to compile without changes.
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
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

        // Velo marketing tokens — precision-craft dark palette.
        // Dark canvas with one quiet blue accent and reserved status colors.
        canvas: "#0A0A0A",
        surface: "#111111",
        raised: "#1A1A1A",
        line: "#2A2A2A",
        "line-2": "#333333",
        ink: {
          DEFAULT: "#FAFAFA",
          2: "#A0A0A0",
          3: "#555555",
        },
        velo: {
          bg: "#0A0A0A",
          surface: "#111111",
          "surface-2": "#1A1A1A",
          border: "#2A2A2A",
          "border-light": "#333333",
          text: "#FAFAFA",
          "text-2": "#A0A0A0",
          "text-3": "#555555",
          accent: "#4F7EF7",
          "accent-dark": "#3B6AE8",
          green: "#22C55E",
          amber: "#F59E0B",
          red: "#EF4444",
        },
        ok: "#22C55E",
        warn: "#F59E0B",
        err: "#EF4444",
        hot: "#4F7EF7",
      },
      boxShadow: {
        brut: "4px 4px 0 0 #000000",
        "brut-sm": "2px 2px 0 0 #000000",
        "brut-lg": "8px 8px 0 0 #000000",
        "brut-white": "4px 4px 0 0 #FFFFFF",
        "brut-grey": "4px 4px 0 0 #737373",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
