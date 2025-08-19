// Navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/shared/locales/navbar";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchCart } from "@/modules/cart/slice/cartSlice";
import { useThemeContext } from "@/providers/ThemeProviderWrapper";
import { NotificationButton } from "@/modules/notification";

/* 🔔 Yeni: Chat uyarı butonunu ekle */
import ChatAlertButton from "@/modules/chat/public/components/ChatAlertButton";

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

/** A11y helper for screen readers */
const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0);
  white-space: nowrap; border: 0;
`;

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

  const wrapperRef = useRef<HTMLElement>(null);

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

  // Body scroll lock (mobile menü açıkken)
  useEffect(() => {
    if (!hasMounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen, hasMounted]);

  // Navbar yüksekliğini CSS değişkenine yaz (MobileMenu top için)
  useEffect(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current;
    const setVar = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--navbar-h", `${h}px`);
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  const mobileMenuId = "mobile-nav-links";

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
                <VisuallyHidden>{isDark ? "Switch to light" : "Switch to dark"}</VisuallyHidden>
              </ThemeToggle>

              <HideOnXS>
                <NotificationButton />
              </HideOnXS>

              <HideOnXS>
                <LangSelect />
              </HideOnXS>

              {shouldShowCart && (
                <CartButton ariaLabel={t("navbar.cart", "Sepetim")} />
              )}

              <AvatarMenu
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
              />

              {/* 🔔 Yalnızca unread olduğunda görünen buton */}
              <ChatAlertButton />

              <Hamburger
                onClick={handleHamburgerClick}
                aria-label="Mobile menu"
                aria-controls={mobileMenuId}
                aria-expanded={mobileOpen}
                data-testid="navbar-hamburger-sticky"
              >
                {mobileOpen ? <FaTimes /> : <FaBars />}
              </Hamburger>
            </RightControls>
          </StickyMenu>
        )}
      </AnimatePresence>

      {/* Main Navbar */}
      <NavbarWrapper ref={wrapperRef as any}>
        <TopBar />
        <CenterSection>
          <Logo />
          <RightControls>
            <ThemeToggle
              onClick={toggle}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <FaSun /> : <FaMoon />}
              <VisuallyHidden>{isDark ? "Switch to light" : "Switch to dark"}</VisuallyHidden>
            </ThemeToggle>

            <HideOnXS>
              <LangSelect />
            </HideOnXS>

            <HideOnXS>
              <NotificationButton />
            </HideOnXS>

            {shouldShowCart && (
              <CartButton ariaLabel={t("navbar.cart", "Sepetim")} />
            )}

            <AvatarMenu
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
            />

            {/* 🔔 Yalnızca unread olduğunda görünen buton */}
            <ChatAlertButton />

            <Hamburger
              onClick={handleHamburgerClick}
              aria-label="Mobile menu"
              aria-controls={mobileMenuId}
              aria-expanded={mobileOpen}
              data-testid="navbar-hamburger-main"
            >
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
              id={mobileMenuId}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <MobileNavbarLinks onClose={() => setMobileOpen(false)} />
            </MobileMenu>
          )}
        </AnimatePresence>
      </NavbarWrapper>
    </>
  );
}

/* ===================== Styled Components ===================== */

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
  /* iOS safe-area üst boşluk için */
  padding-top: max(env(safe-area-inset-top), 0px);
`;

const MobileMenu = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacings.lg} 0 ${({ theme }) => theme.spacings.md};
  position: fixed;
  top: calc(var(--navbar-h, 64px) + env(safe-area-inset-top));
  left: 0;
  width: 100%;
  z-index: ${({ theme }) => theme.zIndex.overlay};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-radius: 0 0 24px 24px;
  animation: mobileMenuSlide 0.24s ease-out;

  @keyframes mobileMenuSlide {
    from { opacity: 0; transform: translateY(-16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  ${({ theme }) => theme.media.desktop} {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const CenterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.xl};
  background: ${({ theme }) => theme.colors.sectionBackground};
  border-radius: 0 0 24px 24px;
  box-shadow: ${({ theme }) => theme.shadows.md};

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.lg};
    border-radius: 0 0 18px 18px;
  }
  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
    border-radius: 0 0 12px 12px;
  }
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-left: ${({ theme }) => theme.spacings.sm};
  min-width: fit-content;

  ${({ theme }) => theme.media.small} {
    gap: ${({ theme }) => theme.spacings.xs};
  }
