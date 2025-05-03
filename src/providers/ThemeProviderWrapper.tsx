"use client";

import React, { createContext, useContext } from "react";
import { ThemeProvider } from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { themes, ThemeName } from "@/styles/themes";
import { DefaultTheme } from "styled-components";
import { useThemeMode, ThemeMode } from "@/hooks/useThemeMode"; 

interface ThemeContextType {
  toggle: () => void;
  isDark: boolean;
  mode: ThemeMode;
}

export const ThemeContext = createContext<ThemeContextType>({
  toggle: () => {},
  isDark: false,
  mode: "light",
});

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const settings = useAppSelector((state) => state.setting.settings);

  const [themeMode, toggleThemeMode] = useThemeMode();
  const isDark = themeMode === "dark";


  if (!settings) {
    console.warn("Settings not loaded yet, fallback theme applied.");
  }
  
  const siteTemplateSetting = settings?.find((s) => s.key === "site_template");

  const selectedTemplate =
    (siteTemplateSetting?.value as ThemeName) || "classic";
  
  const templateTheme = themes[selectedTemplate] || themes["classic"];
  


  const finalTheme: DefaultTheme = {
    ...templateTheme,
    colors: {
      ...templateTheme.colors,
      background: isDark ? "#121212" : templateTheme.colors.background,
      text: isDark ? "#ffffff" : templateTheme.colors.text,
      backgroundSecondary: isDark ? "#1e1e1e" : templateTheme.colors.backgroundSecondary,
      backgroundAlt: isDark ? "#2c2c2c" : templateTheme.colors.backgroundAlt,
      sectionBackground: isDark ? "#2c2c2c" : templateTheme.colors.sectionBackground,
      inputBackground: isDark ? "#2c2c2c" : templateTheme.colors.inputBackground,
      textAlt: isDark ? "#bbbbbb" : templateTheme.colors.textAlt,
      textSecondary: isDark ? "#cccccc" : templateTheme.colors.textSecondary,
      textPrimary: isDark ? "#ffffff" : templateTheme.colors.textPrimary,
      primary: templateTheme.colors.primary,
      primaryLight: templateTheme.colors.primaryLight,
      primaryHover: templateTheme.colors.primaryHover,
      primaryDark: templateTheme.colors.primaryDark,
      accent: templateTheme.colors.accent,
      secondary: templateTheme.colors.secondary,
      border: isDark ? "#333333" : templateTheme.colors.border,
      cardBackground: isDark ? "#1e1e1e" : templateTheme.colors.cardBackground,
      buttonBackground: isDark ? "#333333" : templateTheme.colors.buttonBackground,
      buttonText: isDark ? "#ffffff" : templateTheme.colors.buttonText,
      link: templateTheme.colors.link,
      linkHover: templateTheme.colors.linkHover,
      hoverBackground: isDark ? "#2c2c2c" : templateTheme.colors.hoverBackground,
      whiteColor: templateTheme.colors.whiteColor,
      darkColor: templateTheme.colors.darkColor,
      success: templateTheme.colors.success,
      warning: templateTheme.colors.warning,
      danger: templateTheme.colors.danger,
      error: templateTheme.colors.error,
      info: templateTheme.colors.info,
      muted: templateTheme.colors.muted,
      disabled: templateTheme.colors.disabled,
    },
  };
  

  return (
    <ThemeContext.Provider value={{ toggle: toggleThemeMode, isDark, mode: themeMode }}>
      <ThemeProvider theme={finalTheme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}

// 🎯 Custom Hook
export const useThemeContext = () => useContext(ThemeContext);
