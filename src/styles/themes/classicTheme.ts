// src/styles/themes/classicTheme.ts

import { DefaultTheme } from "styled-components";

const classicTheme: DefaultTheme = {
  templateName: "classic",

  fonts: {
    main: "'Segoe UI', Arial, sans-serif",
    special: "'Georgia', serif",
    heading: "'Georgia', serif",
    body: "'Segoe UI', Arial, sans-serif",
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

  spacings: {
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
    xs: "0 1px 2px rgba(0,0,0,0.03)",
    sm: "0 1px 4px rgba(0,0,0,0.05)",
    md: "0 4px 8px rgba(0,0,0,0.07)",
    lg: "0 8px 16px rgba(0,0,0,0.09)",
    xl: "0 16px 32px rgba(0,0,0,0.11)",
    form: "0 6px 20px rgba(0,0,0,0.06)",
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
    sectionspacings: "3rem",
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
    desktopL: "1640px",
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
    background: "#f5f5f5",
    backgroundSecondary: "#eaeaea",
    backgroundAlt: "#ffffff",
    sectionBackground: "#ffffff",
    inputBackground: "#ffffff",
    inputBackgroundFocus: "#f0f0f0",
    footerBackground: "#f8f8f8",
    warningBackground: "#fffbe6",
    contentBackground: "#f6f7fa",
    successBg: "#d1f5dd",
    dangerBg: "#ffe3e3",

    achievementBackground: "#e8edf5",
  achievementGradientStart: "#7aa0d6",
  achievementGradientEnd: "#486289",

    overlayStart: "rgba(255,255,255,0.3)",
    overlayEnd: "rgba(255,255,255,0.95)",
    overlayBackground: "rgba(0,0,0,0.5)",
    skeleton: "#f0f0f0",
    skeletonBackground: "#f0f0f0",

    text: "#000000",
    textAlt: "#222222",
    textSecondary: "#666666",
    textPrimary: "#000000",
    textMuted: "#888888",
    textLight: "#171717",
    title: "#486289",
    textOnWarning: "#d95841",
    textOnSuccess: "#ffffff",
    textOnDanger: "#ffffff",

    primary: "#486289",
    primaryLight: "#e8edf5",
    primaryHover: "#365075",
    primaryDark: "#222222",
    primaryTransparent: "rgba(72, 98, 137, 0.1)",

    secondary: "#52404b",
    secondaryLight: "#f3d9e5",
    secondaryHover: "#40333d",
    secondaryDark: "#32272a",
    secondaryTransparent: "rgba(82,64,75,0.1)",

    accent: "#007BFF",
    accentHover: "#0056b3",
    accentText: "#ffffff",

    border: "#cccccc",
    borderLight: "#f0f0f0",
    borderBright: "#eaeaea",
    borderBrighter: "#ffffff",
    borderHighlight: "#486289",
    borderInput: "#cccccc",

    card: "#ffffff",
    cardBackground: "#ffffff",

    buttonBackground: "#486289",
    buttonText: "#ffffff",
    buttonBorder: "#486289",

    link: "#007BFF",
    linkHover: "#0056b3",

    hoverBackground: "#eaeaea",
    shadowHighlight: "0 0 0 3px rgba(72,98,137,0.1)",

    success: "#28a745",
    warning: "#ffc107",
    warningHover: "#e0a800",
    danger: "#dc3545",
    dangerHover: "#c82333",
    error: "#dc3545",
    info: "#17a2b8",
    muted: "#6c757d",
    disabled: "#d6d6d6",

    placeholder: "#888888",
    inputBorder: "#cccccc",
    inputBorderFocus: "#486289",
    inputOutline: "#486289",
    inputIcon: "#486289",
    inputBackgroundLight: "#f0f0f0",
    inputBackgroundSofter: "#eaeaea",

    tableHeader: "#f0f0f0",
    tagBackground: "#eee",
    grey: "#888888",
    darkGrey: "#222222",
    black: "#000000",
    white: "#ffffff",
    whiteColor: "#ffffff",
    darkColor: "#000000",
    disabledBg: "#d6d6d6",
    lightGrey: "#f7f7f7",
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
    success: {
      background: "#28a745",
      backgroundHover: "#218838",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    warning: {
      background: "#ffc107",
      backgroundHover: "#e0a800",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    danger: {
      background: "#dc3545",
      backgroundHover: "#c82333",
      text: "#ffffff",
      textHover: "#ffffff",
    },
  },

  inputs: {
    background: "#ffffff",
    border: "#cccccc",
    borderFocus: "#486289",
    text: "#000000",
    placeholder: "#888888",
  },

  cards: {
    background: "#ffffff",
    hoverBackground: "#f0f0f0",
    border: "#cccccc",
    shadow: "0 4px 16px rgba(0,0,0,0.04)",
  },
};

export default classicTheme;
