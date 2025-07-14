// /modules/shared/AvatarMenu.tsx
"use client";
import React, { useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, resetAuthState } from "@/modules/users/slice/authSlice";
import { resetProfile } from "@/modules/users/slice/accountSlice";
import { getImageSrc } from "@/shared/getImageSrc";
import type { ProfileImageObj } from "@/modules/users/types/auth";
import { toast } from "react-toastify";

interface AvatarMenuProps {
  showDropdown: boolean;
  setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AvatarMenu({
  showDropdown,
  setShowDropdown,
}: AvatarMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useI18nNamespace("navbar", translations);
  const dispatch = useAppDispatch();
  const { profile: user } = useAppSelector((state) => state.account);

  // Profil resmi çözümü
  const resolvedProfileImage = useMemo(() => {
    if (!user?.profileImage)
      return "/defaults/profile-thumbnail.png"; // <-- public/defaults/ olmalı!
    if (typeof user.profileImage === "object" && user.profileImage !== null) {
      const img = user.profileImage as ProfileImageObj;
      if (img.thumbnail?.startsWith("http")) return img.thumbnail;
      if (img.url?.startsWith("http")) return img.url;
      return getImageSrc(img.thumbnail || img.url || "", "profile");
    }
    if (typeof user.profileImage === "string") {
      if (!user.profileImage.trim()) return "/defaults/profile-thumbnail.png";
      if (user.profileImage.startsWith("http")) return user.profileImage;
      return getImageSrc(user.profileImage, "profile");
    }
    return "/defaults/profile-thumbnail.png";
  }, [user?.profileImage]);

  // Dropdown dışı tıklama ile kapanır
  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, setShowDropdown]);

  // Logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err: any) {
      toast.error(
        t("logoutError", "Çıkış yaparken bir hata oluştu.") +
          (err?.message ? `: ${err.message}` : "")
      );
    }
    dispatch(resetAuthState());
    dispatch(resetProfile());
    window.location.replace("/login");
    setShowDropdown(false);
  };

  // user yoksa (henüz login değil), login/register döndür
  if (!user) {
    return (
      <>
        <MenuLink href="/login">{t("login")}</MenuLink>
        <MenuLink href="/register">{t("register")}</MenuLink>
      </>
    );
  }

  return (
    <AvatarWrapper>
      <Image
        src={resolvedProfileImage}
        alt="Profil"
        width={32}
        height={32}
        style={{ borderRadius: "50%", objectFit: "cover" }}
        priority
        onClick={() => setShowDropdown((prev) => !prev)}
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
            {(user.role === "admin" || user.role === "superadmin") && (
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

// --- Styled Components ---
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
  padding: ${({ theme }) => theme.spacings.sm} 0;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  min-width: 170px;
`;

const DropdownItem = styled.a`
  display: block;
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
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
