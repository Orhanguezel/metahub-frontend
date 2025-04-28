import { sharedTheme } from "@/styles/sharedTheme";

const modernTheme = {
  templateName: "modern",
  ...sharedTheme,
  colors: {
    background: "#ffffff",
    backgroundSecondary: "#ecf0f1",
    backgroundAlt: "#ffffff",
    sectionBackground: "#ffffff",
    text: "#2C3E50",
    textAlt: "#2C3E50",
    textSecondary: "#666",
    primary: "#2C3E50",
    primaryHover: "#34495E",
    primaryDark: "#1B2631",
    accent: "#3498DB",
    secondary: "#888",
    border: "#ccc",
    cardBackground: "#f9f9f9",
    buttonBackground: "#3498DB",
    buttonText: "#ffffff",
    link: "#3498DB",
    linkHover: "#0056b3",
    hoverBackground: "#ecf0f1",
    whiteColor: "#ffffff",
    darkColor: "#000000",
  },
  buttons: {
    primary: {
      background: "#3498DB",
      backgroundHover: "#2980B9",
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
    text: "#2C3E50",
  },
  cards: {
    background: "#f9f9f9",
    hoverBackground: "#ecf0f1",
  },
};

export default modernTheme;
