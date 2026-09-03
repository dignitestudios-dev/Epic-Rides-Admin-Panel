/** @type {import('tailwindcss').Config} */

// Every color resolves to a CSS custom property defined in src/App.css.
// `<alpha-value>` keeps opacity modifiers (bg-surface/50) working.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const scale = (prefix) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => [
      step,
      token(`${prefix}-${step}`),
    ])
  );

const neutralScale = {
  0: token("neutral-0"),
  25: token("neutral-25"),
  ...scale("neutral"),
};

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // --- Brand -------------------------------------------------------
        brand: scale("brand"),
        accent: scale("accent"),

        // Aliases kept so the existing pages compile untouched.
        // primary === brand (Epic Rides green), secondary === accent (yellow).
        primary: scale("brand"),
        secondary: scale("accent"),

        // --- Neutrals ----------------------------------------------------
        neutral: neutralScale,
        // Tailwind's default `gray-*` is remapped onto the same absolute
        // scale, so pages still using `bg-gray-50 dark:bg-gray-900` pick up
        // the new warm neutral automatically.
        gray: neutralScale,

        // --- Semantic surfaces -------------------------------------------
        canvas: token("canvas"),
        surface: {
          DEFAULT: token("surface"),
          raised: token("surface-raised"),
          sunken: token("surface-sunken"),
          hover: token("surface-hover"),
          active: token("surface-active"),
        },

        // --- Lines --------------------------------------------------------
        line: {
          DEFAULT: token("line"),
          strong: token("line-strong"),
          subtle: token("line-subtle"),
        },

        // --- Ink ----------------------------------------------------------
        ink: {
          DEFAULT: token("ink"),
          muted: token("ink-muted"),
          subtle: token("ink-subtle"),
          faint: token("ink-faint"),
          inverted: token("ink-inverted"),
        },

        // --- Interactive ---------------------------------------------------
        interactive: {
          DEFAULT: token("interactive"),
          hover: token("interactive-hover"),
          active: token("interactive-active"),
          ink: token("interactive-ink"),
          subtle: token("interactive-subtle"),
          "subtle-ink": token("interactive-subtle-ink"),
        },

        // --- Status --------------------------------------------------------
        success: {
          DEFAULT: token("success"),
          fg: token("success-fg"),
          bg: token("success-bg"),
          border: token("success-border"),
        },
        warning: {
          DEFAULT: token("warning"),
          fg: token("warning-fg"),
          bg: token("warning-bg"),
          border: token("warning-border"),
        },
        danger: {
          DEFAULT: token("danger"),
          fg: token("danger-fg"),
          bg: token("danger-bg"),
          border: token("danger-border"),
        },
        error: {
          DEFAULT: token("danger"),
          fg: token("danger-fg"),
          bg: token("danger-bg"),
          border: token("danger-border"),
        },
        info: {
          DEFAULT: token("info"),
          fg: token("info-fg"),
          bg: token("info-bg"),
          border: token("info-border"),
        },

        // --- Chart series (fixed order, never cycled) ----------------------
        chart: {
          1: token("chart-1"),
          2: token("chart-2"),
          3: token("chart-3"),
        },
      },

      borderColor: {
        DEFAULT: token("line"),
      },

      fontFamily: {
        sans: [
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "Geist Mono",
          "ui-monospace",
          "SF Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },

      // 13px UI base. Sizes carry their own line-height and tracking so
      // hierarchy stays consistent without per-component overrides.
      fontSize: {
        micro: ["11px", { lineHeight: "16px", letterSpacing: "0.06em" }],
        caption: ["12px", { lineHeight: "16px", letterSpacing: "0" }],
        sm: ["13px", { lineHeight: "20px", letterSpacing: "0" }],
        base: ["13px", { lineHeight: "20px", letterSpacing: "0" }],
        md: ["14px", { lineHeight: "20px", letterSpacing: "-0.005em" }],
        lg: ["15px", { lineHeight: "22px", letterSpacing: "-0.008em" }],
        xl: ["17px", { lineHeight: "24px", letterSpacing: "-0.012em" }],
        "2xl": ["20px", { lineHeight: "28px", letterSpacing: "-0.016em" }],
        "3xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em" }],
        "4xl": ["30px", { lineHeight: "36px", letterSpacing: "-0.022em" }],
        "5xl": ["38px", { lineHeight: "44px", letterSpacing: "-0.024em" }],
        // Metric readouts on the dashboard.
        metric: ["28px", { lineHeight: "34px", letterSpacing: "-0.02em" }],
        "metric-lg": ["34px", { lineHeight: "40px", letterSpacing: "-0.024em" }],
      },

      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "14px",
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        overlay: "var(--shadow-overlay)",
        // Kept for pages that still reference them.
        card: "var(--shadow-sm)",
        "card-hover": "var(--shadow-md)",
        none: "none",
      },

      ringColor: {
        DEFAULT: token("focus-ring"),
      },

      spacing: {
        header: "52px",
        sidebar: "240px",
        "sidebar-collapsed": "56px",
      },

      zIndex: {
        sidebar: "30",
        header: "40",
        drawer: "50",
        overlay: "60",
        toast: "70",
      },

      transitionDuration: {
        DEFAULT: "150ms",
      },

      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "fade-up": "fade-up 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 140ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in": "slide-in-right 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 1.4s ease-in-out infinite",
        spin: "spin 0.6s linear infinite",
      },
    },
  },
  plugins: [],
};
