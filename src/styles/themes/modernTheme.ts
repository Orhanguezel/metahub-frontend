// src/styles/themes/modernTheme.ts

import { DefaultTheme } from "styled-components";

const modernTheme: DefaultTheme = {
  templateName: "modern",

  fonts: {
    main: "'Inter', sans-serif",
    special: "'Poppins', sans-serif",
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },

  fontSizes: {
    base: "16px",
    xsmall: "14px",
    small: "16px",
    medium: "20px",
    large: "26px",
    xlarge: "32px",
    h1: "clamp(2.8rem, 7vw, 4.5rem)",
    h2: "2.5rem",
    h3: "2rem",
    xs: "0.8rem",
    sm: "0.9rem",
    md: "1.1rem",
    lg: "1.4rem",
    xl: "1.8rem",
    "2xl": "2.2rem",
    "3xl": "3rem",
  },

  fontWeights: {
    thin: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
  },

  lineHeights: {
    normal: "1.5",
    relaxed: "1.7",
    loose: "2",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "40px",
    xxxl: "56px",
  },

  radii: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "20px",
    pill: "9999px",
    circle: "50%",
  },

  borders: {
    thin: "1px solid",
    thick: "2px solid",
  },

  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.04)",
    sm: "0 1px 4px rgba(0,0,0,0.06)",
    md: "0 4px 8px rgba(0,0,0,0.08)",
    lg: "0 8px 16px rgba(0,0,0,0.1)",
    xl: "0 16px 32px rgba(0,0,0,0.12)",
    form: "0 6px 20px rgba(0,0,0,0.07)",
    button: "0 2px 10px rgba(0,0,0,0.05)",
  },

  transition: {
    fast: "0.2s ease-in-out",
    normal: "0.3s ease-in-out",
    slow: "0.5s ease-in-out",
  },

  durations: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },

  layout: {
    containerWidth: "1280px",
    sectionSpacing: "3rem",
  },

  zIndex: {
    dropdown: 1000,
    modal: 1100,
    overlay: 1200,
    tooltip: 1300,
  },

  opacity: {
    disabled: 0.5,
    hover: 0.9,
  },

  breakpoints: {
    mobileS: "320px",
    mobileM: "375px",
    mobileL: "425px",
    tabletS: "600px",
    tablet: "768px",
    laptopS: "900px",
    laptop: "1024px",
    desktop: "1440px",
  },

  media: {
    xsmall: "@media (max-width: 480px)",
    small: "@media (max-width: 768px)",
    medium: "@media (max-width: 1024px)",
    large: "@media (max-width: 1440px)",
    xlarge: "@media (min-width: 1441px)",
    mobile: "@media (max-width: 768px)",
    tablet: "@media (min-width: 769px) and (max-width: 1024px)",
    desktop: "@media (min-width: 1025px)",
    landscape: "@media (orientation: landscape)",
    portrait: "@media (orientation: portrait)",
    retina: "@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)",
  },

  colors: {
    background: "#ffffff",
    backgroundSecondary: "#f7f9fc",
    backgroundAlt: "#f0f2f5",
    sectionBackground: "#f7f9fc",
    inputBackground: "#ffffff",
    inputBackgroundFocus: "#f7f9fc",
    footerBackground: "#f7f9fc",
    warningBackground: "#fffbe6",

    text: "#1f1f1f",
    textAlt: "#2e2e2e",
    textSecondary: "#6b7280",
    textPrimary: "#111827",
    textMuted: "#9ca3af",
    textLight: "#1f1f1f",
    textOnWarning: "#d95841",
    textOnSuccess: "#ffffff",
    textOnDanger: "#ffffff",

    title: "#6366f1",

    overlayStart: "rgba(0, 0, 0, 0.3)",
    overlayEnd: "rgba(0, 0, 0, 0.55)",
    overlayBackground: "rgba(0, 0, 0, 0.5)",

    skeleton: "#e5e7eb",
    skeletonBackground: "#f0f0f0",

    primary: "#6366f1",
    primaryLight: "#eef2ff",
    primaryHover: "#4f46e5",
    primaryDark: "#4338ca",
    primaryTransparent: "rgba(99, 102, 241, 0.1)",

    accent: "#3b82f6",
    accentHover: "#2563eb",
    accentText: "#ffffff",

    border: "#d1d5db",
    borderLight: "#e5e7eb",
    borderBright: "#c7d2fe",
    borderBrighter: "#eef2ff",
    borderHighlight: "#6366f1",
    borderInput: "#d1d5db",

    card: "#ffffff",
    cardBackground: "#ffffff",

    buttonBackground: "#6366f1",
    buttonText: "#ffffff",
    buttonBorder: "#6366f1",

    link: "#3b82f6",
    linkHover: "#1d4ed8",

    hoverBackground: "#f1f5f9",
    shadowHighlight: "0 0 0 3px rgba(99,102,241,0.13)",

    success: "#22c55e",
    warning: "#facc15",
    warningHover: "#eab308",
    danger: "#ef4444",
    dangerHover: "#dc2626",
    error: "#ef4444",
    info: "#0ea5e9",
    muted: "#9ca3af",
    disabled: "#e5e7eb",

    placeholder: "#9ca3af",
    inputBorder: "#d1d5db",
    inputBorderFocus: "#6366f1",
    inputOutline: "#6366f1",
    inputIcon: "#6366f1",
    inputBackgroundLight: "#f7f9fc",
    inputBackgroundSofter: "#f0f2f5",

    tableHeader: "#f0f0f0",
    tagBackground: "#f0f0f0",
    grey: "#9ca3af",
    darkGrey: "#2e2e2e",
    black: "#000000",
    white: "#ffffff",
    whiteColor: "#ffffff",
    darkColor: "#000000",
  },

  buttons: {
    primary: {
      background: "#6366f1",
      backgroundHover: "#4f46e5",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    secondary: {
      background: "#e5e7eb",
      backgroundHover: "#d1d5db",
      text: "#374151",
      textHover: "#1f2937",
    },
    danger: {
      background: "#ef4444",
      backgroundHover: "#dc2626",
      text: "#ffffff",
      textHover: "#ffffff",
    },
  },

  inputs: {
    background: "#ffffff",
    border: "#d1d5db",
    borderFocus: "#6366f1",
    text: "#111827",
    placeholder: "#9ca3af",
  },

  cards: {
    background: "#ffffff",
    hoverBackground: "#f9fafb",
    border: "#e5e7eb",
    shadow: "0 4px 16px rgba(99,102,241,0.04)",
  },
};

export default modernTheme;
