"use client";
import styled from "styled-components";
import Link from "next/link";
import { AUTH_LINKS } from "./navigationLinks";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";

interface Props {
  onClose: () => void;
}

export default function MobileNavbarLinks({ onClose }: Props) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const { profile: user } = useAppSelector((state) => state.account);
  const isAuthenticated = !!user;

  const navbarLinksSetting = useAppSelector((state) =>
    state.setting.settings.find((s) => s.key === "navbar_main_links")
  );

  const links = (navbarLinksSetting?.value as Record<string, any>) || {};

  return (
    <>
      {Object.entries(links).map(([key, link]) => {
        const label = link.label?.[currentLang] || key;
        const url = link.url || "#";

        return (
          <MobileMenuLink key={key} href={url} onClick={onClose}>
            {label}
          </MobileMenuLink>
        );
      })}

      {!isAuthenticated ? (
        <>
          <MobileMenuLink href={AUTH_LINKS.login.href} onClick={onClose}>
            {AUTH_LINKS.login.labelKey}
          </MobileMenuLink>
          <MobileMenuLink href={AUTH_LINKS.register.href} onClick={onClose}>
            {AUTH_LINKS.register.labelKey}
          </MobileMenuLink>
        </>
      ) : (
        <MobileMenuLink href={AUTH_LINKS.account.href} onClick={onClose}>
          {AUTH_LINKS.account.labelKey}
        </MobileMenuLink>
      )}
    </>
  );
}

const MobileMenuLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  border-bottom: ${({ theme }) =>
    `${theme.borders.thin} ${theme.colors.border}`};
  display: block;
  width: 100%;
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
`;
