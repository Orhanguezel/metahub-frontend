import { sharedTheme } from "@/styles/sharedTheme";

const minimalTheme = {
  templateName: "minimal",
  ...sharedTheme,
  colors: {
    background: "#FAFAFA",
    backgroundSecondary: "#f0f0f0",
    backgroundAlt: "#ffffff",
    sectionBackground: "#ffffff",
    inputBackground: "#ffffff", // 🆕 Eklendi
    text: "#333333",
    textAlt: "#333333",
    textSecondary: "#666666",
    textPrimary: "#333333", // 🆕 Eklendi
    primary: "#333333",
    primaryLight: "#666666", // 🆕 Eklendi
    primaryHover: "#222222",
    primaryDark: "#000000",
    accent: "#666666",
    secondary: "#888",
    border: "#ccc",
    cardBackground: "#ffffff",
    buttonBackground: "#333333",
    buttonText: "#ffffff",
    link: "#666666",
    linkHover: "#444444", // ✅ vardı
    hoverBackground: "#f0f0f0",
    whiteColor: "#ffffff",
    darkColor: "#000000",
    success: "#28a745", // 🆕 Eklendi
    warning: "#ffc107", // 🆕 Eklendi
    danger: "#dc3545",  // 🆕 Eklendi
    error: "#dc3545",   // 🆕 Eklendi
    info: "#17a2b8",    // 🆕 Eklendi
    muted: "#6c757d",   // 🆕 Eklendi
    disabled: "#d6d6d6" // 🆕 Eklendi
  },
  buttons: {
    primary: {
      background: "#333333",
      backgroundHover: "#111111",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    secondary: {
      background: "#e0e0e0",
      backgroundHover: "#d0d0d0",
      text: "#333333",
      textHover: "#111111",
    },
    danger: {
      background: "#e00",
      backgroundHover: "#c00",
      text: "#fff",
      textHover: "#fff",
    },
  },
  inputs: {
    background: "#ffffff",
    border: "#ccc",
    text: "#333333",
    placeholder: "#888888", // 🆕 Eklendi
  },
  cards: {
    background: "#ffffff",
    hoverBackground: "#f0f0f0",
  },
};

export default minimalTheme;
