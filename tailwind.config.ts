import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Laranja girassol — calibrado pelo logo
        sun: {
          50: "#FFF7ED",
          100: "#FFEAD0",
          200: "#FFD3A1",
          300: "#FBB870",
          400: "#F39B43",
          500: "#E87B0F", // primary
          600: "#C95F00",
          700: "#9D4900",
          800: "#723500",
          900: "#4A2200",
        },
        // Verde natural
        leaf: {
          50: "#F2F7EC",
          100: "#E0EBD0",
          200: "#C2D6A6",
          300: "#9FBB7A",
          400: "#7CA055",
          500: "#5A7A3F", // secondary
          600: "#456030",
          700: "#324722",
          800: "#202F16",
          900: "#11190B",
        },
        // Creme/off-white quente
        cream: {
          50: "#FEFCF7",
          100: "#FAF6EE",
          200: "#F0E8D6",
          300: "#E4D6B5",
        },
        ink: {
          900: "#2A1F14", // texto principal (marrom escuro quente)
          700: "#4A382A",
          500: "#6E5942",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        script: ['"Allura"', '"Pacifico"', "cursive"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        "leafy-pattern":
          "radial-gradient(circle at 20% 0%, rgba(90,122,63,0.07) 0%, transparent 40%), radial-gradient(circle at 80% 100%, rgba(232,123,15,0.06) 0%, transparent 40%)",
      },
    },
  },
  plugins: [],
};

export default config;
