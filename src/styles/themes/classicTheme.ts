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
    overlayStart: "rgba(255, 255, 255, 0.3)",
    overlayEnd: "rgba(255, 255, 255, 0.95)",
    text: "#000000",
    textAlt: "#222222",
    textSecondary: "#666666",
    textPrimary: "#000000", // 🆕 Ekledik
    textMuted: "#888888", // 🆕 Ekledik
    primary: "#486289",
    primaryLight: "#e8edf5", // 🆕 Ekledik
    primaryHover: "#365075",
    primaryDark: "#222",
    primaryTransparent: "rgba(72, 98, 137, 0.1)",
    skeletonBackground: "#f0f0f0", 
    overlayBackground: "rgba(0, 0, 0, 0.5)", // 🆕
    accent: "#007BFF",
    secondary: "#888888",
    border: "#cccccc",
    cardBackground: "#ffffff",
    card:"#ffffff",
    buttonBackground: "#486289",
    buttonText: "#ffffff",
    link: "#007BFF",
    linkHover: "#0056b3",
    hoverBackground: "#eaeaea",
    whiteColor: "#ffffff",
    darkColor: "#000000",
    success: "#28a745", // 🆕
    warning: "#ffc107", // 🆕
    danger: "#dc3545",
    dangerHover: "#c82333", // 🆕
    error: "#dc3545",   // 🆕
    info: "#17a2b8",    // 🆕
    muted: "#6c757d",   // 🆕
    disabled: "#d6d6d6" ,// 🆕
    placeholder: "#888888", // 🆕
  },
  buttons: {
    primary: {
      background: "#486289",
      backgroundHover: "#365075",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    secondary: {
      background: "#f0f0f0",
      backgroundHover: "#e0e0e0",
      text: "#333333",
      textHover: "#111111",
    },
    danger: {
      background: "#e00",
      backgroundHover: "#c00",
      text: "#ffffff",
      textHover: "#ffffff",
    },
  },
  inputs: {
    background: "#ffffff",
    border: "#cccccc",
    text: "#000000",
    placeholder: "#888888", // 🆕
  },
  cards: {
    background: "#ffffff",
    hoverBackground: "#f0f0f0",
  },
};

export default classicTheme;
