import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config = {
  darkMode: "class",

  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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

        "enc-red": {
          DEFAULT: "hsl(var(--enc-red))",
          light: "hsl(var(--enc-red-light))",
          foreground: "hsl(var(--enc-red-foreground))",
        },
        "enc-orange": {
          DEFAULT: "hsl(var(--enc-orange))",
          light: "hsl(var(--enc-orange-light))",
          foreground: "hsl(var(--enc-orange-foreground))",
        },
        "enc-yellow": {
          DEFAULT: "hsl(var(--enc-yellow))",
          light: "hsl(var(--enc-yellow-light))",
          foreground: "hsl(var(--enc-yellow-foreground))",
        },
        "enc-coral": {
          DEFAULT: "hsl(var(--enc-coral))",
          light: "hsl(var(--enc-coral-light))",
        },
        "enc-text": {
          primary: "hsl(var(--enc-text-primary))",
          secondary: "hsl(var(--enc-text-secondary))",
        },

        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground":
            "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground":
            "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-warm": "var(--gradient-warm)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-text": "var(--gradient-text)",
        "gradient-text-alt": "var(--gradient-text-alt)",
      },

      boxShadow: {
        glow: "var(--shadow-glow)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: { height: "0" },
        },
        "gradient-shift": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow:
              "0 0 20px hsl(var(--enc-orange) / 0.3)",
          },
          "50%": {
            boxShadow:
              "0 0 40px hsl(var(--enc-orange) / 0.6)",
          },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-shift":
          "gradient-shift 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow":
          "pulse-glow 2s ease-in-out infinite",
      },
    },
  },

  plugins: [tailwindAnimate],
} satisfies Config;

export default config;
