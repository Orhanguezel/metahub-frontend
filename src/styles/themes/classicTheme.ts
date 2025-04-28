// classicTheme.ts
// src/styles/themes/classicTheme.ts
import { sharedTheme } from "@/styles/sharedTheme";

const classicTheme = {
  templateName: "classic",
  ...sharedTheme,
  colors: {
    background: "#f5f5f5",
    backgroundSecondary: "#eaeaea",
    backgroundAlt: "#ffffff",
    sectionBackground: "#ffffff",
    inputBackground: "#ffffff",
    text: "#000000",
    textAlt: "#000000",
    textSecondary: "#666",
    primary: "#486289",
    primaryHover: "#555",
    primaryDark: "#222",
    accent: "#007BFF",
    secondary: "#888",
    border: "#ccc",
    cardBackground: "#fff",
    buttonBackground: "#486289",
    buttonText: "#ffffff",
    link: "#007BFF",
    linkHover: "#0056b3",
    hoverBackground: "#eaeaea",
    whiteColor: "#ffffff",
    darkColor: "#000000",
  },
  buttons: {
    primary: {
      background: "#486289",
      backgroundHover: "#365075",
      text: "#ffffff",
    },
    danger: {
      background: "#e00",
      backgroundHover: "#c00",
      text: "#fff",
    },
  },
  inputs: {
    background: "#fff",
    border: "#ccc",
    text: "#000",
  },
  cards: {
    background: "#fff",
    hoverBackground: "#f0f0f0",
  },
};

export default classicTheme;
