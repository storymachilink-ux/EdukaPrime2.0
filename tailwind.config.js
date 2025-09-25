const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: { 
        aurora: "aurora 60s linear infinite" 
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to:   { backgroundPosition: "350% 50%, 350% 50%" },
        },
      },
      colors: {
        background: '#F8FBFF',
        surface: '#FFFFFF',
        border: '#E6EEF7',
        accent: '#F1F6FF',
        ink: '#0F2741',
        body: '#4A5568',
        primary: '#FF6B2C',
        'primary-foreground': '#FFFFFF',
        secondary: '#7A6AF5',
        success: '#28C76F',
        warning: '#FFC107',
      },
      boxShadow: {
        card: '0 8px 24px rgba(15,39,65,0.06)',
      }
    },
  },
  plugins: [addVariablesForColors],
}

function addVariablesForColors({ addBase, theme }) {
  const allColors = flattenColorPalette(theme("colors"));
  const vars = Object.fromEntries(Object.entries(allColors).map(([k, v]) => [`--${k}`, v]));
  addBase({ ":root": vars });
}