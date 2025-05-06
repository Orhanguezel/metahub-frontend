import { sharedTheme } from "@/styles/sharedTheme";

const futuristicTheme = {
  templateName: "futuristic",
  ...sharedTheme,
  colors: {
    background: "#0D0D0D",
    backgroundSecondary: "#292929",
    backgroundAlt: "#1A1A1A",
    sectionBackground: "#1A1A1A",
    inputBackground: "#333333", // 🆕 Eklendi
    overlayStart: "rgba(0, 0, 0, 0.8)",
    overlayEnd: "rgba(0, 0, 0, 0.95)",
    text: "#E0E0E0",
    textAlt: "#E0E0E0",
    textSecondary: "#999999",
    textPrimary: "#E0E0E0", // 🆕 Eklendi
    textMuted: "#888888", // 🆕 Eklendi
    primary: "#00FFF7",
    primaryLight: "#66fff9", // 🆕 Eklendi
    primaryHover: "#00cccc",
    primaryDark: "#007777",
    primaryTransparent: "rgba(0, 255, 247, 0.1)",
    skeletonBackground: "#444444", // 🆕
    overlayBackground: "rgba(0, 0, 0, 0.5)", // 🆕
    accent: "#7D00FF",
    secondary: "#888",
    border: "#444",
    cardBackground: "#1A1A1A",
    card: "#1A1A1A",
    buttonBackground: "#00FFF7",
    buttonText: "#0D0D0D",
    link: "#7D00FF",
    linkHover: "#9933FF", // ✅ zaten vardı
    hoverBackground: "#292929",
    whiteColor: "#ffffff",
    darkColor: "#000000",
    success: "#28a745", // 🆕 Eklendi
    warning: "#ffc107", // 🆕 Eklendi
    danger: "#dc3545",  // 🆕 Eklendi
    dangerHover: "#c82333", // 🆕 Eklendi
    error: "#dc3545",   // 🆕 Eklendi
    info: "#17a2b8",    // 🆕 Eklendi
    muted: "#6c757d",   // 🆕 Eklendi
    disabled: "#555555",
    placeholder: "#888888", // 🆕 Eklendi
  },
  buttons: {
    primary: {
      background: "#00FFF7",
      backgroundHover: "#00cccc",
      text: "#0D0D0D",
      textHover: "#0D0D0D",
    },
    secondary: {
      background: "#444444",
      backgroundHover: "#555555",
      text: "#E0E0E0",
      textHover: "#ffffff",
    },
    danger: {
      background: "#ff0033",
      backgroundHover: "#cc0022",
      text: "#ffffff",
      textHover: "#ffffff",
    },
  },
  inputs: {
    background: "#333333",
    border: "#444444",
    text: "#E0E0E0",
    placeholder: "#888888", // 🆕 Eklendi
  },
  cards: {
    background: "#1A1A1A",
    hoverBackground: "#292929",
  },
};

export default futuristicTheme;
