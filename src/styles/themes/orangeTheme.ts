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
    form: "0 6px 20px rgba(249, 115, 22, 0.07)",
    button: "0 2px 10px rgba(249, 115, 22, 0.05)",
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
    retina: "@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)",
  },

  colors: {
    // BACKGROUND
    background: "#fff8f2", // çok hafif sıcak bir beyaz
    backgroundSecondary: "#fff1e5",
    backgroundAlt: "#fff7ed",
    sectionBackground: "#fff5eb",
    inputBackground: "#fff",
    inputBackgroundFocus: "#fff7ed",
    footerBackground: "#fff7ed",
    warningBackground: "#fffbe6",
    contentBackground: "#fffdfb",
    successBg: "#d1f5dd",
    dangerBg: "#ffe3e3",

    // ACHIEVEMENT / BANNER
    achievementBackground: "#fff5eb", // çok açık turuncu (badge/banner kutuları)
    achievementGradientStart: "#ffd8b2", // açık pastel turuncu
    achievementGradientEnd: "#fb923c",   // ana soft turuncu (primaryLight)

    // TEXT
    text: "#262626", // vurgulu koyu
    textAlt: "#EA580C", // canlı turuncu (hover/alt başlıklar)
    textSecondary: "#9a6841", // kahverengi-altın arası pastel
    textPrimary: "#262626",
    textMuted: "#bfa375", // alt ton soft
    textLight: "#fb923c", // pastel turuncu
    textOnWarning: "#d95841",
    textOnSuccess: "#ffffff",
    textOnDanger: "#ffffff",

    // HEADLINE / PRIMARY
    title: "#f97316", // ana turuncu

    // OVERLAYS & SKELETONS
    overlayStart: "rgba(255, 247, 237, 0.65)",
    overlayEnd: "rgba(255, 247, 237, 0.95)",
    overlayBackground: "rgba(0,0,0,0.13)",

    skeleton: "#ffe3c2",
    skeletonBackground: "#fff7ed",

    // PRIMARY / SECONDARY / ACCENT
    primary: "#f97316",        // ana turuncu
    primaryLight: "#fb923c",   // açık turuncu
    primaryHover: "#ea580c",   // canlı/koyu turuncu (hover)
    primaryDark: "#c2410c",    // daha koyu turuncu
    primaryTransparent: "rgba(249, 115, 22, 0.10)",

    secondary: "#eab308",        // amber (tamamlayıcı accent)
    secondaryLight: "#fde68a",   // açık amber
    secondaryHover: "#d97706",   // koyu amber (hover)
    secondaryDark: "#b45309",    // koyu sarı
    secondaryTransparent: "rgba(234, 179, 8, 0.10)",

    accent: "#f97316",
    accentHover: "#fb923c",
    accentText: "#fff",

    // BORDER
    border: "#fed7aa",
    borderLight: "#ffedd5",
    borderBright: "#fb923c",
    borderBrighter: "#ffe3c2",
    borderHighlight: "#f97316",
    borderInput: "#f97316",

    // CARD
    card: "#fff",
    cardBackground: "#fff",

    // BUTTON
    buttonBackground: "#f97316",
    buttonText: "#fff",
    buttonBorder: "#f97316",

    // LINKS
    link: "#f97316",
    linkHover: "#ea580c",

    // HOVER
    hoverBackground: "#fff7ed",
    shadowHighlight: "0 0 0 3px rgba(249, 115, 22, 0.15)",

    // FEEDBACK / STATUS
    success: "#28a745",
    warning: "#ffc107",
    warningHover: "#e0a800",
    danger: "#dc3545",
    dangerHover: "#c82333",
    error: "#dc3545",
    info: "#17a2b8",
    muted: "#bfa375",
    disabled: "#f4e0d9",

    // PLACEHOLDER / INPUT
    placeholder: "#bfa375",
    inputBorder: "#fed7aa",
    inputBorderFocus: "#f97316",
    inputOutline: "#f97316",
    inputIcon: "#ea580c",
    inputBackgroundLight: "#fffdfb",
    inputBackgroundSofter: "#fff1e5",

    // TABLE / TAG
    tableHeader: "#fff5eb",
    tagBackground: "#ffe3c2",

    // GREY/SOLID/BLACK
    grey: "#bfa375",
    darkGrey: "#5d3a0a",
    black: "#000",
    white: "#fff",
    whiteColor: "#fff",
    darkColor: "#262626",
    disabledBg: "#ffe3c2",
    lightGrey: "#fff5eb",
  },

  buttons: {
    primary: {
      background: "#f97316",
      backgroundHover: "#ea580c",
      text: "#fff",
      textHover: "#fff",
    },
    secondary: {
      background: "#fde68a",
      backgroundHover: "#fee2b3",
      text: "#b45309",
      textHover: "#ea580c",
    },
    success: {
      background: "#28a745",
      backgroundHover: "#218838",
      text: "#fff",
      textHover: "#fff",
    },
    warning: {
      background: "#ffc107",
      backgroundHover: "#e0a800",
      text: "#fff",
      textHover: "#fff",
    },
    danger: {
      background: "#dc3545",
      backgroundHover: "#c82333",
      text: "#fff",
      textHover: "#fff",
    },
  },

  inputs: {
    background: "#fff",
    border: "#fed7aa",
    borderFocus: "#f97316",
    text: "#262626",
    placeholder: "#bfa375",
  },

  cards: {
    background: "#fff",
    hoverBackground: "#fff7ed",
    border: "#fed7aa",
    shadow: "0 4px 16px rgba(249, 115, 22, 0.04)",
  },
};

export default orangeTheme;
