// src/styles/theme.ts

import { sharedTheme } from "./sharedTheme";


  
export const lightTheme = {
  ...sharedTheme,
  colors: {
    background: "#f5f5f5",
    backgroundSecondary: "#EAEDF2",
    text: "#000",
    textSecondary: "#3c3c3c",
    primary: "#486289",
    danger: "#ff4d4d",
    success: "#28a745",
    warning: "#ffcc00",
    info: "#007BFF",
    link: "#007BFF",
    border: "#ccc",
    cardBackground: "#fff",
    inputBackground: "#fff",
    buttonBackground: "#007BFF",
    buttonText: "#ffffff",
  },
  // Ekstra özel alanlar
  buttons: {
    primary: {
      background: "#007BFF",
      backgroundHover: "#0056b3",
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

  
  export const darkTheme = {
    ...sharedTheme,
    colors: {
      background: "#121212",
      backgroundSecondary: "#1E1E1E",
      text: "#ffffff",
      textSecondary: "#aaaaaa",
      primary: "#007BFF",
      danger: "#ff4d4d",
      success: "#28a745",
      warning: "#ffcc00",
      info: "#007BFF",
      link: "#007BFF",
      border: "#444444",
      cardBackground: "#1E1E1E",
      inputBackground: "#333333",
      buttonBackground: "#007BFF",
      buttonText: "#ffffff",
    },
    // Ekstra özel alanlar
    buttons: {
      primary: {
        background: "#007BFF",
        backgroundHover: "#0056b3",
        text: "#ffffff",
      },
      danger: {
        background: "#e00",
        backgroundHover: "#c00",
        text: "#fff",
      },
    },
    inputs: {
      background: "#333333",
      border: "#444444",
      text: "#ffffff",
    },
    cards: {
      background: "#1E1E1E",
      hoverBackground: "#2A2A2A",
    },
  }

  
  // 🎯 Type export
  export type ThemeType = typeof lightTheme;
  