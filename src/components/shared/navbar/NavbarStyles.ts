// components/visitor/shared/menu/NavbarStyles.ts
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { media } from "@/styles/media";

// --- Üst Bar ---
export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 2rem;
  background: ${({ theme }) => theme.backgroundAlt || "#fdfaf4"};
  color: ${({ theme }) => theme.primary || "#8b5e3c"};
  font-size: 0.9rem;
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  a {
    color: inherit;
    font-size: 1.1rem;
    &:hover {
      color: ${({ theme }) => theme.primaryHover || "#d9a441"};
    }
  }
`;

export const Phone = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: bold;
`;

// --- Navbar Ana Yapı ---
export const NavbarWrapper = styled.nav`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.heroBackground };
  color: ${({ theme }) => theme.text || "#1a1a1a"};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  transition: all 0.4s ease;
`;

export const CenterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
`;

export const LogoWrapper = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
`;

export const LogoImage = styled(Image)`
  height: 60px;
  width: auto;
  object-fit: contain;
`;

export const LogoTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const LogoText = styled.span`
  font-size: 1.4rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primary || "#d9a441"};
  font-family: "Playfair Display", serif;
`;

export const LogoText2 = styled.span`
  font-size: 0.85rem;
  font-style: italic;
  color: ${({ theme }) => theme.textSecondary || "#6c6c6c"};
`;

export const RightControls = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;

export const LangSelect = styled.select`
  background: none;
  border: 1px solid ${({ theme }) => theme.primary};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.primary};
  cursor: pointer;

  option {
    color: black;
  }
`;

export const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
`;

export const Hamburger = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
  display: none;

  ${media.medium} {
    display: block;
  }
`;

export const DesktopMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: 0.6rem;
  padding-left: 0;
  margin: 0;

  ${media.medium} {
    display: none;
  }
`;

export const MobileMenu = styled(motion.ul)<{ isOpen: boolean }>`
  position: fixed;
  top: 120px;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.background};
  padding: 1rem;
  z-index: 998;
  flex-direction: column;
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

  ${media.medium} {
    display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  }
`;

export const MenuBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.border || "#ddd"};
  background: ${({ theme }) => theme.background};

  ${media.medium} {
    display: none;
  }
`;

export const StickyMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.background};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 0.4rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 999;
`;

export const MenuItem = styled.li`
  list-style: none;
  position: relative;
  cursor: pointer;
`;

export const MenuItem1 = styled.li`
  list-style: none;
  display: flex;
  align-items: center;
  padding: 0.6rem 0.4rem;
  font-size: 0.9rem;
`;

export const MenuTop = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-left: auto;

  a {
    color: inherit;
    font-size: 1rem;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: ${({ theme }) => theme.primaryHover || "#d9a441"};
    }
  }
`;

export const MenuLink = styled(Link)`
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  font-weight: 500;
  padding: 1rem 0.6rem;
  display: inline-block;
  font-family: "Raleway", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 1rem;
    left: 0.6rem;
    width: calc(100% - 1.2rem);
    height: 2px;
    background-color: ${({ theme }) => theme.primary};
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

export const DropdownContainer = styled.div`
  color: ${({ theme }) => theme.text};
  font-weight: 500;
  padding: 1rem 0.6rem;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-family: "Raleway", sans-serif;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 1rem;
    left: 0.6rem;
    width: calc(100% - 1.2rem);
    height: 2px;
    background-color: ${({ theme }) => theme.primary};
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

export const DropdownContent = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 240px;
  background-color: ${({ theme }) => theme.background};
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 6px 6px;
  padding: 1rem 1.2rem;
  z-index: 99;
  list-style: none;
  transform: translateY(10px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;

  ${MenuItem}:hover & {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  li {
    margin: 0.6rem 0;

    a {
      display: block;
      padding: 0.6rem 0.8rem;
      border-radius: 6px;
      color: ${({ theme }) => theme.text};
      text-decoration: none;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.25s ease;

      &:hover {
        color: ${({ theme }) => theme.primary};
        background-color: ${({ theme }) => theme.backgroundAlt || "#fdfaf4"};
        padding-left: 1rem;
      }
    }
  }

  ${media.medium} {
    position: static;
    box-shadow: none;
    padding: 0.5rem 1rem;
    background: none;
    transform: none;
    opacity: 1;
    visibility: visible;
  }
`;


export const MobileMenuLink = styled(Link)`
  font-size: 1.1rem;
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  padding: 0.8rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border || "#ccc"};
  display: block;
  width: 100%;
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.primary || "#d9a441"};
    background-color: ${({ theme }) => theme.backgroundAlt || "#fdfaf4"};
  }
`;

export const DropdownGroup = styled.div`
  margin-bottom: 1rem;
`;

export const DropdownToggle = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border: none;
  font-weight: bold;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const DropdownList = styled.div`
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

