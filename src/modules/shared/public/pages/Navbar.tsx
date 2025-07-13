// Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales/navbar";
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
  LangSelect,
} from "@/modules/shared";
import { Loading, ErrorMessage } from "@/shared";

export default function Navbar() {
  const dispatch = useAppDispatch();

  const { profile: user, loading: userLoading, error: userError } = useAppSelector((state) => state.account);
  const isAuthenticated = !!user && !!user._id;

  // Sepet
  const { cart, status: cartStatus } = useAppSelector((state) => state.cart);

  const { toggle, isDark } = useThemeContext();
  const { t } = useI18nNamespace("navbar", translations);

  const [hasMounted, setHasMounted] = useState(false);
  const [showStickyMenu, setShowStickyMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // --- Yalnızca login olduğunda, sadece bir kere cart fetch ---
  useEffect(() => {
    setHasMounted(true);
    if (isAuthenticated && user?._id && cartStatus === "idle") {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated, user?._id, cartStatus]);

  // Sticky Navbar için scroll takibi
  useEffect(() => {
    if (!hasMounted) return;
    const handleScroll = () => setShowStickyMenu(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMounted]);

  if (!hasMounted) return null;
  if (userLoading) return <Loading />;
  if (userError) return <ErrorMessage message={userError} />;

  const handleHamburgerClick = () => setMobileOpen((prev) => !prev);

  // Sepetin görünürlüğü: login + dolu
  const shouldShowCart =
    isAuthenticated &&
    cart &&
    Array.isArray(cart.items) &&
    cart.items.length > 0;

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
              {shouldShowCart && (
                <CartButton ariaLabel={t("navbar.cart", "Sepetim")} />
              )}
              <AvatarMenu
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
            {shouldShowCart && (
              <CartButton ariaLabel={t("navbar.cart", "Sepetim")} />
            )}
            <AvatarMenu
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
  padding: ${({ theme }) => theme.spacings.md} 0;
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
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
`;

const RightControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
`;

const ThemeToggle = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  cursor: pointer;
  color: ${({ theme }) => theme.buttons.primary.text};
  padding: ${({ theme }) => theme.spacings.xs};
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
  padding: ${({ theme }) => theme.spacings.xs};
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
  gap: ${({ theme }) => theme.spacings.lg};
  @media (max-width: 768px) {
    display: none;
  }
`;

const MenuBar = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacings.sm} 0;
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
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
`;
