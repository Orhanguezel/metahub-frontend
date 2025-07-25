// Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/shared/locales/navbar";
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
            <Logo />
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
          <DesktopMenu2>
            <NavbarLinks />
          </DesktopMenu2>
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
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  border-top: 0;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  border-radius: 0 0 22px 22px;
  position: relative;
`;

const MobileMenu = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacings.lg} 0 ${({ theme }) => theme.spacings.md};
  position: fixed;
  top: 85px;
  left: 0;
  width: 100%;
  z-index: ${({ theme }) => theme.zIndex.overlay};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-radius: 0 0 24px 24px;
  animation: mobileMenuSlide 0.28s;

  @keyframes mobileMenuSlide {
    from { opacity: 0; transform: translateY(-16px);}
    to { opacity: 1; transform: translateY(0);}
  }
  @media (min-width: 769px) {
    display: none;
  }
`;

const CenterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.xl};
  background: ${({ theme }) => theme.colors.background};
  border-radius: 0 0 24px 24px;
  box-shadow: ${({ theme }) => theme.shadows.md};

  @media (max-width: 1024px) {
    padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.lg};
    border-radius: 0 0 18px 18px;
  }
  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
    border-radius: 0 0 12px 12px;
  }
`;

const RightControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
  margin-left: ${({ theme }) => theme.spacings.sm};
  @media (max-width: 600px) {
    gap: ${({ theme }) => theme.spacings.xs};
  }
`;

const ThemeToggle = styled.button`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: none;
  font-size: 1.18rem; // NORMAL
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.36em 0.45em;
  border-radius: ${({ theme }) => theme.radii.circle};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: background 0.16s, color 0.14s, box-shadow 0.17s;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  @media (max-width: 900px) {
    font-size: 1.08rem;
    padding: 0.23em 0.25em;
  }

  @media (max-width: 600px) {
    font-size: 0.9rem;
    padding: 0.12em 0.12em;
  }
`;


const Hamburger = styled.button`
  background: ${({ theme }) => theme.colors.primaryTransparent};
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  padding: 7px 12px;
  border-radius: ${({ theme }) => theme.radii.circle};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  display: none;
  transition: background 0.17s, color 0.13s, box-shadow 0.19s;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.white};
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const DesktopMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: 1.11rem; // Neredeyse birleşik, ama birbirine binmez!
  margin: 0;
  padding: 20px;
  font-family: ${({ theme }) => theme.fonts.main};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  @media (max-width: 1024px) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    gap: 0.9rem;
  }
  @media (max-width: 900px) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    gap: 0.07rem;
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

const DesktopMenu2 = styled.ul`
  display: flex;
  list-style: none;
  gap: 2.11rem; // Neredeyse birleşik, ama birbirine binmez!
  margin: 0;
  padding: 20px;
  font-family: ${({ theme }) => theme.fonts.main};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  @media (max-width: 900px) {
    font-size: ${({ theme }) => theme.fontSizes.md};
    gap: 2.07rem;
  }
  @media (max-width: 768px) {
    display: none;
  }
`;


const MenuBar = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacings.sm} 0;
  border-top: 0;
  background: transparent;
  @media (max-width: 768px) {
    display: none;
  }
`;

const StickyMenu = styled(motion.div)<{ isAdmin?: boolean }>`
  position: ${({ isAdmin }) => (isAdmin ? "relative" : "fixed")};
  top: ${({ isAdmin }) => (isAdmin ? "unset" : "0")};
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 7px ${({ theme }) => theme.spacings.xxl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: ${({ theme }) => theme.zIndex.overlay};
  border-radius: 0 0 18px 18px;

  @media (max-width: 1024px) {
    padding: 7px ${({ theme }) => theme.spacings.sm};
    border-radius: 0 0 12px 12px;
  }
  @media (max-width: 600px) {
    padding: 7px ${({ theme }) => theme.spacings.sm};
    border-radius: 0 0 7px 7px;
  }
`;
