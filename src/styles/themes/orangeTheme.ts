// src/styles/themes/orangeTheme.ts

import { sharedTheme } from "@/styles/sharedTheme";

const orangeTheme = {
  templateName: "orange",
  ...sharedTheme,
  colors: {
    background: "#FFFFFF",
    backgroundSecondary: "#F8FAFC",
    backgroundAlt: "#FFF7ED",
    sectionBackground: "#F8FAFC",
    inputBackground: "#FFFFFF",
    overlayStart: "rgba(255, 255, 255, 0.3)",
    overlayEnd: "rgba(255, 255, 255, 0.95)",
    text: "#0F172A",
    textAlt: "#1E293B",
    textSecondary: "#64748B",
    textPrimary: "#0F172A",
    textMuted: "#94A3B8",
    primary: "#F97316",
    primaryLight: "#FB923C",
    primaryHover: "#EA580C",
    primaryDark: "#C2410C",
    primaryTransparent: "rgba(249, 115, 22, 0.1)",
    skeletonBackground: "#F1F5F9",
    overlayBackground: "rgba(0, 0, 0, 0.5)",
    accent: "#F1F5F9",
    secondary: "#64748B",
    border: "#E2E8F0",
    cardBackground: "#F8FAFC",
    card: "#F8FAFC", // 🆕 Ekledik
    buttonBackground: "#F97316",
    buttonText: "#FFFFFF",
    link: "#F97316",
    linkHover: "#EA580C",
    hoverBackground: "#FFF7ED",
    whiteColor: "#FFFFFF",
    darkColor: "#0F172A",
    success: "#28A745",
    warning: "#FFC107",
    danger: "#DC3545",
    dangerHover: "#C82333",
    error: "#DC3545",
    info: "#17A2B8",
    muted: "#6C757D",
    disabled: "#D6D6D6",
    placeholder: "#94A3B8",
  },
  buttons: {
    primary: {
      background: "#F97316",
      backgroundHover: "#EA580C",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
    secondary: {
      background: "#F1F5F9",
      backgroundHover: "#E2E8F0",
      text: "#0F172A",
      textHover: "#0F172A",
    },
    danger: {
      background: "#DC3545",
      backgroundHover: "#C82333",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
  },
  inputs: {
    background: "#FFFFFF",
    border: "#E2E8F0",
    text: "#0F172A",
    placeholder: "#94A3B8",
  },
  cards: {
    background: "#F8FAFC",
    hoverBackground: "#F1F5F9",
  },
};

export default orangeTheme;
