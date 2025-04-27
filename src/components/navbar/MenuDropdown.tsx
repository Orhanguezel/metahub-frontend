// components/visitor/shared/navbar/MenuDropdown.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaChevronDown } from "react-icons/fa";
import styled from "styled-components";



export const MenuDropdown = ({ label, children, isMobile = false, onClose }: MenuDropdownProps) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = () => {
    if (onClose) onClose();
    setOpen(false);
  };

  return (
    <Wrapper isMobile={isMobile} onMouseLeave={() => !isMobile && setOpen(false)}>
      <Toggle isMobile={isMobile} onClick={handleToggle}>
        {label} <FaChevronDown size={12} />
      </Toggle>
      {open && (
        <Dropdown isMobile={isMobile}>
          {React.Children.map(children, (child: any) =>
            React.cloneElement(child, { onClick: handleClose })
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
  onClose?: () => void;
}

const Wrapper = styled.div<{ isMobile?: boolean }>`
  position: relative;
  display: ${({ isMobile }) => (isMobile ? "block" : "inline-block")};
`;

const Toggle = styled.button<{ isMobile?: boolean }>`
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${({ isMobile }) => (isMobile ? "12px 0" : "0")};
  width: ${({ isMobile }) => (isMobile ? "100%" : "auto")};
`;

const Dropdown = styled.div<{ isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  position: ${({ isMobile }) => (isMobile ? "static" : "absolute")};
  background: ${({ theme }) => theme.background};
  top: 100%;
  left: 0;
  z-index: 1000;
  padding: 0.5rem 0;
  border-radius: 0.5rem;
  box-shadow: ${({ isMobile }) =>
    isMobile ? "none" : "0 8px 20px rgba(0, 0, 0, 0.1)"};
`;

const DropdownLink = styled(Link)<{ isMobile?: boolean }>`
  padding: 10px 16px;
  white-space: nowrap;
  text-decoration: none;
  color: ${({ theme }) => theme.text};

  &:hover {
    background: ${({ theme }) => theme.backgroundSecondary};
  }
`;

