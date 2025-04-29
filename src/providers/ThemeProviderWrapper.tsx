"use client";

import { ThemeProvider } from "styled-components";
import { createContext, useContext, useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { usePathname } from "next/navigation";
import { themes } from "@/styles/themes";
import { ThemeName } from "@/styles/themes";

interface ThemeContextType {
  toggle: () => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  toggle: () => {},
  isDark: false,
});

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const settings = useAppSelector((state) => state.setting.settings); // ✅ Doğrusu bu!
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🎯 Admin path kontrolü
  const isAdminPath = pathname.startsWith("/admin");

  // 🌗 Toggle dark/light mode
  const toggle = () => setIsDark((prev) => !prev);

  // 🧠 İlk yüklemede dark-light ayarı yap
  useEffect(() => {
    if (isAdminPath) {
      setIsDark(true);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
    setMounted(true);
  }, [pathname]);

  if (!mounted) return null; // SSR uyumu için

  // 🛠️ Temayı settings'ten seçelim
  const templateSetting = settings.find((s) => s.key === "theme_mode");
  const selectedTemplate = (templateSetting?.value || "classic") as ThemeName;

  const templateTheme = themes[selectedTemplate] || themes["classic"];

  const finalTheme = {
    ...templateTheme,
    background: isDark ? "#121212" : templateTheme.background,
    text: isDark ? "#ffffff" : templateTheme.text,
  };

  return (
    <ThemeContext.Provider value={{ toggle, isDark }}>
      <ThemeProvider theme={finalTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

// 🎯 ThemeContext Hook
export const useThemeContext = () => useContext(ThemeContext);
