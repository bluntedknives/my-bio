import type { Config } from "tailwindcss";
import { ledgerLivePreset } from '@ledgerhq/lumen-design-core';

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}", 
    "./components/**/*.{ts,tsx}",
    './node_modules/@ledgerhq/lumen-ui-react/dist/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [ledgerLivePreset],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      colors: {
        glass: "rgba(255,255,255,0.06)",
        tui: {
          bg: "#0c0c0c",
          border: "#333333",
          text: "#a0a0a0",
          bright: "#ffffff",
          accent: "#4d4d4d",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(255,255,255,0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
