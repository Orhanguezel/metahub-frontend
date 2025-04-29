// src/styles/themes/sharedTheme.ts

export const sharedTheme = {
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Raleway', sans-serif",
    mono: "'Fira Code', monospace",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "3rem",
  },
  lineHeights: {
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
  fontWeights: {
    thin: 100,
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
  },
  spacing: {
    xs: "0.25rem",   // 4px
    sm: "0.5rem",    // 8px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
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
    xs: "0 1px 2px rgba(0,0,0,0.05)",
    sm: "0 1px 3px rgba(0,0,0,0.1)",
    md: "0 4px 6px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
    xl: "0 20px 25px rgba(0,0,0,0.1)",
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
    containerWidth: "1400px",
    sectionSpacing: "4rem",
  },
  zIndex: {
    dropdown: 1000,
    modal: 1100,
    overlay: 1200,
    tooltip: 1300,
  },
  opacity: {
    disabled: 0.5,
    hover: 0.8,
  },
  media: {
    xsmall: "@media (max-width: 480px)",  // 📱 küçük telefonlar
    small: "@media (max-width: 768px)",   // 📱 tablet dikey
    medium: "@media (max-width: 1024px)", // 💻 küçük laptop
    large: "@media (max-width: 1440px)",  // 🖥️ normal ekran
    xlarge: "@media (min-width: 1441px)", // 🖥️ büyük ekran
  },
};
