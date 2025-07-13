"use client";
import styled from "styled-components";
import Link from "next/link";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";
import { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks";
import { SPECIAL_NAV_LINK } from "./navigationLinks";

export default function NavbarLinks() {
  const { i18n} = useI18nNamespace("navbar", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const settings = useAppSelector((state) => state.settings.settings || []);
  const navbarLinksSetting = settings.find((s: any) => s.key === "navbar_main_links");

  // Her bir link için url (json’da url), label ve fallback
  const links = navbarLinksSetting?.value || {};

  return (
    <>
      {Object.entries(links).map(([key, link]: any) => {
        const label =
          link.label?.[lang] ||
          link.label?.en ||
          link.label?.tr ||
          key;
        const url = link.url || "/"; // **DOĞRU: url**

        // Eğer url boşsa, link göstermeyelim!
        if (!url.trim()) return null;

        return (
          <MenuItem key={key}>
            <MenuLink href={url}>{label}</MenuLink>
          </MenuItem>
        );
      })}

      {/* Eğer özel bir ikonlu link varsa */}
      <MenuItem1>
        <MenuLink href={SPECIAL_NAV_LINK.href}>
          {SPECIAL_NAV_LINK.icon}
        </MenuLink>
      </MenuItem1>
    </>
  );
}

// --- Styled Components ---

const MenuItem = styled.li`
  list-style: none;
  position: relative;
  cursor: pointer;
`;

const MenuItem1 = styled.li`
  list-style: none;
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const MenuLink = styled(Link)`
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
