"use client";

import styled from "styled-components";
import Link from "next/link";

export const SeeAllBtn = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacings.xl};
  padding: 0.80em 2.4em;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-family: ${({ theme }) => theme.fonts.main};
  color: ${({ theme }) => theme.colors.buttonText};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary} 60%,
    ${({ theme }) => theme.colors.accent} 100%
  );
  border-radius: ${({ theme }) => theme.radii.pill};
  text-decoration: none;
  box-shadow: ${({ theme }) => theme.shadows.button};
  border: none;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition:
    background 0.24s,
    color 0.16s,
    transform 0.16s,
    box-shadow 0.17s;

  &:hover,
  &:focus-visible {
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.accent} 0%,
      ${({ theme }) => theme.colors.primary} 90%
    );
    color: ${({ theme }) => theme.colors.buttonText};
    transform: translateY(-2px) scale(1.045);
    box-shadow: ${({ theme }) => theme.shadows.md};
    text-decoration: none;
  }

  &:active {
    transform: scale(0.98);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  @media (max-width: 768px) {
    padding: 0.70em 1.8em;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;