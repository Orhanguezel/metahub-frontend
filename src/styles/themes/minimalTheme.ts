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
    footerBackground: "#f8f8f8",
    overlayStart: "rgba(255, 255, 255, 0.8)",
    overlayEnd: "rgba(255, 255, 255, 0.95)",
    text: "#333333",
    textAlt: "#333333",
    textSecondary: "#666666",
    textPrimary: "#333333", // 🆕 Eklendi
    textMuted: "#888888", // 🆕 Eklendi
    primary: "#333333",
    primaryLight: "#666666", // 🆕 Eklendi
    primaryHover: "#222222",
    primaryDark: "#000000",
    primaryTransparent: "rgba(51, 51, 51, 0.1)",
    skeleton: "#f0f0f0", // 🆕
    overlayBackground: "rgba(0, 0, 0, 0.5)", // 🆕
    accent: "#666666",
    secondary: "#888",
    border: "#ccc",
    cardBackground: "#ffffff",
    card: "#ffffff",
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
    dangerHover: "#c82333", // 🆕 Eklendi
    error: "#dc3545",   // 🆕 Eklendi
    info: "#17a2b8",    // 🆕 Eklendi
    muted: "#6c757d",   // 🆕 Eklendi
    disabled: "#d6d6d6",
    placeholder: "#888888", // 🆕 Eklendi
    tableHeader: "#f0f0f0", // 🆕 Eklendi
    tagBackground: "#f0f0f0", // 🆕 Eklendi
    skeletonBackground: "#f0f0f0", // 🆕 Eklendi
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
