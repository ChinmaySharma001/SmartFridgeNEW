/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        void: "#050810",
        deep: "#080d1a",
        surface: "#0d1526",
        mint: "#00e5a0",
        amber: "#f59e0b",
        coral: "#ff4d6d",
        accent: "#639dff",
      },
      backdropBlur: { glass: "20px" },
      animation: {
        "scan-line": "scanMove 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "fade-in": "fadeSlideIn 0.4s ease both",
        pulse: "pulse 1.5s infinite",
        spin: "spin 0.8s linear infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        scanMove: {
          "0%": { top: "0", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { top: "100%", opacity: "0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeSlideIn: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "none" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};
