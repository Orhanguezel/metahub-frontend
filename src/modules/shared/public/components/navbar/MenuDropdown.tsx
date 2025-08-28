"use client";

import React from "react";
import Link from "next/link";
import { FaChevronDown } from "react-icons/fa";
import styled from "styled-components";

export const MenuDropdown = ({
  label,
  children,
  isMobile = false,
  open,
  onToggle,
  onClose,
}: MenuDropdownProps) => {
  return (
    <Wrapper $isMobile={isMobile}>
      <Toggle
        $isMobile={isMobile}
        onClick={onToggle}
        aria-expanded={!!open}
        aria-haspopup="menu"
      >
        {label} <FaChevronDown size={13} className="dropdown-chevron" />
      </Toggle>

      {open && (
        <Dropdown $isMobile={isMobile} role="menu">
          {React.Children.map(children, (child: any) =>
            React.cloneElement(child, { onClick: onClose })
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
};

interface MenuDropdownProps {
  label: string;
  children: React.ReactNode;
  isMobile?: boolean;
  open?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

/* ================= Styled Components ================ */

const Wrapper = styled.div<{ $isMobile?: boolean }>`
  position: relative;
  display: ${({ $isMobile }) => ($isMobile ? "block" : "inline-block")};
  width: ${({ $isMobile }) => ($isMobile ? "100%" : "auto")};
`;

const Toggle = styled.button<{ $isMobile?: boolean }>`
  background: transparent;
  border: ${({ theme }) => theme.borders.thin} transparent;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  letter-spacing: 0.01em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ $isMobile, theme }) =>
    $isMobile ? `${theme.spacings.sm} 0` : `8px 18px 8px 14px`};
  width: ${({ $isMobile }) => ($isMobile ? "100%" : "auto")};
  transition:
    color ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast},
    border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  .dropdown-chevron {
    margin-left: 3px;
    transition: transform 0.2s;
    ${({ $isMobile }) => !$isMobile && "position: relative; top: 1px;"}
  }

  &[aria-expanded="true"] .dropdown-chevron {
    transform: rotate(180deg);
  }

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.secondaryTransparent};
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.borderHighlight};
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Dropdown = styled.div<{ $isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  position: ${({ $isMobile }) => ($isMobile ? "static" : "absolute")};
  top: 100%;
  left: 0;
  z-index: ${({ theme }) => theme.zIndex.dropdown};

  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.black};
  border: ${({ $isMobile, theme }) =>
    $isMobile ? "none" : `${theme.borders.thin} ${theme.colors.secondary}`};
  box-shadow: ${({ $isMobile, theme }) =>
    $isMobile ? "none" : theme.shadows.lg};
  border-radius: ${({ $isMobile, theme }) =>
    $isMobile ? "0" : theme.radii.lg};
  min-width: 220px;
  padding: ${({ theme }) => theme.spacings.xs} 0;
  margin-top: ${({ $isMobile }) => ($isMobile ? 0 : "8px")};

  /* Mobilde X'in hemen altından başlatmak istiyorsan Navbar tarafında
     --mobile-dropdown-offset tanımlayabilirsin. */
  ${({ $isMobile }) =>
    $isMobile &&
    `
      margin-top: var(--mobile-dropdown-offset, 56px);
      scroll-margin-top: var(--mobile-dropdown-offset, 56px);
      width: 100%;
      max-height: calc(100dvh - var(--navbar-h, 64px) - var(--mobile-dropdown-offset, 56px) - 16px);
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      padding-bottom: env(safe-area-inset-bottom);
    `}
`;

export const DropdownLink = styled(Link).attrs<{ $active?: boolean }>(props => ({
  className: props.$active ? "active" : "",
}))<{ $isMobile?: boolean; $active?: boolean }>`
  display: block;
  padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.xl};
  white-space: nowrap;
  text-decoration: none;

  color: ${({ theme }) => theme.colors.black};
  background: transparent;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.main};

  border: ${({ theme }) => theme.borders.thin} transparent;
  border-radius: ${({ theme }) => theme.radii.md};

  font-weight: ${({ theme }) => theme.fontWeights.regular};
  transition:
    background ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast},
    border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  /* 🟡 HOVER: aktif değilken primary arka plan */
  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.black};
    border-color: ${({ theme }) =>
      (theme.colors as any).borderHighlight || theme.colors.primary};
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.sm};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  }

  /* 🔴 AKTİF: kırmızı (secondary) arka planı koru */
  &.active,
  ${({ $active }) => $active && "&"},
  &[aria-current="page"] {
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.secondaryDark};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  /* Aktif + hover: aktif tonun koyusu */
  &.active:hover,
  &.active:focus-visible,
  &[aria-current="page"]:hover,
  &[aria-current="page"]:focus-visible {
    background: ${({ theme }) => theme.colors.secondaryHover};
    border-color: ${({ theme }) => theme.colors.secondaryDark};
    color: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  ${({ $isMobile }) =>
    $isMobile &&
    `
    font-size: 1em;
    border-radius: 0;
    padding: 14px 18px;
  `}
`;
