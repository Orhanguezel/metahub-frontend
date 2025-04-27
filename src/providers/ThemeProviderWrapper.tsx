"use client";

import { ThemeProvider } from "styled-components";
import { useEffect, useState } from "react";
import { lightTheme, darkTheme } from "@/styles/theme";
import React from "react";

export const ThemeContext = React.createContext({
  toggle: () => {},
  isDark: false,
});

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const toggle = () => setIsDark((prev) => !prev);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
    setMounted(true);
  }, []);

  if (!mounted) return null; // SSR uyumu için çözüm

  return (
    <ThemeContext.Provider value={{ toggle, isDark }}>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
