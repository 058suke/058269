/** @type {import('tailwindcss').Config} */

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    // Remove the following screen breakpoint or add other breakpoints
    // if one breakpoint is not enough for you
    screens: {
      sm: "640px",
    },

    // Uncomment the following extend
    // if existing Tailwind color palette will be used

    textColor: {
      skin: {
        base: withOpacity("--color-text-base"),
        accent: withOpacity("--color-accent"),
        inverted: withOpacity("--color-fill"),
        gray: withOpacity("--color-text-gray"),
      },
    },
    backgroundColor: {
      skin: {
        fill: withOpacity("--color-fill"),
        accent: withOpacity("--color-accent"),
        inverted: withOpacity("--color-text-base"),
        card: withOpacity("--color-card"),
        "card-muted": withOpacity("--color-card-muted"),
      },
    },
    outlineColor: {
      skin: {
        fill: withOpacity("--color-accent"),
      },
    },
    borderColor: {
      skin: {
        line: withOpacity("--color-border"),
        fill: withOpacity("--color-text-base"),
        accent: withOpacity("--color-accent"),
      },
    },
    fill: {
      skin: {
        base: withOpacity("--color-text-base"),
        accent: withOpacity("--color-accent"),
      },
      transparent: "transparent",
    },
    fontFamily: {
      mono: ["-apple-system,BlinkMacSystemFont","Helvetica Neue","Segoe UI","Hiragino Kaku Gothic ProN","Hiragino Sans","Arial","Meiryo","sans-serif"]
    },
    extend: {
      animation: {
        "slide-in-title": "slide-in-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
        "slide-in-subtitle": "slide-in-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940)  both",
        "slide-in-tag": "slide-in-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940)  both",
        "slide-in-image": "slide-in-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.4s both",
        "slide-in-article": "slide-in-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.6s both",
        "slide-in-contents": "slide-in-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.4s both",
        "slide-in-bottoms": "slide-in-bottom 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.6s both"
      },
      keyframes: {
        "slide-in-bottom": {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
      },
    }
  },
};
