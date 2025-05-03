"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getImageSrc } from "@/utils/getImageSrc";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { motion } from "framer-motion";
import Link from "next/link"; 

interface AvatarMenuProps {
  isAuthenticated: boolean;
  profileImage?: string;
  showDropdown: boolean;
  setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AvatarMenu({
  isAuthenticated,
  profileImage,
  showDropdown,
  setShowDropdown,
}: AvatarMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("navbar");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <>
        <MenuLink href="/login">{t("login")}</MenuLink>
        <MenuLink href="/register">{t("register")}</MenuLink>
      </>
    );
  }

  return (
    <AvatarWrapper onClick={() => setShowDropdown((prev) => !prev)}>
      <Image
        src={getImageSrc(profileImage)}
        alt="Profil"
        width={32}
        height={32}
        style={{ borderRadius: "50%", objectFit: "cover" }}
        priority
      />
      <AnimatePresence>
        {showDropdown && (
          <AvatarDropdown
            ref={dropdownRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <DropdownItem href="/account">{t("navbar.account")}</DropdownItem>
            <DropdownItem href="/logout">{t("navbar.logout")}</DropdownItem>
          </AvatarDropdown>
        )}
      </AnimatePresence>
    </AvatarWrapper>
  );
}

const AvatarWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const AvatarDropdown = styled(motion.div)`
  position: absolute;
  top: 120%;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => `${theme.borders.thin} ${theme.colors.border}`};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  min-width: 150px;
`;

const DropdownItem = styled.a`
  display: block;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const MenuLink = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

