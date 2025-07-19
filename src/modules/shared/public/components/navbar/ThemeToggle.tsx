"use client";
import { useThemeContext } from "@/providers/ThemeProviderWrapper";
import styled from "styled-components";

export default function ThemeToggle() {
  const { toggle, isDark } = useThemeContext();

  return (
    <Button onClick={toggle} title="Toggle dark/light mode">
      {isDark ? "🌙" : "☀️"}
    </Button>
  );
}

const Button = styled.button`
  font-size: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.circle};
  padding: 0.33em 0.42em;
  transition: background 0.18s, color 0.13s;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;
