// src/styles/themes/antalyaTheme.ts

import { DefaultTheme } from "styled-components";

const antalyaTheme: DefaultTheme = {
  templateName: "antalya",

  fonts: {
    main: "'Montserrat', 'Segoe UI', Arial, sans-serif",
    special: "'Pacifico', 'Georgia', cursive",
    heading: "'Montserrat', 'Georgia', serif",
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
    lg: "16px",
    xl: "28px",
    pill: "9999px",
    circle: "50%",
  },

  borders: {
    thin: "1px solid",
    thick: "2px solid",
  },

  shadows: {
    xs: "0 1px 2px rgba(238,156,38,0.07)",
    sm: "0 2px 6px rgba(38,166,238,0.08)",
    md: "0 4px 12px rgba(255,180,0,0.11)",
    lg: "0 8px 24px rgba(72,98,137,0.11)",
    xl: "0 16px 32px rgba(0,0,0,0.14)",
    form: "0 6px 20px rgba(238,156,38,0.09)",
    button: "0 2px 10px rgba(38,166,238,0.07)",
  },

  transition: {
    fast: "0.2s cubic-bezier(.68,-0.55,.27,1.55)",
    normal: "0.3s cubic-bezier(.68,-0.55,.27,1.55)",
    slow: "0.5s cubic-bezier(.68,-0.55,.27,1.55)",
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
    hover: 0.94,
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
    background: "#fffefa",
    backgroundSecondary: "#fdf4e3",
    backgroundAlt: "#fff7d6",
    sectionBackground: "#fffbea",
    inputBackground: "#ffffff",
    inputBackgroundFocus: "#fff5e1",
    footerBackground: "#f8d87a",
    warningBackground: "#fffbe6",
    contentBackground: "#fff9e9",
    successBg: "#dff8e5",
    dangerBg: "#ffe3e3",

    achievementBackground: "#f8d87a",
    achievementGradientStart: "#ffbe0b",
    achievementGradientEnd: "#f8d87a",

    overlayStart: "rgba(255,236,130,0.3)",
    overlayEnd: "rgba(255,236,130,0.95)",
    overlayBackground: "rgba(0,0,0,0.5)",
    skeleton: "#ffeab8",
    skeletonBackground: "#ffeab8",

    text: "#3e2723",
    textAlt: "#222222",
    textSecondary: "#856020",
    textPrimary: "#b85c1f",
    textMuted: "#aa9067",
    textLight: "#eeddc7",
    title: "#e2942a",
    textOnWarning: "#b85c1f",
    textOnSuccess: "#ffffff",
    textOnDanger: "#ffffff",

    primary: "#e2942a",            // Akdeniz turuncusu
    primaryLight: "#ffeab8",
    primaryHover: "#ffbe0b",       // daha parlak güneş
    primaryDark: "#b85c1f",
    primaryTransparent: "rgba(226, 148, 42, 0.09)",

    secondary: "#19a6e3",          // Akdeniz mavisi (deniz ve gölge)
    secondaryLight: "#b0e6fb",
    secondaryHover: "#1096cc",
    secondaryDark: "#0b648a",
    secondaryTransparent: "rgba(25,166,227,0.12)",

    accent: "#ec4e20",             // Döner & Pizza için iştah açıcı kırmızı-turuncu
    accentHover: "#b32f00",
    accentText: "#ffffff",

    border: "#e2942a",
    borderLight: "#f9dcb1",
    borderBright: "#ffeab8",
    borderBrighter: "#fffefa",
    borderHighlight: "#19a6e3",
    borderInput: "#e2942a",

    card: "#fffdfa",
    cardBackground: "#fffefa",

    buttonBackground: "#e2942a",
    buttonText: "#ffffff",
    buttonBorder: "#b85c1f",

    link: "#19a6e3",
    linkHover: "#1096cc",

    hoverBackground: "#ffeab8",
    shadowHighlight: "0 0 0 3px rgba(255,190,11,0.13)",

    success: "#31b237",
    warning: "#ffbe0b",
    warningHover: "#e2942a",
    danger: "#ec4e20",
    dangerHover: "#b32f00",
    error: "#ec4e20",
    info: "#19a6e3",
    muted: "#aa9067",
    disabled: "#f7e5b7",

    placeholder: "#d0ae7c",
    inputBorder: "#e2942a",
    inputBorderFocus: "#19a6e3",
    inputOutline: "#e2942a",
    inputIcon: "#e2942a",
    inputBackgroundLight: "#fff5e1",
    inputBackgroundSofter: "#fdf4e3",

    tableHeader: "#fff7d6",
    tagBackground: "#ffeab8",
    grey: "#b5a077",
    darkGrey: "#3e2723",
    black: "#232323",
    white: "#ffffff",
    whiteColor: "#ffffff",
    darkColor: "#3e2723",
    disabledBg: "#f7e5b7",
    lightGrey: "#fdf4e3",
  },

  buttons: {
    primary: {
      background: "#e2942a",
      backgroundHover: "#ffbe0b",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    secondary: {
      background: "#19a6e3",
      backgroundHover: "#1096cc",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    success: {
      background: "#31b237",
      backgroundHover: "#27a330",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    warning: {
      background: "#ffbe0b",
      backgroundHover: "#e2942a",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    danger: {
      background: "#ec4e20",
      backgroundHover: "#b32f00",
      text: "#ffffff",
      textHover: "#ffffff",
    },
  },

  inputs: {
    background: "#fffefa",
    border: "#e2942a",
    borderFocus: "#19a6e3",
    text: "#3e2723",
    placeholder: "#d0ae7c",
  },

  cards: {
    background: "#fffdfa",
    hoverBackground: "#ffeab8",
    border: "#e2942a",
    shadow: "0 4px 16px rgba(255,190,11,0.10)",
  },
};

export default antalyaTheme;
