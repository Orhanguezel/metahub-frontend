import styled from "styled-components";
import Link from "next/link"; // ✅ GEREKLİ
import Image from "next/image"; // ✅ GEREKLİ
import { motion } from "framer-motion";



// --- Üst Bar ---
const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 2rem;
  background: ${({ theme }) => theme.backgroundAlt || "#f4f4f4"};
  color: ${({ theme }) => theme.primary || "#6a6a6a"};
  font-size: 0.9rem;
  align-items: center;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  a {
    color: inherit;
    font-size: 1.1rem;
    &:hover {
      color: ${({ theme }) => theme.primaryHover || "indigo"};
    }
  }
`;

const Phone = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: bold;
`;

// --- Navbar Ana Yapı ---
const NavbarWrapper = styled.nav`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.text};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  z-index: 100;
`;

const CenterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
`;

const LogoWrapper = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
`;

const LogoImage = styled(Image)`
  height: 60px;
  width: auto;
  object-fit: contain;
`;

const LogoTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoText = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
`;

const LogoText2 = styled.span`
  font-size: 0.85rem;
  font-style: italic;
  color: ${({ theme }) => theme.textSecondary};
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

const MenuItem = styled.li``;

const MenuLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  font-weight: 500;

  &:hover {
    color: ${({ theme }) => theme.primary || "rebeccapurple"};
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

// --- Sticky Menü (scroll sonrası) ---
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

// --- Mobil Menü ---

const MobileMenuLink = styled(Link)`
  font-size: 1.1rem;
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  padding: 0.8rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border || "#ccc"};
  display: block;
  width: 100%;
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.primary || "rebeccapurple"};
    background-color: ${({ theme }) => theme.backgroundAlt || "#f4f4f4"};
  }
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
const MenuItem1 = styled.li`
  list-style: none;
  display: flex;
  align-items: center;
  padding: 0.6rem 0.4rem;
  font-size: 0.9rem;
`;


const AvatarWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const AvatarDropdown = styled(motion.div)`
  position: absolute;
  top: 120%;
  right: 0;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: 0.5rem 0;
  z-index: 10;
  min-width: 150px;
`;

const DropdownItem = styled.a`
  display: block;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.hoverBackground};
  }
`;



export {
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
    DropdownItem
}