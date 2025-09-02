import { DefaultTheme } from "styled-components";

const antalya2Theme: DefaultTheme = {
  templateName: "antalya2",

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
    /* — Arka planlar (ılık krem tonları) — */
    background: "#fff6f0",
    backgroundSecondary: "#ffece2",
    backgroundAlt: "#ffffff",
    sectionBackground: "#ffffff",
    inputBackground: "#ffffff",
    inputBackgroundFocus: "#fff3cd",
    footerBackground: "#fff7e6",
    warningBackground: "#fffbe6",
    contentBackground: "#fff4f2",
    successBg: "#d1f5dd",
    dangerBg: "#ffe3e3",

    achievementBackground: "#ffe4dc",
    achievementGradientStart: "#ff8c5a",
    achievementGradientEnd: "#c9151e",

    overlayStart: "rgba(255,255,255,0.3)",
    overlayEnd: "rgba(255,255,255,0.95)",
    overlayBackground: "rgba(0,0,0,0.5)",
    skeleton: "#f0f0f0",
    skeletonBackground: "#f0f0f0",

    /* — Metinler — */
    text: "#111111",
    textAlt: "#222222",
    textSecondary: "#5f5f5f",
    textPrimary: "#111111",
    textMuted: "#888888",
    textLight: "#171717",
    title: "#111111",
    textOnWarning: "#6a3a00",
    textOnSuccess: "#0e5c2f",
    textOnDanger: "#7f121b",

    /* — Marka renkleri: Kırmızı & Sarı — */
    primary: "#C9151E",
    primaryLight: "#ffd6d5",
    primaryHover: "#A90F15",
    primaryDark: "#7A0F12",
    primaryTransparent: "rgba(201,21,30,0.12)",

    secondary: "#111111",
    secondaryLight: "#2b2b2b",
    secondaryHover: "#000000",
    secondaryDark: "#000000",
    secondaryTransparent: "rgba(0,0,0,0.08)",

    accent: "#FFC107",
    accentHover: "#E0A800",
    accentText: "#111111",

    border: "#f0d9d6",
    borderLight: "#fae6e3",
    borderBright: "#ffe6e1",
    borderBrighter: "#ffffff",
    borderHighlight: "#C9151E",
    borderInput: "#eed1cc",

    card: "#ffffff",
    cardBackground: "#ffffff",

    buttonBackground: "#C9151E",
    buttonText: "#ffffff",
    buttonBorder: "#C9151E",

    link: "#FFC107",
    linkHover: "#E0A800",

    hoverBackground: "#ffe9e6",
    shadowHighlight: "0 0 0 3px rgba(201,21,30,0.15)",

    success: "#28a745",
    warning: "#ffc107",
    warningHover: "#e0a800",
    danger: "#dc3545",
    dangerHover: "#c82333",
    error: "#dc3545",
    info: "#17a2b8",
    muted: "#6c757d",
    disabled: "#d6d6d6",

    placeholder: "#9e9e9e",
    inputBorder: "#eed1cc",
    inputBorderFocus: "#FFC107",
    inputOutline: "#FFC107",
    inputIcon: "#C9151E",
    inputBackgroundLight: "#fff3f1",
    inputBackgroundSofter: "#ffe9e6",

    tableHeader: "#fff1ef",
    tagBackground: "#ffe1d6",
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
    /* Primary = Sarı CTA */
    primary: {
      background: "#FFC107",
      backgroundHover: "#E0A800",
      text: "#111111",
      textHover: "#111111",
    },
    /* Secondary = Siyah buton */
    secondary: {
      background: "#111111",
      backgroundHover: "#000000",
      text: "#ffffff",
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
      text: "#111111",
      textHover: "#111111",
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
    border: "#eed1cc",
    borderFocus: "#FFC107",
    text: "#111111",
    placeholder: "#9e9e9e",
  },

  cards: {
    background: "#ffffff",
    hoverBackground: "#fff3f1",
    border: "#f3d9d6",
    shadow: "0 8px 24px rgba(201,21,30,0.06)",
  },
};

export default antalya2Theme;
