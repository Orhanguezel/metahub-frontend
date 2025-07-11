// src/hooks/useThemeMode.ts
import { useState, useEffect } from "react";

export type ThemeMode = "light" | "dark";

export function useThemeMode(): [ThemeMode, () => void] {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme_mode");
      if (stored === "dark" || stored === "light") {
        setMode(stored);
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setMode(prefersDark ? "dark" : "light");
      }
    }
  }, []);

  const toggle = () => {
    const newMode: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme_mode", newMode);
    }
  };

  return [mode, toggle];
}
