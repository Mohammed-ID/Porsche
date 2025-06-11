tailwind.config = {
  theme: {
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        porsche: "#1d1d1b",
        accent: "#1d1d1b",
        secondary: "#f5f5f5",
        overlay: "rgba(0,0,0,0.6)",
      },
      animation: {
        fade: "fade 1s ease-in-out forwards",
        float: "float 3s ease-in-out infinite alternate",
        slideIn: "slideIn 0.8s ease-out forwards",
      },
      keyframes: {
        fade: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-30px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
      },
      fontFamily: {
        porsche: ["Porsche Next", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
};