`;

const HideOnXS = styled.div`
  /* Çok küçük ekranlarda alan aç: 375px ve altı */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobileM}) {
    display: none;
  }
`;

const ThemeToggle = styled.button`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: none;
  font-size: clamp(0.95rem, 2.8vw, 1.18rem);
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.36em 0.45em;
  border-radius: ${({ theme }) => theme.radii.circle};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: background ${({ theme }) => theme.transition.fast},
              color ${({ theme }) => theme.transition.fast},
              box-shadow ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  /* ✅ medya sorgusu düzeltildi */
  @media (max-width: ${({ theme }) => theme.breakpoints.laptopS}) {
    font-size: 1.05rem;
    padding: 0.28em 0.34em;
  }

  ${({ theme }) => theme.media.small} {
    font-size: 0.92rem;
    padding: 0.18em 0.18em;
  }
`;

const Hamburger = styled.button`
  /* Varsayılan desktop'ta gizli; mobile'da göster */
  display: none;

  ${({ theme }) => theme.media.mobile} {
    display: inline-flex;
  }

  align-items: center;
  justify-content: center;
  width: clamp(40px, 9vw, 48px);
  height: clamp(40px, 9vw, 48px);
  line-height: 1;
  background: ${({ theme }) => theme.colors.primaryTransparent};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  font-size: clamp(18px, 6vw, 22px);
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0;
  border-radius: ${({ theme }) => theme.radii.circle};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  transition: background ${({ theme }) => theme.transition.fast},
              color ${({ theme }) => theme.transition.fast},
              box-shadow ${({ theme }) => theme.transition.fast};
  z-index: ${({ theme }) => theme.zIndex.overlay};

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadows.button};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const DesktopMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: 1.1rem;
  margin: 0;
  padding: 20px;
  font-family: ${({ theme }) => theme.fonts.main};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};

  /* ✅ medya sorgusu düzeltildi */
  @media (max-width: ${({ theme }) => theme.breakpoints.laptopS}) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    gap: 0.9rem;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.laptop}) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    gap: 0.5rem;
  }
  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

const DesktopMenu2 = styled.ul`
  display: flex;
  list-style: none;
  gap: 2.1rem;
  margin: 0;
  padding: 20px;
  font-family: ${({ theme }) => theme.fonts.main};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};

  @media (max-width: ${({ theme }) => theme.breakpoints.laptopS}) {
    font-size: ${({ theme }) => theme.fontSizes.md};
    gap: 1.2rem;
  }
  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

const MenuBar = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacings.sm} 0;
  border-top: 0;
  background: transparent;

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

const StickyMenu = styled(motion.div)<{ isAdmin?: boolean }>`
  position: ${({ isAdmin }) => (isAdmin ? "relative" : "fixed")};
  top: ${({ isAdmin }) => (isAdmin ? "unset" : "0")};
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.colors.sectionBackground};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 7px ${({ theme }) => theme.spacings.xxl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: ${({ theme }) => theme.zIndex.overlay};
  border-radius: 0 0 18px 18px;

  ${({ theme }) => theme.media.tablet} {
    padding: 7px ${({ theme }) => theme.spacings.sm};
    border-radius: 0 0 12px 12px;
  }
  ${({ theme }) => theme.media.small} {
    padding: 7px ${({ theme }) => theme.spacings.sm};
    border-radius: 0 0 7px 7px;
  }
`;
