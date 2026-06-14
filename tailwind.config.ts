import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  safelist: [
    { pattern: /bg-(indigo|blue|amber|emerald|purple|red|pink|orange)-(50|100)/ },
    { pattern: /text-(indigo|blue|amber|emerald|purple|red|pink|orange)-(600|700)/ },
    { pattern: /border-(indigo|blue|amber|emerald|purple|red|pink|orange)-500/ }
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* ── TKN Brand Colors ─────────────────────────────── */
        tkn: {
          // Sunset palette (60% - dominant)
          gold:       "#F5A623", // hsl(38 95% 55%) — sunset top
          orange:     "#F97316", // hsl(25 95% 53%) — main orange
          deep:       "#E84E1B", // hsl(16 88% 48%) — deep sunset
          red:        "#C0330D", // hsl(8 82% 42%)  — sunset horizon
          // Navy palette (15% - support)
          navyLight:  "#3B6CB7", // hsl(214 50% 35%)
          navy:       "#1B3A6B", // hsl(214 60% 22%)
          navyDark:   "#122248", // hsl(218 65% 14%)
          navyDeeper: "#0C1730", // hsl(220 70% 10%)
          // Warm neutrals (25% - backgrounds)
          cream:      "#FFFAF5", // warm off-white
          sand:       "#FFF0E0", // light peach
          mist:       "#F5EDE0", // warm mist
        },
      },
      backgroundImage: {
        /* Sunset gradients */
        "sunset":         "linear-gradient(135deg, #F5A623 0%, #F97316 40%, #E84E1B 100%)",
        "sunset-soft":    "linear-gradient(135deg, #FFF0E0 0%, #FFD8A8 50%, #FFBF7A 100%)",
        "sunset-hero":    "linear-gradient(160deg, #122248 0%, #1B3A6B 30%, #E84E1B 70%, #F97316 100%)",
        "sunset-nav":     "linear-gradient(to right, #F97316, #EA580C)",
        /* Navy gradients */
        "navy":           "linear-gradient(135deg, #3B6CB7 0%, #122248 100%)",
        "navy-deep":      "linear-gradient(to bottom, #1B3A6B, #0C1730)",
      },
      boxShadow: {
        "sunset":    "0 4px 24px hsl(25 95% 53% / 0.25), 0 1px 6px hsl(25 95% 53% / 0.15)",
        "sunset-lg": "0 8px 40px hsl(25 95% 53% / 0.30), 0 2px 12px hsl(25 95% 53% / 0.20)",
        "navy":      "0 4px 24px hsl(214 60% 22% / 0.25), 0 1px 6px hsl(214 60% 22% / 0.15)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(25 95% 53% / 0.3)" },
          "50%":      { boxShadow: "0 0 40px hsl(25 95% 53% / 0.6)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "float":          "float 4s ease-in-out infinite",
        "glow-pulse":     "glow-pulse 2.5s ease-in-out infinite",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
