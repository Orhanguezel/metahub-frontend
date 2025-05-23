import { sharedTheme } from "@/styles/sharedTheme";

const ensotekTheme = {
  templateName: "ensotek",
  ...sharedTheme,
  colors: {
    background: "#FFF8F8",  // Çok açık pembe / beyaza yakın
    backgroundSecondary: "#f5f5f5",  // Açık bej - section bg
    backgroundAlt: "#FFFFFF",
    sectionBackground: "#FFFFFF",
    inputBackground: "#FFFFFF",
    footerBackground: "#F0F0F0",  // Açık gri
    overlayStart: "rgba(255, 255, 255, 0.3)",
    overlayEnd: "rgba(255, 255, 255, 0.95)",
    text: "#0118D8",  // Saf mavi - ana yazı rengi
    textAlt: "#1B56FD",  // Parlak mavi
    textSecondary: "#6c757d",
    textPrimary: "#0118D8",
    textMuted: "#7A8A92",
    primary: "#0118D8",  // Ana renk - Saf Mavi
    primaryLight: "#1B56FD",  // Parlak mavi - light
    primaryHover: "#0014A8",  // Saf mavinin biraz daha koyusu
    primaryDark: "#001080",   // Daha koyu hover tonu
    primaryTransparent: "rgba(1, 24, 216, 0.1)",
    skeleton: "#f0f0f0",
    overlayBackground: "rgba(0, 0, 0, 0.5)",
    accent: "#1B56FD",  // Vurgu için parlak mavi
    secondary: "#E9DFC3",  // Açık bej (nötr ikinci renk)
    border: "#E9DFC3",
    cardBackground: "#FFFFFF",
    card: "#FFFFFF",
    buttonBackground: "#0118D8",
    buttonText: "#FFFFFF",
    link: "#1B56FD",
    linkHover: "#0014A8",
    hoverBackground: "#E9DFC3",
    whiteColor: "#FFFFFF",
    darkColor: "#0118D8",
    success: "#28C76F",  // Canlı yeşil (standard success)
    warning: "#FFC107",  // Soft sarı
    danger: "#FF6B6B",   // Hata rengi
    dangerHover: "#E53935",
    error: "#FF6B6B",
    info: "#1B56FD",
    muted: "#7A8A92",
    disabled: "#D6D6D6",
    placeholder: "#7A8A92",
    tableHeader: "#F0F0F0", 
    tagBackground: "#E9DFC3",  // Açık bej
    skeletonBackground: "#F0F0F0",  // Açık gri
  },
  buttons: {
    primary: {
      background: "#0118D8",
      backgroundHover: "#0014A8",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
    secondary: {
      background: "#E9DFC3",
      backgroundHover: "#DCD2B4",
      text: "#0118D8",
      textHover: "#0118D8",
    },
    danger: {
      background: "#FF6B6B",
      backgroundHover: "#E53935",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
  },
  inputs: {
    background: "#FFFFFF",
    border: "#E9DFC3",
    text: "#0118D8",
    placeholder: "#7A8A92",
  },
  cards: {
    background: "#FFFFFF",
    hoverBackground: "#F0F0F0",
  },
};

export default ensotekTheme;
