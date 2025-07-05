// src/styles/themes/guezelwebTheme.ts

import { DefaultTheme } from "styled-components";

const guezelwebTheme: DefaultTheme = {
  templateName: "guezelweb",

  fonts: {
    main: "'Orbitron', sans-serif",
    special: "'Orbitron', sans-serif",
    heading: "'Orbitron', sans-serif",
    body: "'Roboto', sans-serif",
    mono: "'Fira Code', monospace", // fallback
  },

  fontSizes: {
    base: "16px",
    xsmall: "12px",
    small: "14px",
    medium: "16px",
    large: "20px",
    xlarge: "26px",
    h1: "3rem",
    h2: "2.5rem",
    h3: "2rem",
    xs: "0.8rem",
    sm: "0.9rem",
    md: "1.2rem",
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
    normal: "1.2",
    relaxed: "1.4",
    loose: "1.6",
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
    pill: "20px", // btn-radius'a göre
    circle: "50%",
  },

  borders: {
    thin: "1px solid",
    thick: "2px solid",
  },

  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.08)",
    sm: "0 2px 4px rgba(0,0,0,0.12)",
    md: "0 4px 8px rgba(0,0,0,0.15)",
    lg: "0 8px 16px rgba(0,0,0,0.20)",
    xl: "0 16px 32px rgba(0,0,0,0.22)",
    form: "0 6px 20px rgba(25,214,227,0.07)", // highlight-color shadow
    button: "0 2px 10px rgba(25,214,227,0.09)", // highlight-color shadow
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
    background: "#1b2838", // --background-color
    backgroundSecondary: "#0d1f2d", // --secondary-color
    backgroundAlt: "#0d1f2d",
    sectionBackground: "#1b2838",
    inputBackground: "#1b2838",
    inputBackgroundFocus: "#0d1f2d",
    footerBackground: "#0d1f2d",
    warningBackground: "#fffbe6",

    text: "#fff", // --text-color
    textAlt: "#19d6e3", // --highlight-color (alternatif vurgu için)
    textSecondary: "#cccccc",
    textPrimary: "#fff",
    textMuted: "#888",
    textLight: "#19d6e3",
    textOnWarning: "#d95841",
    textOnSuccess: "#ffffff",
    textOnDanger: "#ffffff",

    title: "#19d6e3", // --highlight-color

    overlayStart: "rgba(25, 214, 227, 0.08)",
    overlayEnd: "rgba(25, 214, 227, 0.45)",
    overlayBackground: "rgba(0,0,0,0.75)",

    skeleton: "#213040",
    skeletonBackground: "#0d1f2d",

    primary: "#19d6e3", // --primary-color
    primaryLight: "#7af2ff",
    primaryHover: "#10a3b6",
    primaryDark: "#0d97a6",
    primaryTransparent: "rgba(25, 214, 227, 0.12)",

    secondary: "#52404b",
    secondaryLight: "#f3d9e5",
    secondaryHover: "#40333d",
    secondaryDark: "#32272a",
    secondaryTransparent: "rgba(82,64,75,0.1)",

    accent: "#19d6e3",
    accentHover: "#16b9c9",
    accentText: "#0d1f2d",

    border: "#19d6e3",
    borderLight: "#213040",
    borderBright: "#19d6e3",
    borderBrighter: "#7af2ff",
    borderHighlight: "#19d6e3",
    borderInput: "#19d6e3",

    card: "#22344a",
    cardBackground: "#22344a",

    buttonBackground: "#19d6e3", // --btn-bg-color
    buttonText: "#000000", // --btn-text-color
    buttonBorder: "#19d6e3",

    link: "#19d6e3",
    linkHover: "#10a3b6",

    hoverBackground: "#22344a",
    shadowHighlight: "0 0 0 3px rgba(25,214,227,0.22)",

    success: "#28a745",
    warning: "#ffc107",
    warningHover: "#e0a800",
    danger: "#dc3545",
    dangerHover: "#c82333",
    error: "#dc3545",
    info: "#17a2b8",
    muted: "#6c757d",
    disabled: "#404d5d",

    placeholder: "#888",
    inputBorder: "#19d6e3",
    inputBorderFocus: "#19d6e3",
    inputOutline: "#19d6e3",
    inputIcon: "#19d6e3",
    inputBackgroundLight: "#22344a",
    inputBackgroundSofter: "#22344a",

    tableHeader: "#22344a",
    tagBackground: "#22344a",
    grey: "#888",
    darkGrey: "#444",
    black: "#000000",
    white: "#fff",
    whiteColor: "#fff",
    darkColor: "#0d1f2d",
    disabledBg: "#333333",
    lightGrey: "#f7f7f7",
  },

  buttons: {
    primary: {
      background: "#19d6e3",
      backgroundHover:
        "radial-gradient(circle, rgba(64,64,64,0.6), rgba(0,0,0,0.8))",
      text: "#000000",
      textHover: "#19d6e3",
    },
    secondary: {
      background: "#22344a",
      backgroundHover: "#19d6e3",
      text: "#fff",
      textHover: "#0d1f2d",
    },
    danger: {
      background: "#dc3545",
      backgroundHover: "#c82333",
      text: "#fff",
      textHover: "#fff",
    },
  },

  inputs: {
    background: "#1b2838",
    border: "#19d6e3",
    borderFocus: "#19d6e3",
    text: "#fff",
    placeholder: "#888",
  },

  cards: {
    background: "#22344a",
    hoverBackground: "#0d1f2d",
    border: "#19d6e3",
    shadow: "0 4px 16px rgba(25,214,227,0.04)",
  },
};

export default guezelwebTheme;
