// src/styles/themes/anastasiaTheme.ts
import { DefaultTheme } from "styled-components";

const anastasiaTheme: DefaultTheme = {
  templateName: "anastasia",

  fonts: {
    main: "'Raleway', sans-serif",
    special: "'Playfair Display', serif",
    heading: "'Playfair Display', serif",
    body: "'Raleway', sans-serif",
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
    background: "#ffffff",
    backgroundSecondary: "#fff0f6",
    backgroundAlt: "#fdf5f9",
    sectionBackground: "#fff7fb",
    inputBackground: "#ffffff",
    inputBackgroundFocus: "#fff7fb",
    footerBackground: "#fff0f6",
    warningBackground: "#fffbe6",

    text: "#40333d",
    textAlt: "#52404b",
    textSecondary: "#8f7481",
    textPrimary: "#40333d",
    textMuted: "#a3939b",
    textLight: "#5d4855",
    textOnWarning: "#d95841",
    textOnSuccess: "#ffffff",
    textOnDanger: "#ffffff",

    title: "#e5549c",

    overlayStart: "rgba(255, 240, 246, 0.6)",
    overlayEnd: "rgba(255, 240, 246, 0.95)",
    overlayBackground: "rgba(0, 0, 0, 0.3)",
    skeleton: "#fbeaf0",
    skeletonBackground: "#fdf5f9",

    primary: "#e5549c",
    primaryLight: "#fbcbe4",
    primaryHover: "#d7428a",
    primaryDark: "#b53075",
    primaryTransparent: "rgba(229,84,156,0.1)",

    secondary: "#52404b",
    secondaryLight: "#f3d9e5",
    secondaryHover: "#40333d",
    secondaryDark: "#32272a",
    secondaryTransparent: "rgba(82,64,75,0.1)",

    accent: "#d95841",
    accentHover: "#c94b35",
    accentText: "#ffffff",

    border: "#f1d6e1",
    borderLight: "#fbeaf0",
    borderBright: "#e6c2d3",
    borderBrighter: "#fdf3f7",
    borderHighlight: "#e5549c",
    borderInput: "#e6c2d3",

    card: "#ffffff",
    cardBackground: "#ffffff",

    buttonBackground: "#e5549c",
    buttonText: "#ffffff",
    buttonBorder: "#e5549c",

    link: "#e5549c",
    linkHover: "#d7428a",

    hoverBackground: "#fbeaf0",
    shadowHighlight: "0 0 0 3px rgba(229,84,156,0.3)",

    success: "#28a745",
    warning: "#ffc107",
    warningHover: "#e0a800",
    danger: "#dc3545",
    dangerHover: "#c82333",
    error: "#dc3545",
    info: "#17a2b8",
    muted: "#6c757d",
    disabled: "#f2e0e9",

    placeholder: "#a3939b",
    inputBorder: "#e6c2d3",
    inputBorderFocus: "#e5549c",
    inputOutline: "#e5549c",
    inputIcon: "#e5549c",
    inputBackgroundLight: "#fff7fb",
    inputBackgroundSofter: "#fff0f6",

    tableHeader: "#fff7fb",
    tagBackground: "#fbeaf0",
    grey: "#8f7481",
    darkGrey: "#52404b",
    black: "#000000",
    white: "#ffffff",
    whiteColor: "#ffffff",
    darkColor: "#40333d",
    disabledBg: "#d6d6d6",
    lightGrey: "#f7f7f7",
  },

  buttons: {
    primary: {
      background: "#e5549c",
      backgroundHover: "#d7428a",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    secondary: {
      background: "#fbeaf0",
      backgroundHover: "#f3d9e5",
      text: "#52404b",
      textHover: "#40333d",
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
    border: "#e6c2d3",
    borderFocus: "#e5549c",
    text: "#40333d",
    placeholder: "#a3939b",
  },

  cards: {
    background: "#ffffff",
    hoverBackground: "#fbeaf0",
    border: "#f1d6e1",
    shadow: "0 4px 16px rgba(0,0,0,0.04)",
  },
};

export default anastasiaTheme;
