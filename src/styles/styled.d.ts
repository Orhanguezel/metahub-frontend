// src/styles/styled.d.ts
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    templateName: string;
    colors: {
      background: string;
      backgroundSecondary: string;
      backgroundAlt: string;
      sectionBackground: string;
      inputBackground: string;
      text: string;
      textAlt: string;
      textSecondary: string;
      textPrimary: string;
      primary: string;
      primaryLight: string;
      primaryHover: string;
      primaryDark: string;
      accent: string;
      secondary: string;
      border: string;
      cardBackground: string;
      buttonBackground: string;
      buttonText: string;
      link: string;
      linkHover: string;
      hoverBackground: string;
      whiteColor: string;
      darkColor: string;
      success: string;
      warning: string;
      danger: string;
      error: string;
      info: string;
      muted: string;
      disabled: string;
    };
    buttons: {
      primary: {
        background: string;
        backgroundHover: string;
        text: string;
        textHover: string;
      };
      secondary: {
        background: string;
        backgroundHover: string;
        text: string;
        textHover: string;
      };
      danger: {
        background: string;
        backgroundHover: string;
        text: string;
        textHover: string;
      };
    };
    inputs: {
      background: string;
      border: string;
      text: string;
      placeholder: string;
    };
    cards: {
      background: string;
      hoverBackground: string;
    };
    // Shared theme props:
    fonts: Record<string, string>;
    fontSizes: Record<string, string>;
    lineHeights: Record<string, string>;
    fontWeights: Record<string, number>;
    spacing: Record<string, string>;
    radii: Record<string, string>;
    borders: Record<string, string>;
    shadows: Record<string, string>;
    transition: Record<string, string>;
    durations: Record<string, string>;
    layout: Record<string, string>;
    zIndex: Record<string, number>;
    opacity: Record<string, number>;
    media: Record<string, string>;
  }
}
