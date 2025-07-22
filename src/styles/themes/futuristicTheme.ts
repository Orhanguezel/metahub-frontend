// src/styles/themes/futuristicTheme.ts
import { DefaultTheme } from "styled-components";

const futuristicTheme: DefaultTheme = {
  templateName: "futuristic",

  fonts: {
    main: "'Montserrat', 'Segoe UI', Arial, sans-serif",
    special: "'Orbitron', 'Playfair Display', serif",
    heading: "'Orbitron', 'Playfair Display', serif",
    body: "'Montserrat', 'Segoe UI', Arial, sans-serif",
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
    xs: "0 1px 2px rgba(0,0,0,0.08)",
    sm: "0 1px 4px rgba(0,0,0,0.14)",
    md: "0 4px 8px rgba(0,0,0,0.18)",
    lg: "0 8px 16px rgba(0,0,0,0.22)",
    xl: "0 16px 32px rgba(0,0,0,0.28)",
    form: "0 6px 20px rgba(0,0,0,0.12)",
    button: "0 2px 10px rgba(0,0,0,0.11)",
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
    background: "#0D0D0D",
    backgroundSecondary: "#292929",
    backgroundAlt: "#1A1A1A",
    sectionBackground: "#1A1A1A",
    inputBackground: "#333333",
    inputBackgroundFocus: "#292929",
    footerBackground: "#1A1A1A",
    warningBackground: "#fffbe6",
    contentBackground: "#F6F7FA",
    successBg: "#d1f5dd",
    dangerBg: "#ffe3e3",
     achievementBackground: "#1A1A1A",
  achievementGradientStart: "#00FFF7",
  achievementGradientEnd: "#0bb6d6",
    
    overlayStart: "rgba(0, 0, 0, 0.8)",
    overlayEnd: "rgba(0, 0, 0, 0.95)",
    overlayBackground: "rgba(0, 0, 0, 0.5)",
    skeleton: "#444444",
    skeletonBackground: "#444444",
    text: "#E0E0E0",
    textAlt: "#E0E0E0",
    textSecondary: "#999999",
    textPrimary: "#E0E0E0",
    textMuted: "#888888",
    textLight: "#E0E0E0",
    title: "#00FFF7",
    textOnWarning: "#d95841",
    textOnSuccess: "#ffffff",
    textOnDanger: "#ffffff",

    primary: "#00FFF7",
    primaryLight: "#66fff9",
    primaryHover: "#00cccc",
    primaryDark: "#007777",
    primaryTransparent: "rgba(0, 255, 247, 0.1)",

    secondary: "#52404b",
    secondaryLight: "#f3d9e5",
    secondaryHover: "#40333d",
    secondaryDark: "#32272a",
    secondaryTransparent: "rgba(82,64,75,0.1)",

    accent: "#7D00FF",
    accentHover: "#9933FF",
    accentText: "#ffffff",

    border: "#444444",
    borderLight: "#333333",
    borderBright: "#888888",
    borderBrighter: "#292929",
    borderHighlight: "#00FFF7",
    borderInput: "#444444",

    card: "#1A1A1A",
    cardBackground: "#1A1A1A",

    buttonBackground: "#00FFF7",
    buttonText: "#0D0D0D",
    buttonBorder: "#00FFF7",

    link: "#7D00FF",
    linkHover: "#9933FF",

    hoverBackground: "#292929",
    shadowHighlight: "0 0 0 3px rgba(0,255,247,0.12)",

    success: "#28a745",
    warning: "#ffc107",
    warningHover: "#e0a800",
    danger: "#dc3545",
    dangerHover: "#c82333",
    error: "#dc3545",
    info: "#17a2b8",
    muted: "#6c757d",
    disabled: "#555555",

    placeholder: "#888888",
    inputBorder: "#444444",
    inputBorderFocus: "#00FFF7",
    inputOutline: "#00FFF7",
    inputIcon: "#00FFF7",
    inputBackgroundLight: "#333333",
    inputBackgroundSofter: "#292929",

    tableHeader: "#444444",
    tagBackground: "#444444",
    grey: "#888888",
    darkGrey: "#111111",
    black: "#000000",
    white: "#ffffff",
    whiteColor: "#ffffff",
    darkColor: "#000000",
    disabledBg: "#333333",
    lightGrey: "#f7f7f7",
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
    success: {
      background: "#28a745",
      backgroundHover: "#218838",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    warning: {
      background: "#ffc107",
      backgroundHover: "#e0a800",
      text: "#222B45",
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
    borderFocus: "#00FFF7",
    text: "#E0E0E0",
    placeholder: "#888888",
  },

  cards: {
    background: "#1A1A1A",
    hoverBackground: "#292929",
    border: "#444444",
    shadow: "0 4px 16px rgba(0,255,247,0.04)",
  },
};

export default futuristicTheme;
