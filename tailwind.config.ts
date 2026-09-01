import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#08080A",
          2: "#0D0D10",
          3: "#131318",
        },
        surface: {
          DEFAULT: "#16161B",
          2: "#1D1D23",
          3: "#26262E",
        },
        line: "rgba(244,240,232,0.09)",
        cream: {
          DEFAULT: "#F4F0E8",
          muted: "#A59D8E",
          dim: "#8A8274",
        },
        champagne: {
          DEFAULT: "#C9A86A",
          bright: "#E6CB8C",
          deep: "#9E7E45",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        tighter: "-0.03em",
        wide2: "0.08em",
        widest2: "0.22em",
      },
      fontSize: {
        "10xl": ["9rem", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        "11xl": ["12rem", { lineHeight: "0.88", letterSpacing: "-0.045em" }],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      transition: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        swipe: {
          "0%,100%": { transform: "translateX(0)", opacity: "0.45" },
          "50%": { transform: "translateX(5px)", opacity: "1" },
        },
        "swipe-rev": {
          "0%,100%": { transform: "translateX(0)", opacity: "0.45" },
          "50%": { transform: "translateX(-5px)", opacity: "1" },
        },
        grain: {
          "0%,100%": { transform: "translate(0,0)" },
          "10%": { transform: "translate(-5%,-5%)" },
          "30%": { transform: "translate(3%,-8%)" },
          "50%": { transform: "translate(-8%,4%)" },
          "70%": { transform: "translate(5%,6%)" },
          "90%": { transform: "translate(-3%,3%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.16,1,0.3,1) both",
        marquee: "marquee 38s linear infinite",
        float: "float 7s ease-in-out infinite",
        "spin-slow": "spin-slow 26s linear infinite",
        shimmer: "shimmer 3.2s linear infinite",
        "pulse-soft": "pulse-soft 3.5s ease-in-out infinite",
        grain: "grain 8s steps(10) infinite",
        swipe: "swipe 1.6s ease-in-out infinite",
        "swipe-rev": "swipe-rev 1.6s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 0 80px -20px rgba(201,168,106,0.45)",
        "glow-sm": "0 0 40px -12px rgba(201,168,106,0.4)",
        soft: "0 30px 60px -20px rgba(0,0,0,0.7)",
        "inner-line": "inset 0 1px 0 0 rgba(244,240,232,0.06)",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(ellipse at center, rgba(201,168,106,0.12), transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
