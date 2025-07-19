"use client";
import styled from "styled-components";
import Link from "next/link";
import { AUTH_LINKS } from "./navigationLinks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";
import { SupportedLocale } from "@/types/common";;
import { useAppSelector } from "@/store/hooks";
import { usePathname } from "next/navigation";


interface Props {
  onClose: () => void;
}

export default function MobileNavbarLinks({ onClose }: Props) {
   const { i18n, t } = useI18nNamespace("navbar", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { profile: user } = useAppSelector((state) => state.account);
  const isAuthenticated = !!user;

  const navbarLinksSetting = useAppSelector((state) =>
    state.settings.settings.find((s: any) => s.key === "navbar_main_links")
  );

  const links = (navbarLinksSetting?.value as Record<string, any>) || {};

  const pathname = usePathname();

  return (
    <>
      {Object.entries(links).map(([key, link]) => {
        const label =
          link.label?.[lang] ||
          link.label?.en ||
          link.label?.tr ||
          key;
        const href = link.href || "#";

        return (
          <MobileMenuLink
  key={key}
  href={href}
  $active={pathname === href}
  onClick={onClose}
>
  {label}
</MobileMenuLink>
        );
      })}

      {!isAuthenticated ? (
        <>
          <MobileMenuLink href={AUTH_LINKS.login.href} onClick={onClose}>
            {t(AUTH_LINKS.login.labelKey)}
          </MobileMenuLink>
          <MobileMenuLink href={AUTH_LINKS.register.href} onClick={onClose}>
            {t(AUTH_LINKS.register.labelKey)}
          </MobileMenuLink>
        </>
      ) : (
        <MobileMenuLink href={AUTH_LINKS.account.href} onClick={onClose}>
          {t(AUTH_LINKS.account.labelKey)}
        </MobileMenuLink>
      )}
    </>
  );
}

const MobileMenuLink = styled(Link)<{ $active?: boolean }>`
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
  }

  &:active {
    background: ${({ theme }) => theme.colors.primaryTransparent};
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

