"use client";
import styled from "styled-components";
import { AUTH_LINKS } from "./navigationLinks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";
import { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  onClose: () => void;
}

export default function MobileNavbarLinks({ onClose }: Props) {
  const { i18n, t } = useI18nNamespace("navbar", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { profile: user } = useAppSelector((state) => state.account);
  const isAuthenticated = !!user;

  // --- Linkleri alırken url/href fallback ile alınmalı! ---
  const navbarLinksSetting = useAppSelector((state) =>
    state.settings.settings.find((s: any) => s.key === "navbar_main_links")
  );
  // .value'nın yapısına dikkat et!
  const links = (navbarLinksSetting?.value as Record<string, any>) || {};

  const pathname = usePathname();
  const router = useRouter();

  // --- Navigation handler ---
  const handleNav = (targetUrl: string) => {
    if (!targetUrl || targetUrl === "#") return;
    if (pathname !== targetUrl) router.push(targetUrl);
    onClose();
  };

  return (
    <>
      {Object.entries(links).map(([key, link]) => {
        // url veya href alanını güvenli çek!
        const targetUrl = link.url || link.href || "#";
        const label =
          link.label?.[lang] ||
          link.label?.en ||
          link.label?.tr ||
          key;

        // Eğer URL boşsa atla!
        if (!targetUrl || targetUrl === "#") return null;

        return (
          <MobileMenuButton
            key={key}
            $active={pathname === targetUrl}
            type="button"
            onClick={() => handleNav(targetUrl)}
            tabIndex={0}
          >
            {label}
          </MobileMenuButton>
        );
      })}

      {!isAuthenticated ? (
        <>
          <MobileMenuButton
            $active={pathname === AUTH_LINKS.login.href}
            type="button"
            onClick={() => handleNav(AUTH_LINKS.login.href)}
          >
            {t(AUTH_LINKS.login.labelKey)}
          </MobileMenuButton>
          <MobileMenuButton
            $active={pathname === AUTH_LINKS.register.href}
            type="button"
            onClick={() => handleNav(AUTH_LINKS.register.href)}
          >
            {t(AUTH_LINKS.register.labelKey)}
          </MobileMenuButton>
        </>
      ) : (
        <MobileMenuButton
          $active={pathname === AUTH_LINKS.account.href}
          type="button"
          onClick={() => handleNav(AUTH_LINKS.account.href)}
        >
          {t(AUTH_LINKS.account.labelKey)}
        </MobileMenuButton>
      )}
    </>
  );
}

const MobileMenuButton = styled.button<{ $active?: boolean }>`
  display: block;
  width: 100%;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.bold : theme.fontWeights.medium};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.text};
  padding: 16px 24px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  margin-bottom: 3px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primaryTransparent : "transparent"};
  border-left: 4px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary : "transparent"};
  text-align: left;
  cursor: pointer;
  transition:
    background 0.16s,
    color 0.14s,
    border-color 0.15s,
    font-weight 0.13s;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.cardBackground};
    border-left: 4px solid ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    outline: none;
  }

  &:active {
    background: ${({ theme }) => theme.colors.primaryTransparent};
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`;
