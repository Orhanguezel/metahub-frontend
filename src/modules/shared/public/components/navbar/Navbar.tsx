"use client";

import { useState, useEffect, useMemo } from "react";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchCart } from "@/modules/cart/slice/cartSlice";
import { useThemeContext } from "@/providers/ThemeProviderWrapper";
import styled from "styled-components";
import {
  TopBar,
  Logo,
  NavbarLinks,
  MobileNavbarLinks,
  AvatarMenu,
  CartButton,
  LangSelect
} from "@/modules/shared";
import { getImageSrc } from "@/shared/getImageSrc";
import type { ProfileImageObj } from "@/modules/users/types/auth";

export default function Navbar() {
  const { profile: user } = useAppSelector((state) => state.account);
  const dispatch = useAppDispatch();
  const isAuthenticated = !!user;
  const { toggle, isDark } = useThemeContext();
  const { t } = useTranslation("navbar");

  const [hasMounted, setHasMounted] = useState(false);
  const [showStickyMenu, setShowStickyMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Profil resmi belirleme
  const resolvedProfileImage = useMemo(() => {
    if (!user?.profileImage) return "/default-avatar.png";
    if (typeof user.profileImage === "object") {
      const img = user.profileImage as ProfileImageObj;
      return img.thumbnail || img.url || "/default-avatar.png";
    }
    if (typeof user.profileImage === "string") {
      if (user.profileImage.startsWith("http")) return user.profileImage;
      return getImageSrc(user.profileImage, "profile");
    }
    return "/default-avatar.png";
  }, [user?.profileImage]);

  // Mount olduğunda sepeti yükle
  useEffect(() => {
    setHasMounted(true);
    if (isAuthenticated && user?._id) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated, user?._id]);

  // Sticky Navbar için scroll takibi
  useEffect(() => {
    if (!hasMounted) return;
    const handleScroll = () => setShowStickyMenu(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMounted]);

  if (!hasMounted) return null;

  const handleHamburgerClick = () => setMobileOpen((prev) => !prev);

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
              <LangSelect />
              {isAuthenticated && <CartButton ariaLabel={t("navbar.cart", "Sepetim")} />}
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
            <LangSelect />
            {isAuthenticated && <CartButton ariaLabel={t("navbar.cart", "Sepetim")} />}
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

// --- Styled Components ---
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

