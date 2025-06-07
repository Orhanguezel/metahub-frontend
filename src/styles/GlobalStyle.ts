// src/styles/GlobalStyle.ts
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  html, body {
    min-height: 100vh;
    width: 100vw;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.body || "'Rubik', 'Open Sans', sans-serif"};
    transition: background 0.2s, color 0.2s;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    margin: 0;
    padding: 0;
  }

  

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  a {
    color: ${({ theme }) => theme.colors.link};
    text-decoration: none;
    transition: color 0.18s;
    &:hover, &:focus {
      color: ${({ theme }) => theme.colors.linkHover};
      text-decoration: underline;
    }
  }

  ::selection {
    background: ${({ theme }) => theme.colors.primaryLight || "#cce5ff"};
    color: ${({ theme }) => theme.colors.textPrimary || "#222"};
  }
`;

export default GlobalStyle;
