module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#05070d",
          925: "#0a0e1a",
        },
        accent: "#4de1c1",
        cyber: {
          50: "#e0fff7",
          100: "#b3ffe8",
          200: "#80ffd9",
          300: "#4de1c1",
          400: "#33d4b0",
          500: "#1ab89a",
          600: "#0f9a7f",
          700: "#0a7d66",
        },
        danger: {
          50: "#fff1f2",
          100: "#ffe4e6",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(77, 225, 193, 0.15)",
        "glow-sm": "0 0 10px rgba(77, 225, 193, 0.1)",
        "glow-danger": "0 0 20px rgba(244, 63, 94, 0.15)",
        "glow-warning": "0 0 20px rgba(245, 158, 11, 0.15)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
