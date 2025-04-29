"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { usePathname } from "next/navigation";
import { themes, ThemeName } from "@/styles/themes";

interface ThemeContextType {
  toggle: () => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  toggle: () => {},
  isDark: false,
});

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const settings = useAppSelector((state) => state.setting.settings);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);


  // 🎯 Dark Mode Kontrolü: `theme_mode` key'inden alınır, yoksa varsayılan belirlenir
  const themeModeSetting = settings.find((s) => s.key === "theme_mode");
  const preferredMode = typeof themeModeSetting?.value === "string" ? themeModeSetting.value : null;

  useEffect(() => {
    if (preferredMode === "dark") {
      setIsDark(true);
    } else if (preferredMode === "light") {
      setIsDark(false);
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    setMounted(true);
  }, [preferredMode]);

  if (!mounted) return null;

  // 🎨 Tema Template Kontrolü (örneğin: classic, modern, minimal...)
  const siteTemplateSetting = settings.find((s) => s.key === "site_template");
  const selectedTemplate = (siteTemplateSetting?.value as ThemeName) || "classic";
  const templateTheme = themes[selectedTemplate] || themes["classic"];

  // Final Tema
  const finalTheme = {
    ...templateTheme,
    background: isDark ? "#121212" : templateTheme.background,
    text: isDark ? "#ffffff" : templateTheme.text,
  };

  const toggle = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ toggle, isDark }}>
      <ThemeProvider theme={finalTheme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}

// 🎯 Custom Hook
export const useThemeContext = () => useContext(ThemeContext);
