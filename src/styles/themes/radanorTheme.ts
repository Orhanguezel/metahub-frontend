// src/styles/themes/radanorTheme.ts

import { DefaultTheme } from "styled-components";

const radanorTheme: DefaultTheme = {
  templateName: "radanor",

  fonts: {
    main: "'Rajdhani', sans-serif",
    special: "'Orbitron', sans-serif",
    heading: "'Orbitron', sans-serif",
    body: "'Rajdhani', sans-serif",
    mono: "'Fira Code', monospace",
  },

  fontSizes: {
    base: "16px",
    xsmall: "13px",
    small: "15px",
    medium: "18px",
    large: "24px",
    xlarge: "30px",
    h1: "clamp(3rem, 6vw, 5rem)",
    h2: "2.8rem",
    h3: "2.2rem",
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "2.8rem",
  },

  fontWeights: {
    thin: 100,
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 900,
  },

  lineHeights: {
    normal: "1.4",
    relaxed: "1.6",
    loose: "1.8",
  },

  spacings: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
    xxxl: "64px",
  },

  radii: {
    none: "0",
    sm: "2px",
    md: "6px",
    lg: "10px",
    xl: "16px",
    pill: "500px",
    circle: "50%",
  },

  borders: {
    thin: "1px solid",
    thick: "2px solid",
  },

  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.1)",
    sm: "0 2px 6px rgba(0,0,0,0.15)",
    md: "0 4px 12px rgba(0,0,0,0.2)",
    lg: "0 8px 20px rgba(0,0,0,0.25)",
    xl: "0 16px 40px rgba(0,0,0,0.3)",
    form: "0 6px 20px rgba(100,100,100,0.2)",
    button: "0 4px 14px rgba(0,255,255,0.2)",
  },

  transition: {
    fast: "0.2s ease-in",
    normal: "0.3s ease-out",
    slow: "0.5s ease-in-out",
  },

  durations: {
    fast: "150ms",
    normal: "300ms",
    slow: "600ms",
  },

  layout: {
    containerWidth: "1380px",
    sectionspacings: "4rem",
  },

  zIndex: {
    dropdown: 1000,
    modal: 1100,
    overlay: 1200,
    tooltip: 1300,
  },

  opacity: {
    disabled: 0.4,
    hover: 0.85,
  },

  breakpoints: {
    mobileS: "320px",
    mobileM: "375px",
    mobileL: "425px",
    tabletS: "600px",
    tablet: "768px",
    laptopS: "1024px",
    laptop: "1280px",
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
    retina:
      "@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)",
  },

  colors: {
    background: "#0B0E14",
    backgroundSecondary: "#11151C",
    backgroundAlt: "#171C25",
    sectionBackground: "#10131A",
    inputBackground: "#1C1F26",
    inputBackgroundFocus: "#1C1F26",
    footerBackground: "#0B0E14",
    warningBackground: "#fffbe6",

    text: "#F5F5F5",
    textAlt: "#CCCCCC",
    textSecondary: "#A0A0A0",
    textPrimary: "#FFFFFF",
    textMuted: "#888888",
    textLight: "#BEBEBE",
    textOnWarning: "#d95841",
    textOnSuccess: "#ffffff",
    textOnDanger: "#ffffff",

    title: "#00FFF7",

    overlayStart: "rgba(0, 0, 0, 0.6)",
    overlayEnd: "rgba(0, 0, 0, 0.95)",
    overlayBackground: "rgba(0, 0, 0, 0.85)",
    skeleton: "#2A2D32",
    skeletonBackground: "#1C1F26",

    primary: "#00FFF7",
    primaryLight: "#33FFF9",
    primaryHover: "#00CCCC",
    primaryDark: "#008B8B",
    primaryTransparent: "rgba(0,255,247,0.1)",

    secondary: "#52404b",
    secondaryLight: "#f3d9e5",
    secondaryHover: "#40333d",
    secondaryDark: "#32272a",
    secondaryTransparent: "rgba(82,64,75,0.1)",

    accent: "#FF007F",
    accentHover: "#E60073",
    accentText: "#FFFFFF",

    border: "#2C2C2C",
    borderLight: "#3A3A3A",
    borderBright: "#4A4A4A",
    borderBrighter: "#5A5A5A",
    borderHighlight: "#00FFF7",
    borderInput: "#444",

    card: "#14181F",
    cardBackground: "#14181F",

    buttonBackground: "#00FFF7",
    buttonText: "#0B0E14",
    buttonBorder: "#00FFF7",

    link: "#00FFF7",
    linkHover: "#00CCCC",

    hoverBackground: "#22272E",
    shadowHighlight: "0 0 0 3px rgba(0,255,247,0.3)",

    success: "#10B981",
    warning: "#F59E0B",
    warningHover: "#F59E0B",
    danger: "#EF4444",
    dangerHover: "#DC2626",
    error: "#EF4444",
    info: "#3B82F6",
    muted: "#6B7280",
    disabled: "#2E2E2E",

    placeholder: "#666",
    inputBorderFocus: "#00FFF7",
    inputOutline: "#00FFF7",
    inputIcon: "#AAA",
    inputBackgroundLight: "#1C1C1C",
    inputBackgroundSofter: "#222",
    inputBorder: "#444",

    tableHeader: "#1C1F26",
    tagBackground: "#333",
    grey: "#666",
    darkGrey: "#444",
    black: "#000",
    white: "#fff",
    whiteColor: "#fff",
    darkColor: "#0B0E14",
    disabledBg: "#333333",
    lightGrey: "#f7f7f7",
  },

  buttons: {
    primary: {
      background: "#00FFF7",
      backgroundHover: "#00CCCC",
      text: "#0B0E14",
      textHover: "#0B0E14",
    },
    secondary: {
      background: "#1E1E1E",
      backgroundHover: "#2E2E2E",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
    danger: {
      background: "#EF4444",
      backgroundHover: "#DC2626",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
  },

  inputs: {
    background: "#1A1A1A",
    border: "#333",
    borderFocus: "#00FFF7",
    text: "#FFFFFF",
    placeholder: "#888888",
  },

  cards: {
    background: "#171C25",
    hoverBackground: "#1F2430",
    border: "#2C2C2C",
    shadow: "0 4px 24px rgba(0,255,247,0.05)",
  },
};

export default radanorTheme;
