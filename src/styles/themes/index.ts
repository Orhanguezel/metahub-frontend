// src/styles/themes/index.ts

import classicTheme from "./classicTheme";
import modernTheme from "./modernTheme";
import minimalTheme from "./minimalTheme";
import futuristicTheme from "./futuristicTheme";
import orangeTheme from "./orangeTheme";

// Yeni tema ekledikçe buraya import edip ekleyeceğiz.

export const themes = {
  classic: classicTheme,
  modern: modernTheme,
  minimal: minimalTheme,
  futuristic: futuristicTheme,
  orange: orangeTheme,
};

// 🎯 Type export (İleride lazım olacak!)
export type ThemeName = keyof typeof themes;
