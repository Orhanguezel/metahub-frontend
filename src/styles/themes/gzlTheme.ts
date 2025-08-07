// src/styles/themes/gzlTheme.ts

import { DefaultTheme } from "styled-components";

const gzlTheme: DefaultTheme = {
  templateName: "gzl",

  fonts: {
    main: "'Segoe UI', Arial, sans-serif",
    special: "'Georgia', serif",
    heading: "'Segoe UI', Arial, sans-serif",
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
    h1: "clamp(2.6rem, 7vw, 4.3rem)",
    h2: "2.3rem",
    h3: "1.8rem",
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
    xs: "0 1px 2px rgba(27,166,249,0.03)",
    sm: "0 1px 4px rgba(27,166,249,0.07)",
    md: "0 4px 8px rgba(27,166,249,0.10)",
    lg: "0 8px 16px rgba(27,166,249,0.13)",
    xl: "0 16px 32px rgba(27,166,249,0.18)",
    form: "0 6px 20px rgba(150,210,22,0.09)",
    button: "0 2px 10px rgba(27,166,249,0.11)",
  },

  transition: {
    fast: "0.18s cubic-bezier(.47,1.64,.41,.8)",
    normal: "0.3s cubic-bezier(.47,1.64,.41,.8)",
    slow: "0.5s cubic-bezier(.47,1.64,.41,.8)",
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
    disabled: 0.52,
    hover: 0.93,
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
    // Ana zeminler
    background: "#F8FBFC",
    backgroundSecondary: "#E6EEF1",
    backgroundAlt: "#ffffff",
    sectionBackground: "#fff",
    inputBackground: "#F8FBFC",
    inputBackgroundFocus: "#ECF4F7",
    footerBackground: "#E6EEF1",
    warningBackground: "#fffbe6",
    contentBackground: "#F8FBFC",
    successBg: "#E6F8DE",         // Hafif yeşil başarılı bildirim için
    dangerBg: "#FFD9D9",          // Hafif kırmızı hatada

    achievementBackground: "#E8F7FF",
    achievementGradientStart: "#1BA6F9",
    achievementGradientEnd: "#96D216",

    overlayStart: "rgba(27,166,249,0.05)",
    overlayEnd: "rgba(150,210,22,0.09)",
    overlayBackground: "rgba(27,166,249,0.12)",
    skeleton: "#EDF6FB",
    skeletonBackground: "#E6EEF1",

    // Yazılar
    text: "#22313F",                  // Koyu ana yazı
    textAlt: "#435055",               // Alternatif (buton secondary)
    textSecondary: "#7EA6B9",         // Açık gri
    textPrimary: "#22313F",
    textMuted: "#B5BFC5",
    textLight: "#FFF",
    title: "#1BA6F9",                 // Başlıklarda mavi
    textOnWarning: "#7C6D00",
    textOnSuccess: "#FFF",
    textOnDanger: "#FFF",

    // Ana renkler (Logo uyumlu)
    primary: "#1BA6F9",               // Canlı mavi (logo)
    primaryLight: "#E3F4FC",          // Açık mavi
    primaryHover: "#137CB8",          // Koyu mavi (hover)
    primaryDark: "#22313F",           // Koyu gri-mavi (logo yazı)
    primaryTransparent: "rgba(27,166,249,0.11)",

    // Yeşil (logo oval)
    secondary: "#96D216",             // Canlı yeşil
    secondaryLight: "#EAFAD2",        // Çok açık yeşil
    secondaryHover: "#7CB510",        // Koyu yeşil
    secondaryDark: "#6A950D",         // Daha koyu yeşil
    secondaryTransparent: "rgba(150,210,22,0.15)",

    accent: "#1BA6F9",
    accentHover: "#137CB8",
    accentText: "#FFF",

    border: "#B5BFC5",
    borderLight: "#E6EEF1",
    borderBright: "#D7EAF7",
    borderBrighter: "#FFF",
    borderHighlight: "#1BA6F9",
    borderInput: "#B5BFC5",

    card: "#FFF",
    cardBackground: "#FFF",

    buttonBackground: "#1BA6F9",
    buttonText: "#FFF",
    buttonBorder: "#1BA6F9",

    link: "#1BA6F9",
    linkHover: "#137CB8",

    hoverBackground: "#EAFAD2",       // Hoverda yeşil
    shadowHighlight: "0 0 0 3px rgba(150,210,22,0.14)",

    success: "#35B83A",               // Yeşil onay
    warning: "#ffc107",               // Sarı uyarı
    warningHover: "#e0a800",
    danger: "#dc3545",
    dangerHover: "#c82333",
    error: "#dc3545",
    info: "#1BA6F9",                  // Bilgilendirme için mavi
    muted: "#B5BFC5",
    disabled: "#C8C8C8",

    placeholder: "#B5BFC5",
    inputBorder: "#B5BFC5",
    inputBorderFocus: "#1BA6F9",
    inputOutline: "#1BA6F9",
    inputIcon: "#1BA6F9",
    inputBackgroundLight: "#E6EEF1",
    inputBackgroundSofter: "#F8FBFC",

    tableHeader: "#E6EEF1",
    tagBackground: "#E6EEF1",
    grey: "#B5BFC5",
    darkGrey: "#22313F",
    black: "#22313F",
    white: "#FFF",
    whiteColor: "#FFF",
    darkColor: "#22313F",
    disabledBg: "#C8C8C8",
    lightGrey: "#E6EEF1",
  },

  buttons: {
    primary: {
      background: "#1BA6F9",
      backgroundHover: "#137CB8",
      text: "#FFF",
      textHover: "#FFF",
    },
    secondary: {
      background: "#96D216",
      backgroundHover: "#7CB510",
      text: "#FFF",
      textHover: "#FFF",
    },
    success: {
      background: "#35B83A",
      backgroundHover: "#27982D",
      text: "#FFF",
      textHover: "#FFF",
    },
    warning: {
      background: "#ffc107",
      backgroundHover: "#e0a800",
      text: "#FFF",
      textHover: "#FFF",
    },
    danger: {
      background: "#dc3545",
      backgroundHover: "#c82333",
      text: "#FFF",
      textHover: "#FFF",
    },
  },

  inputs: {
    background: "#FFF",
    border: "#B5BFC5",
    borderFocus: "#1BA6F9",
    text: "#22313F",
    placeholder: "#B5BFC5",
  },

  cards: {
    background: "#FFF",
    hoverBackground: "#EAFAD2",
    border: "#B5BFC5",
    shadow: "0 4px 16px rgba(27,166,249,0.09)",
  },
};

export default gzlTheme;
