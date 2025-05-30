"use client";

import { useState, useEffect, useMemo } from "react";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { useThemeContext } from "@/providers/ThemeProviderWrapper";
import styled from "styled-components";
import {
  TopBar,
  Logo,
  NavbarLinks,
  MobileNavbarLinks,
  AvatarMenu,
} from "@/modules/shared";
import { getImageSrc } from "@/shared/getImageSrc";
import type { ProfileImageObj } from "@/modules/users/types/auth";

export default function Navbar() {
  const { profile: user } = useAppSelector((state) => state.account);
  const isAuthenticated = !!user;
  const { toggle, isDark } = useThemeContext();
  const { i18n } = useTranslation("navbar");

  const [hasMounted, setHasMounted] = useState(false);
  const [showStickyMenu, setShowStickyMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // --- Profil resmi string veya obje desteği ---
  const resolvedProfileImage = useMemo(() => {
    if (!user?.profileImage) return "/default-avatar.png";
    if (typeof user.profileImage === "object") {
      const img = user.profileImage as ProfileImageObj;
      return img.thumbnail || img.url || "/default-avatar.png";
    }
    if (typeof user.profileImage === "string") {
      // Cloudinary veya local backend dosyası olabilir
      if (user.profileImage.startsWith("http")) return user.profileImage;
      return getImageSrc(user.profileImage, "profile");
    }
    return "/default-avatar.png";
  }, [user?.profileImage]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const handleScroll = () => setShowStickyMenu(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMounted]);

  if (!hasMounted) return null;

  const handleHamburgerClick = () => setMobileOpen((prev) => !prev);

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  // --- Responsive Navbar ---
  return (
    <>
      {/* Sticky Navbar */}
      <AnimatePresence>
        {showStickyMenu && (
          <StickyMenu
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Logo width={40} height={40} />
            <DesktopMenu>
              <NavbarLinks />
            </DesktopMenu>
            <RightControls>
              <ThemeToggle
                onClick={toggle}
                title={isDark ? "Light mode" : "Dark mode"}
              >
                {isDark ? <FaSun /> : <FaMoon />}
              </ThemeToggle>
              <LangSelect
                value={i18n.language}
                onChange={handleLangChange}
                aria-label="Language"
              >
                <option value="de">DE</option>
                <option value="en">EN</option>
                <option value="tr">TR</option>
              </LangSelect>
              <AvatarMenu
                isAuthenticated={isAuthenticated}
                profileImage={resolvedProfileImage}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
              />
              <Hamburger
                onClick={handleHamburgerClick}
                aria-label="Mobile menu"
              >
                {mobileOpen ? <FaTimes /> : <FaBars />}
              </Hamburger>
            </RightControls>
          </StickyMenu>
        )}
      </AnimatePresence>

      {/* Main Navbar */}
      <NavbarWrapper>
        <TopBar />
        <CenterSection>
          <Logo />
          <RightControls>
            <ThemeToggle
              onClick={toggle}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <FaSun /> : <FaMoon />}
            </ThemeToggle>
            <LangSelect
              value={i18n.language}
              onChange={handleLangChange}
              aria-label="Language"
            >
              <option value="de">DE</option>
              <option value="en">EN</option>
              <option value="tr">TR</option>
            </LangSelect>
            <AvatarMenu
              isAuthenticated={isAuthenticated}
              profileImage={resolvedProfileImage}
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
            />
            <Hamburger onClick={handleHamburgerClick} aria-label="Mobile menu">
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </Hamburger>
          </RightControls>
        </CenterSection>
        <MenuBar>
          <DesktopMenu>
            <NavbarLinks />
          </DesktopMenu>
        </MenuBar>
        <AnimatePresence>
          {mobileOpen && (
            <MobileMenu
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MobileNavbarLinks onClose={() => setMobileOpen(false)} />
            </MobileMenu>
          )}
        </AnimatePresence>
      </NavbarWrapper>
    </>
  );
}

// 🎨 Styled Components
const NavbarWrapper = styled.nav`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  border-top: ${({ theme }) => `${theme.borders.thin} ${theme.colors.border}`};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
`;

const MobileMenu = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md} 0;
  position: fixed;
  top: 100px;
  left: 0;
  width: 100%;
  z-index: ${({ theme }) => theme.zIndex.modal};
  box-shadow: ${({ theme }) => theme.shadows.md};
  @media (min-width: 769px) {
    display: none;
  }
`;

const CenterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
`;

const RightControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const LangSelect = styled.select`
  background: ${({ theme }) => theme.inputs.background};
  border: ${({ theme }) => `${theme.borders.thin} ${theme.colors.border}`};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.inputs.text};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  option {
    color: ${({ theme }) => theme.inputs.text};
    background: ${({ theme }) => theme.inputs.background};
  }
`;

const ThemeToggle = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  cursor: pointer;
  color: ${({ theme }) => theme.buttons.primary.text};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: ${({ theme }) => theme.transition.fast};
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
  }
`;

const Hamburger = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  cursor: pointer;
  color: ${({ theme }) => theme.buttons.secondary.text};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: ${({ theme }) => theme.transition.fast};
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;

const DesktopMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: ${({ theme }) => theme.spacing.lg};
  @media (max-width: 768px) {
    display: none;
  }
`;

const MenuBar = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-top: ${({ theme }) => `${theme.borders.thin} ${theme.colors.border}`};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  @media (max-width: 768px) {
    display: none;
  }
`;

const StickyMenu = styled(motion.div)<{ isAdmin?: boolean }>`
  position: ${({ isAdmin }) => (isAdmin ? "relative" : "fixed")};
  top: ${({ isAdmin }) => (isAdmin ? "unset" : "0")};
  left: ${({ isAdmin }) => (isAdmin ? "unset" : "0")};
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
`;

