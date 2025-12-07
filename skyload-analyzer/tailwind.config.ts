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
        cyber: {
          bg: "#0a0a0f",
          "bg-secondary": "#12121a",
          card: "#1a1a2e",
          hover: "#16213e",
          cyan: "#00fff5",
          magenta: "#ff00ff",
          yellow: "#ffd700",
          green: "#39ff14",
          red: "#ff073a",
          purple: "#bf00ff",
          blue: "#0ff",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["Rajdhani", "sans-serif"],
        mono: ["Share Tech Mono", "monospace"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "scan": "scan 8s linear infinite",
        "glitch": "glitch 0.3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        scan: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(4px)" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(0, 255, 245, 0.3)" },
          "50%": { borderColor: "rgba(0, 255, 245, 0.8)" },
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 10px #00fff5, 0 0 20px #00fff5, 0 0 30px #00fff5",
        "neon-cyan-sm": "0 0 5px #00fff5, 0 0 10px #00fff5",
        "neon-magenta": "0 0 10px #ff00ff, 0 0 20px #ff00ff",
        "neon-red": "0 0 10px #ff073a, 0 0 20px #ff073a",
        "neon-green": "0 0 10px #39ff14, 0 0 20px #39ff14",
        "neon-yellow": "0 0 10px #ffd700, 0 0 20px #ffd700",
      },
    },
  },
  plugins: [],
};

export default config;

