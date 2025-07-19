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
      <Toggle $isMobile={isMobile} onClick={onToggle} aria-expanded={open}>
        {label} <FaChevronDown size={13} className="dropdown-chevron" />
      </Toggle>
      {open && (
        <Dropdown $isMobile={isMobile}>
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


// --- Styled Components ---

const Wrapper = styled.div<{ $isMobile?: boolean }>`
  position: relative;
  display: ${({ $isMobile }) => ($isMobile ? "block" : "inline-block")};
`;

const Toggle = styled.button<{ $isMobile?: boolean }>`
  background: none;
  border: none;
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
  transition: color 0.18s, background 0.18s;

  .dropdown-chevron {
    margin-left: 3px;
    transition: transform 0.2s;
    ${({ $isMobile }) => !$isMobile && "position: relative; top: 1px;"}
  }

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryTransparent};
  }
`;

const Dropdown = styled.div<{ $isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  position: ${({ $isMobile }) => ($isMobile ? "static" : "absolute")};
  background: ${({ theme }) => theme.colors.cardBackground};
  top: 100%;
  left: 0;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  min-width: 200px;
  padding: ${({ theme }) => theme.spacings.xs} 0;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ $isMobile, theme }) =>
    $isMobile ? "none" : theme.shadows.lg};
  border: ${({ $isMobile, theme }) =>
    $isMobile ? "none" : `${theme.borders.thin} ${theme.colors.border}`};
  margin-top: ${({ $isMobile }) => ($isMobile ? 0 : "8px")};

  ${({ $isMobile }) =>
    $isMobile &&
    `
    box-shadow: none;
    border-radius: 0;
    min-width: 0;
    margin: 0;
  `}
`;

export const DropdownLink = styled(Link).attrs<{ $active?: boolean }>(props => ({
  className: props.$active ? "active" : "",
}))<{ $isMobile?: boolean; $active?: boolean }>`
  padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.xl};
  white-space: nowrap;
  text-decoration: none;
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.text)};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "none"};
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.bold : theme.fontWeights.regular};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ $active, theme }) =>
    $active ? theme.shadows.sm : "none"};
  transition: 
    background 0.18s, 
    color 0.15s, 
    font-weight 0.13s,
    box-shadow 0.2s;

  &:hover,
  &:focus-visible {
    background: ${({ $active, theme }) =>
      $active
        ? theme.colors.primaryLight
        : theme.colors.primaryTransparent};
    color: ${({ $active, theme }) =>
      $active ? theme.colors.white : theme.colors.primary};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    box-shadow: ${({ $active, theme }) =>
      $active ? theme.shadows.md : theme.shadows.sm};
  }

  &.active {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    &:hover,
    &:focus-visible {
      background: ${({ theme }) => theme.colors.primaryLight};
      color: ${({ theme }) => theme.colors.white};
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  }

  ${({ $isMobile }) =>
    $isMobile &&
    `
    font-size: 1em;
    border-radius: 0;
    padding: 14px 18px;
  `}
`;
