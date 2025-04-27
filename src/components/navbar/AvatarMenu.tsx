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
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: 0.5rem 0;
  z-index: 10;
  min-width: 150px;
`;

const DropdownItem = styled.a`
  display: block;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.hoverBackground};
  }
`;

const MenuLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  font-weight: 500;

  &:hover {
    color: ${({ theme }) => theme.primary || "rebeccapurple"};
  }
`;
