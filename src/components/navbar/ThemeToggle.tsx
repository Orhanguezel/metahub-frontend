"use client";

import { useThemeContext } from "@/providers/ThemeProviderWrapper";
import styled from "styled-components";

export function ThemeToggle() {
  const { toggle, isDark } = useThemeContext();

  return (
    <Button onClick={toggle} title="Toggle dark/light mode">
      {isDark ? "🌙" : "☀️"}
    </Button>
  );
}

const Button = styled.button`
  font-size: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;
`;
