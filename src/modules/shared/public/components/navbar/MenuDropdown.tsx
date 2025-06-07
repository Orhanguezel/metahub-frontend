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
  // Artık local state yok!
  return (
    <Wrapper isMobile={isMobile}>
      <Toggle isMobile={isMobile} onClick={onToggle}>
        {label} <FaChevronDown size={12} />
      </Toggle>
      {open && (
        <Dropdown isMobile={isMobile}>
          {React.Children.map(children, (child: any) =>
            React.cloneElement(child, { onClick: onClose })
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
};

export { DropdownLink };

interface MenuDropdownProps {
  label: string;
  children: React.ReactNode;
  isMobile?: boolean;
  open?: boolean;               // Ekledik!
  onToggle?: () => void;        // Ekledik!
  onClose?: () => void;
}

const Wrapper = styled.div<{ isMobile?: boolean }>`
  position: relative;
  display: ${({ isMobile }) => (isMobile ? "block" : "inline-block")};
`;

const Toggle = styled.button<{ isMobile?: boolean }>`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ isMobile, theme }) =>
    isMobile ? `${theme.spacing.sm} 0` : "0"};
  width: ${({ isMobile }) => (isMobile ? "100%" : "auto")};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: ${({ theme }) => theme.transition.fast};
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Dropdown = styled.div<{ isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  position: ${({ isMobile }) => (isMobile ? "static" : "absolute")};
  background: ${({ theme }) => theme.colors.background};
  top: 100%;
  left: 0;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ isMobile, theme }) =>
    isMobile ? "none" : theme.shadows.lg};
  border: ${({ isMobile, theme }) =>
    isMobile ? "none" : `${theme.borders.thin} ${theme.colors.border}`};
`;

const DropdownLink = styled(Link)<{ isMobile?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  white-space: nowrap;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: ${({ theme }) => theme.transition.fast};
  &:hover {
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;
