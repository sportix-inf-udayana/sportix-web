/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          emerald: "#10b981", 
          amber: "#f59e0b",   
        }
      },
      fontSize: {
        micro: ["0.625rem", { lineHeight: '0.875rem' }], // 10px
        tiny: ["0.6875rem", { lineHeight: '1rem' }],     // 11px
      }
    },
  },
  plugins: [],
};