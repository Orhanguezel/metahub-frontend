// src/styles/themes/orangeTheme.ts

import { DefaultTheme } from "styled-components";

const orangeTheme: DefaultTheme = {
  templateName: "orange",
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
    background: "#FFFFFF",
    backgroundSecondary: "#F8FAFC",
    backgroundAlt: "#FFF7ED",
    sectionBackground: "#F8FAFC",
    inputBackground: "#FFFFFF",
    inputBackgroundFocus: "#F8FAFC",
    footerBackground: "#F8FAFC",
    warningBackground: "#FFFBE6",

    text: "#0F172A",
    textAlt: "#1E293B",
    textSecondary: "#64748B",
    textPrimary: "#0F172A",
    textMuted: "#94A3B8",
    textLight: "#0F172A",
    textOnWarning: "#d95841",
    textOnSuccess: "#ffffff",
    textOnDanger: "#ffffff",

    title: "#F97316",

    overlayStart: "rgba(255, 255, 255, 0.3)",
    overlayEnd: "rgba(255, 255, 255, 0.95)",
    overlayBackground: "rgba(0, 0, 0, 0.5)",

    skeleton: "#E5E7EB",
    skeletonBackground: "#F1F5F9",

    primary: "#F97316",
    primaryLight: "#FB923C",
    primaryHover: "#EA580C",
    primaryDark: "#C2410C",
    primaryTransparent: "rgba(249, 115, 22, 0.1)",

    secondary: "#F97316",
    secondaryLight: "#FB923C",
    secondaryHover: "#EA580C",
    secondaryDark: "#C2410C",
    secondaryTransparent: "rgba(249, 115, 22, 0.1)",

    accent: "#F1F5F9",
    accentHover: "#E2E8F0",
    accentText: "#0F172A",

    border: "#E2E8F0",
    borderLight: "#F1F5F9",
    borderBright: "#F1F5F9",
    borderBrighter: "#F8FAFC",
    borderHighlight: "#F97316",
    borderInput: "#E2E8F0",

    card: "#F8FAFC",
    cardBackground: "#F8FAFC",

    buttonBackground: "#F97316",
    buttonText: "#FFFFFF",
    buttonBorder: "#F97316",

    link: "#F97316",
    linkHover: "#EA580C",

    hoverBackground: "#FFF7ED",
    shadowHighlight: "0 0 0 3px rgba(249, 115, 22, 0.13)",

    success: "#28A745",
    warning: "#FFC107",
    warningHover: "#E0A800",
    danger: "#DC3545",
    dangerHover: "#C82333",
    error: "#DC3545",
    info: "#17A2B8",
    muted: "#6C757D",
    disabled: "#D6D6D6",

    placeholder: "#94A3B8",
    inputBorder: "#E2E8F0",
    inputBorderFocus: "#F97316",
    inputOutline: "#F97316",
    inputIcon: "#F97316",
    inputBackgroundLight: "#F8FAFC",
    inputBackgroundSofter: "#FFF7ED",

    tableHeader: "#F0F0F0",
    tagBackground: "#F0F0F0",
    grey: "#94A3B8",
    darkGrey: "#1E293B",
    black: "#000000",
    white: "#FFFFFF",
    whiteColor: "#FFFFFF",
    darkColor: "#0F172A",
    disabledBg: "#d6d6d6",
    lightGrey: "#f7f7f7",
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
    borderFocus: "#F97316",
    text: "#0F172A",
    placeholder: "#94A3B8",
  },

  cards: {
    background: "#F8FAFC",
    hoverBackground: "#F1F5F9",
    border: "#E2E8F0",
    shadow: "0 4px 16px rgba(249, 115, 22, 0.04)",
  },
};

export default orangeTheme;
