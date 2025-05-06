"use client";

import { useState, useEffect } from "react";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { useThemeContext } from "@/providers/ThemeProviderWrapper";
import styled from "styled-components";
import { motion } from "framer-motion";
import { TopBar } from "./TopBar";
import { Logo } from "./Logo";
import { NavbarLinks } from "./NavbarLinks";
import { MobileNavbarLinks } from "./MobileNavbarLinks";
import { AvatarMenu } from "./AvatarMenu";

export default function Navbar() {
  const { profile: user } = useAppSelector((state) => state.account);
  const isAuthenticated = !!user;
  const { toggle, isDark } = useThemeContext();

  const { i18n } = useTranslation("navbar");

  const [hasMounted, setHasMounted] = useState(false);
  const [showStickyMenu, setShowStickyMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const handleScroll = () => {
      setShowStickyMenu(window.scrollY > 120);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMounted]);

  if (!hasMounted) return null;

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <>
      <AnimatePresence>
        {showStickyMenu && (
          <StickyMenu
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ✅ Dinamik logo */}
            <Logo width={40} height={40} />
            <DesktopMenu>
              <NavbarLinks />
            </DesktopMenu>
            <RightControls>
              <ThemeToggle onClick={toggle}>
                {isDark ? <FaSun /> : <FaMoon />}
              </ThemeToggle>

              <LangSelect value={i18n.language} onChange={handleLangChange}>
                <option value="de">DE</option>
                <option value="en">EN</option>
                <option value="tr">TR</option>
              </LangSelect>

              <Hamburger onClick={() => setMobileOpen((prev) => !prev)}>
                {mobileOpen ? <FaTimes /> : <FaBars />}
              </Hamburger>
            </RightControls>
          </StickyMenu>
        )}
      </AnimatePresence>

      <NavbarWrapper>
        <TopBar />

        <CenterSection>
          {/* ✅ Dinamik logo */}
          <Logo />

          <RightControls>
            <ThemeToggle onClick={toggle}>
              {isDark ? <FaSun /> : <FaMoon />}
            </ThemeToggle>

            <LangSelect value={i18n.language} onChange={handleLangChange}>
              <option value="de">DE</option>
              <option value="en">EN</option>
              <option value="tr">TR</option>
            </LangSelect>

            <AvatarMenu
              isAuthenticated={isAuthenticated}
              profileImage={user?.profileImage}
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
            />

            <Hamburger onClick={() => setMobileOpen((prev) => !prev)}>
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
  color: ${({ theme }) => theme.inputs.text};  // Daha garanti için inputs.text
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  option {
    color: ${({ theme }) => theme.inputs.text};  // 👈 Yazı rengi net
    background: ${({ theme }) => theme.inputs.background};  // 👈 Arka plan net
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
  display: none;
  background: ${({ theme }) => theme.buttons.secondary.background};
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  cursor: pointer;
  color: ${({ theme }) => theme.buttons.secondary.text};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }

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

const StickyMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
`;
