"use client";

import styled from "styled-components";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { useSidebarModules } from "@/hooks/useSidebarModules";
import { logoutUser, resetAuthState } from "@/modules/users/slice/authSlice";
import { resetProfile } from "@/modules/users/slice/accountSlice";
import { AppDispatch, persistor } from "@/store";
import { MdHome, MdLogout, MdClose, MdRefresh } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
};

const isActive = (currentPath: string, linkPath: string) => {
  if (linkPath === "/admin") {
    return currentPath === "/admin";
  }
  return currentPath.startsWith(linkPath);
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { i18n, t } = useTranslation("sidebar");
  const currentLang = i18n.language;

  const { sidebarModules, isLoading } = useSidebarModules();
  const { settings = [] } = useAppSelector((state) => state.setting || {});
  const navbarLogoSetting = settings.find((s) => s.key === "navbar_logo_text");

  const title =
    (navbarLogoSetting?.value as any)?.title?.[currentLang] || "E-Market";
  const slogan = (navbarLogoSetting?.value as any)?.slogan?.[currentLang] || "";

  // --- GÜNCEL LOGOUT
  const handleLogout = async () => {
    try {
      // 1. Backend'de session/cookie silinir
      await dispatch(logoutUser()).unwrap();
      // 2. Redux store temizliği
      dispatch(resetAuthState());
      dispatch(resetProfile());
      // 3. Persisted state'i tamamen temizle
      await persistor.purge();
      // 4. Login'e yönlen ve sidebar'ı kapat
      router.replace("/login");
      if (onClose) onClose();
    } catch (err: any) {
      console.error("Logout failed:", err);
      alert(t("logoutError", "Logout failed. Please try again."));
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && onClose) {
        onClose();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  return (
    <>
      <SidebarWrapper className={isOpen ? "open" : ""}>
        <LogoSection>
          <LogoIcon>
            <MdHome size={20} />
          </LogoIcon>
          <LogoTextWrapper>
            <LogoTitle>{title}</LogoTitle>
            {slogan && <LogoSlogan>{slogan}</LogoSlogan>}
          </LogoTextWrapper>
          <CloseButton onClick={onClose}>
            <MdClose size={20} />
          </CloseButton>
        </LogoSection>

        <Nav>
          <MenuLink
            href="/admin"
            $active={isActive(pathname, "/admin")}
            onClick={onClose}
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
                onClick={onClose}
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

      {isOpen && <Overlay onClick={onClose} />}
    </>
  );
}

// Styled Components aşağıda...

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
  transition: ${({ theme }) => theme.transition.normal};
  z-index: ${({ theme }) => theme.zIndex.dropdown};

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
    background: ${({ theme }) => theme.colors.overlayBackground};
    z-index: ${({ theme }) => theme.zIndex.overlay};
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
  padding: ${({ theme }) => theme.spacing.md};
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
  border-radius: ${({ theme }) => theme.radii.md};
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const LogoTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const LogoSlogan = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  overflow-y: auto;
`;

const MenuLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.xs} 0;
  text-decoration: none;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textMuted};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.semiBold : theme.fontWeights.regular};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.backgroundAlt : "transparent"};
  border-left: 3px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
  transition: ${({ theme }) => theme.transition.fast};

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
`;

const LogoutSection = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  width: 100%;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: background ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast};

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
