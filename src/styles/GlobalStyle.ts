// src/styles/GlobalStyle.ts
import { createGlobalStyle } from "styled-components";
import 'maplibre-gl/dist/maplibre-gl.css';


const GlobalStyle = createGlobalStyle`
  html {
    min-height: 100vh;
    width: 100vw;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.base};
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    line-height: ${({ theme }) => theme.lineHeights.relaxed};
    transition: background 0.2s, color 0.2s;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;
  }

  body {
    min-height: 100vh;
    width: 100vw;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.base};
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    line-height: ${({ theme }) => theme.lineHeights.relaxed};
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    font-family: ${({ theme }) => theme.fonts.body};
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${({ theme }) => theme.colors.title};
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.extraBold};
    margin: 0 0 0.5em 0;
    line-height: ${({ theme }) => theme.lineHeights.normal};
    letter-spacing: -0.01em;
  }

  h1 { font-size: ${({ theme }) => theme.fontSizes.h1}; }
  h2 { font-size: ${({ theme }) => theme.fontSizes.h2}; }
  h3 { font-size: ${({ theme }) => theme.fontSizes.h3}; }
  h4 { font-size: ${({ theme }) => theme.fontSizes.large}; }
  h5 { font-size: ${({ theme }) => theme.fontSizes.medium}; }
  h6 { font-size: ${({ theme }) => theme.fontSizes.small}; }

  p, ul, ol, li, blockquote {
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.base};
    font-family: ${({ theme }) => theme.fonts.body};
    margin: 0;
    padding: 0;
  }

  a {
    color: ${({ theme }) => theme.colors.link};
    text-decoration: none;
    font-family: ${({ theme }) => theme.fonts.main};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    transition: color 0.18s;
    &:hover, &:focus {
      color: ${({ theme }) => theme.colors.linkHover};
      text-decoration: underline;
    }
  }

  strong, b {
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  em, i {
    font-style: italic;
  }

  button, input, select, textarea {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.base};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.inputBackground};
    border-radius: ${({ theme }) => theme.radii.md};
    outline: none;
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
    transition: border-color 0.18s, background 0.18s;
  }

  input::placeholder, textarea::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
    opacity: 1;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.base};
  }

  ::selection {
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  code, pre {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: ${({ theme }) => theme.fontSizes.small};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    color: ${({ theme }) => theme.colors.textAlt};
    border-radius: ${({ theme }) => theme.radii.sm};
    padding: 2px 6px;
  }

  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: ${({ theme }) => theme.radii.sm};
  }

  // Scrollbar styling (opsiyonel, modern tarayıcılar için)
  ::-webkit-scrollbar {
    width: 10px;
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primaryTransparent};
    border-radius: ${({ theme }) => theme.radii.md};
  }

  // Responsive root font-size
  @media (max-width: 900px) {
    html { font-size: 15px; }
  }
  @media (max-width: 600px) {
    html { font-size: 14px; }
  }
`;

export default GlobalStyle;
