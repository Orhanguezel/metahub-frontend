import { sharedTheme } from "@/styles/sharedTheme";

const futuristicTheme = {
  templateName: "futuristic",
  ...sharedTheme,
  colors: {
    background: "#0D0D0D",
    backgroundSecondary: "#292929",
    backgroundAlt: "#1A1A1A",
    sectionBackground: "#1A1A1A",
    text: "#E0E0E0",
    textAlt: "#E0E0E0",
    textSecondary: "#999999",
    primary: "#00FFF7",
    primaryHover: "#00cccc",
    primaryDark: "#007777",
    accent: "#7D00FF",
    secondary: "#888",
    border: "#444",
    cardBackground: "#1A1A1A",
    buttonBackground: "#00FFF7",
    buttonText: "#0D0D0D",
    link: "#7D00FF",
    linkHover: "#9933FF",
    hoverBackground: "#292929",
    whiteColor: "#ffffff",
    darkColor: "#000000",
  },
  buttons: {
    primary: {
      background: "#00FFF7",
      backgroundHover: "#00cccc",
      text: "#0D0D0D",
    },
    danger: {
      background: "#ff0033",
      backgroundHover: "#cc0022",
      text: "#ffffff",
    },
  },
  inputs: {
    background: "#333333",
    border: "#444444",
    text: "#E0E0E0",
  },
  cards: {
    background: "#1A1A1A",
    hoverBackground: "#292929",
  },
};

export default futuristicTheme;
