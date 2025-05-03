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
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundAlt || "#fdfaf4"};
  color: ${({ theme }) => theme.colors.primary || "#8b5e3c"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  a {
    color: inherit;
    font-size: ${({ theme }) => theme.fontSizes.md};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover || "#d9a441"};
    }
  }
`;

export const Phone = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

// --- Navbar Ana Yapı ---
export const NavbarWrapper = styled.nav`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  transition: all 0.4s ease;
`;

export const CenterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
`;

export const LogoWrapper = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
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
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
`;

export const LogoText2 = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-style: italic;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const RightControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

export const LangSelect = styled.select`
  background: ${({ theme }) => theme.inputs.background};
  border: ${({ theme }) => `${theme.borders.thin} ${theme.colors.border}`};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  option {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
`;

export const Hamburger = styled.button`
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  display: none;

  ${media.medium} {
    display: block;
  }
`;

export const DesktopMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: ${({ theme }) => theme.spacing.md};
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
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  z-index: ${({ theme }) => theme.zIndex.modal};
  flex-direction: column;
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  box-shadow: ${({ theme }) => theme.shadows.md};

  ${media.medium} {
    display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  }
`;

export const MenuBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-top: ${({ theme }) => `${theme.borders.thin} ${theme.colors.border}`};
  background: ${({ theme }) => theme.colors.background};

  ${media.medium} {
    display: none;
  }
`;

export const StickyMenu = styled(motion.div)`
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

export const MenuItem = styled.li`
  list-style: none;
  position: relative;
  cursor: pointer;
`;

export const MenuItem1 = styled.li`
  list-style: none;
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const MenuTop = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  margin-left: auto;

  a {
    color: inherit;
    font-size: ${({ theme }) => theme.fontSizes.md};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.fontWeights.medium};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`;

export const MenuLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  padding: 1rem 0.6rem;
  display: inline-block;
  font-family: ${({ theme }) => theme.fonts.body};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 1rem;
    left: 0.6rem;
    width: calc(100% - 1.2rem);
    height: 2px;
    background-color: ${({ theme }) => theme.colors.primary};
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

export const DropdownContainer = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  padding: 1rem 0.6rem;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.body};
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 1rem;
    left: 0.6rem;
    width: calc(100% - 1.2rem);
    height: 2px;
    background-color: ${({ theme }) => theme.colors.primary};
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
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
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
    margin: ${({ theme }) => theme.spacing.sm} 0;

    a {
      display: block;
      padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
      border-radius: ${({ theme }) => theme.radii.sm};
      color: ${({ theme }) => theme.colors.text};
      text-decoration: none;
      font-size: ${({ theme }) => theme.fontSizes.md};
      font-weight: ${({ theme }) => theme.fontWeights.medium};
      transition: all 0.25s ease;

      &:hover {
        color: ${({ theme }) => theme.colors.primary};
        background-color: ${({ theme }) => theme.colors.backgroundAlt};
        padding-left: calc(${({ theme }) => theme.spacing.md} + 0.5rem);
      }
    }
  }

  ${media.medium} {
    position: static;
    box-shadow: none;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    background: none;
    transform: none;
    opacity: 1;
    visibility: visible;
  }
`;

export const MobileMenuLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-bottom: ${({ theme }) => `${theme.borders.thin} ${theme.colors.border}`};
  display: block;
  width: 100%;
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
`;

export const DropdownGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const DropdownToggle = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const DropdownList = styled.div`
  padding-left: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;
