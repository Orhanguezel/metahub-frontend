// src/styles/styled.d.ts
import "styled-components";
import { themes } from "./themes";

// Otomatik theme tipi çıkarımı:
type Theme = typeof themes.classic;


declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}


