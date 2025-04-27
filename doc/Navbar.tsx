"use client";

import { useState, useEffect, useContext, useRef } from "react";
import {
  FaMoon,
  FaSun,
  FaInstagram,
  FaTiktok,
  FaPinterestP,
  FaSearch,
  FaPhone,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getImageSrc } from "@/utils/getImageSrc";
import {
  TopBar,
  SocialLinks,
  Phone,
  NavbarWrapper,
  CenterSection,
  LogoWrapper,
  LogoImage,
  LogoTextWrapper,
  LogoText,
  LogoText2,
  RightControls,
  LangSelect,
  ThemeToggle,
  Hamburger,
  DesktopMenu,
  MenuItem,
  MenuItem1,
  MenuLink,
  MenuBar,
  StickyMenu,
  MobileMenuLink,
  MobileMenu,
  AvatarWrapper,
  AvatarDropdown,
  DropdownItem,
} from "./NavbarStyles";

import { ThemeContext } from "@/app/providers/ThemeProviderWrapper";
import { useAppSelector } from "@/store/hooks";

export default function Navbar() {
  const { profile: user } = useAppSelector((state) => state.account);
  const isAuthenticated = !!user;

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showStickyMenu, setShowStickyMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { t, i18n } = useTranslation("navbar");
  const { toggle, isDark } = useContext(ThemeContext);


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

  useEffect(() => {
    if (!hasMounted) return;

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
  }, [hasMounted]);


  if (!hasMounted) return null;

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };



  const logoSrc = isDark ? "/navbar/logo-dark.png" : "/navbar/logo-light.png";

  const desktopMenuItems = (
    <>
      <MenuItem>
        <MenuLink href="/">{t("home")}</MenuLink>
      </MenuItem>
      <MenuItem>
        <MenuLink href="/visitor/solutions">{t("solutions")}</MenuLink>
      </MenuItem>
      <MenuItem>
        <MenuLink href="/visitor/products">{t("products")}</MenuLink>
      </MenuItem>
      <MenuItem>
        <MenuLink href="/visitor/projects">{t("projects")}</MenuLink>
      </MenuItem>
      <MenuItem>
        <MenuLink href="/visitor/contact">{t("contact")}</MenuLink>
      </MenuItem>
      <MenuItem1>
        <MenuLink href="/search">
          <FaSearch />
        </MenuLink>
      </MenuItem1>
    </>
  );

  const mobileMenuItems = (
    <>
      <MobileMenuLink href="/" onClick={() => setMobileOpen(false)}>
        {t("home")}
      </MobileMenuLink>
      <MobileMenuLink
        href="/visitor/solutions"
        onClick={() => setMobileOpen(false)}
      >
        {t("solutions")}
      </MobileMenuLink>
      <MobileMenuLink
        href="/visitor/products"
        onClick={() => setMobileOpen(false)}
      >
        {t("products")}
      </MobileMenuLink>
      <MobileMenuLink
        href="/visitor/projects"
        onClick={() => setMobileOpen(false)}
      >
        {t("projects")}
      </MobileMenuLink>
      <MobileMenuLink
        href="/visitor/contact"
        onClick={() => setMobileOpen(false)}
      >
        {t("contact")}
      </MobileMenuLink>
      {!isAuthenticated ? (
        <>
          <MobileMenuLink href="/login" onClick={() => setMobileOpen(false)}>
            {t("login")}
          </MobileMenuLink>
          <MobileMenuLink href="/register" onClick={() => setMobileOpen(false)}>
            {t("register")}
          </MobileMenuLink>
        </>
      ) : (
        <MobileMenuLink href="/account" onClick={() => setMobileOpen(false)}>
          {t("account")}
        </MobileMenuLink>
      )}
    </>
  );

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
            <LogoWrapper href="/">
              <LogoImage src={logoSrc} alt="Logo" width={40} height={40} priority/>
              <LogoTextWrapper>
                <LogoText>Ensotek</LogoText>
                <LogoText2>Kühlturmsysteme</LogoText2>
              </LogoTextWrapper>
            </LogoWrapper>
            <DesktopMenu>{desktopMenuItems}</DesktopMenu>
            <RightControls>
              <ThemeToggle onClick={toggle}>
                {isDark ? <FaSun /> : <FaMoon />}
              </ThemeToggle>
              <LangSelect value={i18n.language} onChange={handleLangChange}>
                <option value="de">DE</option>
                <option value="en">EN</option>
                <option value="tr">TR</option>
              </LangSelect>
              <Hamburger onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <FaTimes /> : <FaBars />}
              </Hamburger>
            </RightControls>
          </StickyMenu>
        )}
      </AnimatePresence>

      <NavbarWrapper>
        <TopBar>
          <SocialLinks>
            <a href="https://instagram.com" target="_blank">
              <FaInstagram />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaPinterestP />
            </a>
          </SocialLinks>
          <Phone>
            <FaPhone /> +49 1764 1107158
          </Phone>
        </TopBar>

        <CenterSection>
          <LogoWrapper href="/">
            <LogoImage src={logoSrc} alt="Logo" width={60} height={60} priority />
            <LogoTextWrapper>
              <LogoText>Ensotek</LogoText>
              <LogoText2>Kühlturmsysteme</LogoText2>
            </LogoTextWrapper>
          </LogoWrapper>
          <RightControls>
            <ThemeToggle onClick={toggle}>
              {isDark ? <FaSun /> : <FaMoon />}
            </ThemeToggle>
            <LangSelect value={i18n.language} onChange={handleLangChange}>
              <option value="de">DE</option>
              <option value="en">EN</option>
              <option value="tr">TR</option>
            </LangSelect>
            {!isAuthenticated ? (
              <>
                <MenuLink href="/login">{t("login")}</MenuLink>
                <MenuLink href="/register">{t("register")}</MenuLink>
              </>
            ) : (
              <AvatarWrapper onClick={() => setShowDropdown((prev) => !prev)}>
                <Image
                  src={getImageSrc(user?.profileImage)}
                  alt="Profil"
                  width={32}
                  height={32}
                  priority
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
                <AnimatePresence>
                  {showDropdown && (
                    <AvatarDropdown
                      ref={dropdownRef} // ref burada kullanılıyor
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DropdownItem href="/account">
                        {t("navbar.account")}
                      </DropdownItem>
                      <DropdownItem href="/logout">
                        {t("navbar.logout")}
                      </DropdownItem>
                    </AvatarDropdown>
                  )}
                </AnimatePresence>
              </AvatarWrapper>
            )}

            <Hamburger onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </Hamburger>
          </RightControls>
        </CenterSection>

        <MenuBar>
          <DesktopMenu>{desktopMenuItems}</DesktopMenu>
        </MenuBar>

        <AnimatePresence>
          {mobileOpen && (
            <MobileMenu
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {mobileMenuItems}
            </MobileMenu>
          )}
        </AnimatePresence>
      </NavbarWrapper>
    </>
  );
}
