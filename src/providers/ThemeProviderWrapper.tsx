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

export default function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = useAppSelector((state) => state.setting.settings);

  const [themeMode, toggleThemeMode] = useThemeMode();
  const isDark = themeMode === "dark";

  const siteTemplateSetting = settings?.find((s) => s.key === "site_template");
  const selectedTemplate: ThemeName =
    (siteTemplateSetting?.value as ThemeName) || "anastasia";
  const templateTheme = themes[selectedTemplate] || themes["anastasia"];

  // Dark Mode pastel override'ları (yalnızca renkler!)
  const darkOverrides: Partial<DefaultTheme["colors"]> = {
    background: "#18121a",
    backgroundSecondary: "#24162b",
    backgroundAlt: "#2d1a32",
    sectionBackground: "#22132b",
    cardBackground: "#24162b",
    text: "#fff",
    textAlt: "#d9cadd",
    textSecondary: "#a892b7",
    textPrimary: "#fff",
    border: "#302038",
    inputBackground: "#2d1a32",
    tableHeader: "#22132b",
    hoverBackground: "#25142a",
    skeleton: "#3c2452",
    skeletonBackground: "#25142a",
    footerBackground: "#24162b",
  };

  const finalTheme: DefaultTheme = isDark
    ? {
        ...templateTheme,
        colors: { ...templateTheme.colors, ...darkOverrides },
        buttons: { ...templateTheme.buttons },
        inputs: { ...templateTheme.inputs },
        cards: { ...templateTheme.cards },
        fonts: { ...templateTheme.fonts },
        fontSizes: { ...templateTheme.fontSizes },
        fontWeights: { ...templateTheme.fontWeights },
        lineHeights: { ...templateTheme.lineHeights },
        spacings: { ...templateTheme.spacings },
        radii: { ...templateTheme.radii },
        borders: { ...templateTheme.borders },
        shadows: { ...templateTheme.shadows },
        transition: { ...templateTheme.transition },
        durations: { ...templateTheme.durations },
        layout: { ...templateTheme.layout },
        zIndex: { ...templateTheme.zIndex },
        opacity: { ...templateTheme.opacity },
        breakpoints: { ...templateTheme.breakpoints },
        media: { ...templateTheme.media },
        templateName: templateTheme.templateName,
      }
    : templateTheme;

  return (
    <ThemeContext.Provider
      value={{ toggle: toggleThemeMode, isDark, mode: themeMode }}
    >
      <ThemeProvider theme={finalTheme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => useContext(ThemeContext);
