"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, resetAuthState } from "@/modules/users/slice/authSlice";
import { resetProfile } from "@/modules/users/slice/accountSlice";
import { persistor } from "@/store";

interface AvatarMenuProps {
  isAuthenticated: boolean;
  profileImage: string;
  showDropdown: boolean;
  setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AvatarMenu({
  isAuthenticated,
  profileImage,
  showDropdown,
  setShowDropdown,
}: AvatarMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("navbar");
  const dispatch = useAppDispatch();

  // User objesi slice'tan alınır, role kontrolü için
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowDropdown]);

  // En güncel logout handler:
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err: any) {
      console.error("Logout işlemi başarısız:", err);
      // Sessizce hata yönetimi (network hatası da olabilir)
    }
    dispatch(resetAuthState());
    dispatch(resetProfile());
    // Persisti tamamen sıfırla
    await persistor.purge();
    // Hızlıca login sayfasına yönlendir
    window.location.replace("/login");
    setShowDropdown(false);
  };

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
        src={profileImage || "/default-avatar.png"}
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
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownItem as={Link} href="/account">
              {t("account")}
            </DropdownItem>
            {user?.role === "admin" && (
              <DropdownItem as={Link} href="/admin">
                {t("adminDashboard", "Admin Paneli")}
              </DropdownItem>
            )}
            <DropdownItem
              as="button"
              onClick={handleLogout}
              style={{ width: "100%", textAlign: "left" }}
            >
              {t("logout")}
            </DropdownItem>
          </AvatarDropdown>
        )}
      </AnimatePresence>
    </AvatarWrapper>
  );
}

// Styled Components aynı şekilde...

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
  min-width: 170px;
`;

const DropdownItem = styled.a`
  display: block;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
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
