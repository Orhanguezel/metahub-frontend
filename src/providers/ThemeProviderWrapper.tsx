"use client";

import { ThemeProvider } from "styled-components";
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import { usePathname } from "next/navigation";
import { themes, ThemeName } from "@/styles/themes"; // 🎯 Temalar ve tip
import React from "react";

interface ThemeContextType {
  toggle: () => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  toggle: () => {},
  isDark: false,
});

export default function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { settings } = useAppSelector((state) => state.settings);

  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Admin path'lerini kontrol et
  const isAdminPath = ["/admin", "/dashboard", "/panel"].some((path) => pathname.startsWith(path));

  // Kullanıcının Dark/Light tercihini değiştiren fonksiyon
  const toggle = () => setIsDark((prev) => !prev);

  useEffect(() => {
    if (isAdminPath) {
      setIsDark(true);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
    setMounted(true);
  }, [pathname]);

  if (!mounted) return null; // SSR için önlem

  // ➡️ Seçili Template (site_template setting'den)
  const templateSetting = settings.find((s) => s.key === "site_template");
  const selectedTemplate = (templateSetting?.value || "classic") as ThemeName;

  // ➡️ Temayı seçelim
  const templateTheme = themes[selectedTemplate] || themes["classic"];

  // ➡️ Dark Mode aktifse bazı alanları override edelim
  const finalTheme = {
    ...templateTheme,
    colors: {
      ...templateTheme.colors,
      background: isDark ? "#121212" : templateTheme.colors.background,
      backgroundSecondary: isDark ? "#1E1E1E" : templateTheme.colors.backgroundSecondary,
      text: isDark ? "#ffffff" : templateTheme.colors.text,
      textSecondary: isDark ? "#aaaaaa" : templateTheme.colors.textSecondary,
      cardBackground: isDark ? "#1E1E1E" : templateTheme.colors.cardBackground,
      inputBackground: isDark ? "#333333" : templateTheme.colors.inputBackground,
    },
  };

  return (
    <ThemeContext.Provider value={{ toggle, isDark }}>
      <ThemeProvider theme={finalTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

// 🎯 Kullanmak isteyenler için küçük hook
export const useThemeContext = () => useContext(ThemeContext);
