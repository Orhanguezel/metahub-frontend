"use client";

import styled from "styled-components";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { useSidebarModules } from "@/hooks/useSidebarModules";
import { logoutUser } from "@/store/user/authSlice";
import { AppDispatch } from "@/store";
import { MdHome, MdLogout, MdMenu, MdClose, MdRefresh } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";

const isActive = (currentPath: string, linkPath: string) => {
  if (linkPath === "/admin") {
    return currentPath === "/admin";
  }
  return currentPath.startsWith(linkPath);
};

export default function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [hamburgerTop, setHamburgerTop] = useState(100);

  const pathname = usePathname();
  const { i18n, t } = useTranslation("sidebar");
  const currentLang = i18n.language;

  const { sidebarModules, isLoading } = useSidebarModules();
  const [isOpen, setIsOpen] = useState(false);

  const { settings = [] } = useAppSelector((state) => state.setting || {});

  // ✅ Navbar logosundan title/slogan çekelim
  const navbarLogoSetting = settings.find((s) => s.key === "navbar_logo_text");

  const title =
    (navbarLogoSetting?.value &&
      typeof navbarLogoSetting.value === "object" &&
      "title" in navbarLogoSetting.value &&
      (navbarLogoSetting.value as any).title?.[currentLang]) ||
    "E-Market";

  const slogan =
    (navbarLogoSetting?.value &&
      typeof navbarLogoSetting.value === "object" &&
      "slogan" in navbarLogoSetting.value &&
      (navbarLogoSetting.value as any).slogan?.[currentLang]) ||
    "";

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      router.push("/login");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newTop = Math.max(70, 100 - scrollY * 0.2);
      setHamburgerTop(newTop);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Hamburger Button */}
      <HamburgerButton
        style={{ top: `${hamburgerTop}px` }}
        onClick={() => setIsOpen(true)}
      >
        <MdMenu size={24} />
      </HamburgerButton>

      {/* Overlay */}
      {isOpen && <Overlay onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <SidebarWrapper className={isOpen ? "open" : ""}>
        <LogoSection>
          <LogoIcon>
            <MdHome size={20} />
          </LogoIcon>
          <LogoTextWrapper>
            <LogoTitle>{title}</LogoTitle>
            {slogan && <LogoSlogan>{slogan}</LogoSlogan>}
          </LogoTextWrapper>

          <CloseButton onClick={() => setIsOpen(false)}>
            <MdClose size={20} />
          </CloseButton>
        </LogoSection>

        <Nav>
          <MenuLink
            href="/admin"
            $active={isActive(pathname, "/admin")}
            onClick={() => setIsOpen(false)}
          >
            <IconWrapper $active={isActive(pathname, "/admin")}>
              <MdHome size={18} />
            </IconWrapper>
            <span>{t("dashboard", "Dashboard")}</span>
          </MenuLink>

          {isLoading ? (
            <LoadingText>
              <MdRefresh className="spin" />
              {t("loading", "Loading menu...")}
            </LoadingText>
          ) : (
            sidebarModules.map(({ key, path, label, Icon }) => (
              <MenuLink
                key={key}
                href={path}
                $active={isActive(pathname, path)}
                onClick={() => setIsOpen(false)}
              >
                <IconWrapper $active={isActive(pathname, path)}>
                  <Icon size={18} />
                </IconWrapper>
                <span>{label}</span>
              </MenuLink>
            ))
          )}
        </Nav>

        <LogoutSection>
          <LogoutButton type="button" onClick={handleLogout}>
            <IconWrapper>
              <MdLogout size={18} />
            </IconWrapper>
            {t("logout", "Logout")}
          </LogoutButton>
        </LogoutSection>
      </SidebarWrapper>
    </>
  );
}

// 🎨 Styled Components

const SidebarWrapper = styled.aside`
  width: 240px;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-right: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  transition: transform 0.3s ease;
  z-index: 999;

  @media (min-width: 768px) {
    transform: translateX(0);
  }

  @media (max-width: 768px) {
    transform: translateX(-100%);
    &.open {
      transform: translateX(0);
    }
  }
`;

const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  position: fixed;
  left: 15px;
  z-index: 1000;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 8px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: top 0.3s ease;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const CloseButton = styled.button`
  display: none;
  margin-left: auto;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.whiteColor};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

// ✅ YENİ: Firma ismi + sloganı düzgün göstermek için
const LogoTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const LogoSlogan = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.2;
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.md} 0;
  overflow-y: auto;
`;

const MenuLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: 0.75rem 1.25rem;
  margin: 0.25rem 0;
  text-decoration: none;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textMuted};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.semiBold : theme.fontWeights.regular};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.backgroundAlt : "transparent"};
  border-left: 3px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

const IconWrapper = styled.div<{ $active?: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textMuted};
  transition: color 0.2s ease;
`;

const LogoutSection = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: 0.75rem 1.25rem;
  width: 100%;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    color: ${({ theme }) => theme.colors.dangerHover || theme.colors.error};
  }
`;

const LoadingText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
