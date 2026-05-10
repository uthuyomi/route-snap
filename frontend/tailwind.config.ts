import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        panel: "#ffffff"
      },
      boxShadow: {
        glow: "0 18px 70px rgba(23, 23, 23, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
