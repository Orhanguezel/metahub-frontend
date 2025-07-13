"use client";
import styled from "styled-components";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebarModules } from "@/hooks/useSidebarModules";
import { MdHome, MdLogout, MdClose, MdRefresh } from "react-icons/md";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales/sidebar";
import { SupportedLocale } from "@/types/common";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutUser, resetAuthState } from "@/modules/users/slice/authSlice";
import { resetProfile } from "@/modules/users/slice/accountSlice";
import { useEffect } from "react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const isActive = (currentPath: string, linkPath: string) => {
  if (linkPath === "/") return currentPath === "/";
  return currentPath.startsWith(linkPath);
};

// Utility: Güvenli extraction (type-safe)
function getNavbarLogo(settings: any[], lang: SupportedLocale) {
  const setting = settings.find((s) => s.key === "navbar_logo_text");
  if (!setting?.value || typeof setting.value !== "object") {
    return {
      title: "E-Market",
      slogan: "",
    };
  }
  // Type-safe extraction
  const title =
    setting.value.title?.label?.[lang] ||
    setting.value.title?.label?.en ||
    "E-Market";
  const slogan =
    setting.value.slogan?.label?.[lang] ||
    setting.value.slogan?.label?.en ||
    "";
  return { title, slogan };
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { i18n, t } = useI18nNamespace("sidebar", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { sidebarModules, isLoading } = useSidebarModules();

  // Her zaman settingsAdmin!
  const settings = useAppSelector((state) => state.settings.settingsAdmin);

  // Güvenli çek
  const { title, slogan } = getNavbarLogo(settings, lang);

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(resetAuthState());
      dispatch(resetProfile());
      onClose();
      router.replace("/login");
    } catch (err: any) {
      alert(t("logoutError"));
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
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
          <LogoHomeLink href="/" onClick={onClose}>
            <LogoIcon>
              <MdHome size={20} />
            </LogoIcon>
            <LogoTextWrapper>
              <LogoTitle>{title}</LogoTitle>
              {slogan && <LogoSlogan>{slogan}</LogoSlogan>}
            </LogoTextWrapper>
          </LogoHomeLink>
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
            <span>{t("dashboard")}</span>
          </MenuLink>
          {isLoading ? (
            <LoadingText>
              <MdRefresh className="spin" />
              {t("loading")}
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
            {t("logout")}
          </LogoutButton>
        </LogoutSection>
      </SidebarWrapper>
      {isOpen && <Overlay onClick={onClose} />}
    </>
  );
}

// --- Styled Components ---

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
  padding: ${({ theme }) => theme.spacings.md};
  border-bottom: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
`;

const LogoHomeLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  flex: 1;
  min-width: 0;
  &:hover span {
    color: ${({ theme }) => theme.colors.primary};
  }
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
  margin-right: ${({ theme }) => theme.spacings.sm};
`;

const LogoTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const LogoTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const LogoSlogan = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacings.sm} 0;
  overflow-y: auto;
`;

const MenuLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  margin: ${({ theme }) => theme.spacings.xs} 0;
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
  padding: ${({ theme }) => theme.spacings.md};
  border-top: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
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
  padding: ${({ theme }) => theme.spacings.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
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
