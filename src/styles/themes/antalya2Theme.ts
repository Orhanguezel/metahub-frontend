import { DefaultTheme } from "styled-components";

const antalya2Theme: DefaultTheme = {
  templateName: "antalya2",

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
    xs: "0 1px 2px rgba(0,0,0,0.04)",
    sm: "0 2px 6px rgba(0,0,0,0.06)",
    md: "0 4px 12px rgba(209,39,39,0.12)",
    lg: "0 8px 24px rgba(0,0,0,0.14)",
    xl: "0 16px 32px rgba(0,0,0,0.18)",
    form: "0 6px 20px rgba(0,0,0,0.08)",
    button: "0 2px 10px rgba(0,0,0,0.10)",
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
    /* ——— Tema ana tonları ——— */
    primary: "#F3CB00",                // sarı (vurgular)
    primaryLight: "#FFE567",
    primaryHover: "#D6B200",
    primaryDark: "#B99300",
    primaryTransparent: "rgba(243,203,0,0.10)",

    secondary: "#D12727",              // kırmızı (ağırlık)
    secondaryLight: "#E24D4D",
    secondaryHover: "#B11F1F",
    secondaryDark: "#8F1717",
    secondaryTransparent: "rgba(209,39,39,0.12)",

    accent: "#000000",
    accentHover: "#111111",
    accentText: "#ffffff",

    /* ——— Arkaplanlar ——— */
    background: "#FFFCF6",             // açık krem
    backgroundSecondary: "#D12727",    // kırmızı blok alanlar
    backgroundAlt: "#111111",
    sectionBackground: "#D12727",
    contentBackground: "#FFFCF6",
    footerBackground: "#D12727",

    /* ——— Input/Kontrol ——— */
    inputBackground: "#FFF9E0",        // erişilebilir açık arka plan
    inputBackgroundFocus: "#FFF6CC",
    inputBorder: "#F3CB00",
    inputBorderFocus: "#F3CB00",
    inputOutline: "#D12727",
    inputIcon: "#D12727",
    inputBackgroundLight: "#FFF9E0",
    inputBackgroundSofter: "#FFF6CC",
    placeholder: "#8A6F6F",

    /* ——— Yazılar ——— */
    text: "#1E1E1E",                   // varsayılan metin (açık zeminde)
    textAlt: "#FFF9EC",                // kırmızı zeminde kullanılacak
    textSecondary: "#4A3E3E",
    textPrimary: "#D12727",            // başlık/aksan metin
    textMuted: "#8F8F8F",
    textLight: "#ffffff",
    title: "#D12727",
    textOnWarning: "#3a2e00",
    textOnSuccess: "#0a3d13",
    textOnDanger: "#ffffff",

    /* ——— Ögeler/çerçeveler ——— */
    border: "#D12727",
    borderLight: "#E6B8B8",
    borderBright: "#FF9D9D",
    borderBrighter: "#FFC1C1",
    borderHighlight: "#F3CB00",
    borderInput: "#F3CB00",

    card: "#ffffff",
    cardBackground: "#ffffff",

    /* ——— Buton (genel fallback) ——— */
    buttonBackground: "#D12727",
    buttonText: "#ffffff",
    buttonBorder: "#B11F1F",

    /* ——— Linkler ——— */
    link: "#D12727",
    linkHover: "#B11F1F",

    /* ——— Hover/Focus highlight ——— */
    hoverBackground: "#FFF3B2",
    shadowHighlight: "0 0 0 3px rgba(243,203,0,0.16)",

    /* ——— Durum renkleri ——— */
    success: "#31b237",
    warning: "#F3CB00",
    warningHover: "#D6B200",
    danger: "#ec4e20",
    dangerHover: "#b32f00",
    error: "#ec4e20",
    info: "#19a6e3",
    muted: "#b69e9e",
    disabled: "#f1dbd7",

    /* ——— Diğer ——— */
    tableHeader: "#FFF7D9",
    tagBackground: "#FFF3B2",
    grey: "#b5a9a9",
    darkGrey: "#3a2f2f",
    black: "#000000",
    white: "#ffffff",
    whiteColor: "#ffffff",
    darkColor: "#000000",
    disabledBg: "#f1dbd7",
    lightGrey: "#FFF6CC",

    /* skeleton & overlay */
    skeleton: "#FFF3B2",
    skeletonBackground: "#FFF3B2",
    overlayStart: "rgba(255,255,255,0.15)",
    overlayEnd: "rgba(255,255,255,0.95)",
    overlayBackground: "rgba(0,0,0,0.5)",

    /* uyarı arka planları */
    warningBackground: "#fffbe6",
    successBg: "#dff8e5",
    dangerBg: "#ffe3e3",

    /* “achievement” degrade */
    achievementBackground: "#ffe38f",
    achievementGradientStart: "#F3CB00",
    achievementGradientEnd: "#ffd866",
  },

  buttons: {
    primary: {
      background: "#D12727",
      backgroundHover: "#B11F1F",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    secondary: {
      background: "#F3CB00",
      backgroundHover: "#D6B200",
      text: "#000000",
      textHover: "#000000",
    },
    success: {
      background: "#31b237",
      backgroundHover: "#27a330",
      text: "#ffffff",
      textHover: "#ffffff",
    },
    warning: {
      background: "#F3CB00",
      backgroundHover: "#D6B200",
      text: "#000000",
      textHover: "#000000",
    },
    danger: {
      background: "#ec4e20",
      backgroundHover: "#b32f00",
      text: "#ffffff",
      textHover: "#ffffff",
    },
  },

  inputs: {
    background: "#FFF9E0",
    border: "#F3CB00",
    borderFocus: "#F3CB00",
    text: "#1e1e1e",
    placeholder: "#8A6F6F",
  },

  cards: {
    background: "#ffffff",
    hoverBackground: "#FFF7D9",
    border: "#FFE06A",
    shadow: "0 4px 16px rgba(209,39,39,0.10)",
  },
};

export default antalya2Theme;
