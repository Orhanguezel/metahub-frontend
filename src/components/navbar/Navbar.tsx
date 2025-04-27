"use client";

import { useState, useEffect, useContext } from "react";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { ThemeContext } from "@/providers/ThemeProviderWrapper";
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
  const { toggle, isDark } = useContext(ThemeContext);
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

  const logoSrc = isDark ? "/navbar/logo-dark.png" : "/navbar/logo-light.png";

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
            <Logo logoSrc={logoSrc} width={40} height={40} />
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
          <Logo logoSrc={logoSrc} />

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
  background: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.text};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  z-index: 100;
`;

const MobileMenu = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
  padding: 1rem 0;
  position: fixed;
  top: 100px;
  left: 0;
  width: 100%;
  z-index: 998;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

  @media (min-width: 769px) {
    display: none;
  }
`;

const CenterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
`;

const RightControls = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;

const LangSelect = styled.select`
  background: none;
  border: 1px solid rebeccapurple;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: rebeccapurple;
  cursor: pointer;

  option {
    color: black;
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: rebeccapurple;
`;

const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: rebeccapurple;

  @media (max-width: 768px) {
    display: block;
  }
`;

const DesktopMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MenuBar = styled.div`
  display: flex;
  justify-content: center;
  padding: 0.6rem 0;
  border-top: 1px solid ${({ theme }) => theme.border || "#ddd"};
  background: ${({ theme }) => theme.backgroundSecondary};

  @media (max-width: 768px) {
    display: none;
  }
`;

const StickyMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.backgroundSecondary};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 0.4rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 999;
`;
