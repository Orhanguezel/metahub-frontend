import { sharedTheme } from "@/styles/sharedTheme";

const minimalTheme = {
  templateName: "minimal",
  ...sharedTheme,
  colors: {
    background: "#FAFAFA",
    backgroundSecondary: "#f0f0f0",
    backgroundAlt: "#ffffff",
    sectionBackground: "#ffffff",
    text: "#333333",
    textAlt: "#333333",
    textSecondary: "#666",
    primary: "#333333",
    primaryHover: "#222222",
    primaryDark: "#000000",
    accent: "#666666",
    secondary: "#888",
    border: "#ccc",
    cardBackground: "#ffffff",
    buttonBackground: "#333333",
    buttonText: "#ffffff",
    link: "#666666",
    linkHover: "#444444",
    hoverBackground: "#f0f0f0",
    whiteColor: "#ffffff",
    darkColor: "#000000",
  },
  buttons: {
    primary: {
      background: "#333333",
      backgroundHover: "#111111",
      text: "#ffffff",
    },
    danger: {
      background: "#e00",
      backgroundHover: "#c00",
      text: "#fff",
    },
  },
  inputs: {
    background: "#ffffff",
    border: "#ccc",
    text: "#333333",
  },
  cards: {
    background: "#ffffff",
    hoverBackground: "#f0f0f0",
  },
};

export default minimalTheme;
