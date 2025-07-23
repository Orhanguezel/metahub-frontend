"use client";
import styled from "styled-components";
import Link from "next/link";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";
import { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks";
//import { SPECIAL_NAV_LINK } from "./navigationLinks";

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

      {/* Eğer özel bir ikonlu link varsa 
      <MenuItem1>
        <MenuLink href={SPECIAL_NAV_LINK.href}>
          {SPECIAL_NAV_LINK.icon}
        </MenuLink>
      </MenuItem1>*/}
    </>
  );
}

// --- Styled Components ---
const MenuItem = styled.li`
  list-style: none;
  position: relative;
  display: flex;
  align-items: center;
  margin: 0 0.12rem;

  ${({ theme }) => theme.breakpoints.laptop} {
    margin: 0 0.06rem;
  }
`;
/*
const MenuItem1 = styled(MenuItem)`
  padding: 0;
  justify-content: flex-end;
  align-items: center;
`;
*/

const MenuLink = styled(Link).attrs<{ $active?: boolean }>(props => ({
  className: props.$active ? "active" : "",
}))<{ $active?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.bold : theme.fontWeights.medium};
  font-size: 1.45rem;
  text-transform: capitalize;
  letter-spacing: 0.003em;
  padding: 0.15rem 0.36rem 0.13rem 0.32rem;  // Yine de küçük!
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primaryTransparent : "transparent"};

  transition:
    background 0.13s,
    color 0.12s,
    font-weight 0.10s,
    font-size 0.09s,
    padding 0.1s;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryTransparent};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    text-decoration: none;
  }

  &.active,
  &[aria-current="page"] {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryTransparent};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  &::after {
    content: "";
    display: block;
    position: absolute;
    left: 6px;
    right: 6px;
    bottom: 2px;
    height: 1.8px;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 1px;
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transform: scaleX(${({ $active }) => ($active ? 1 : 0)});
    transform-origin: center;
    transition: transform 0.13s cubic-bezier(.4,1,.45,.95), opacity 0.09s;
  }

  // RESPONSIVE KISIMDA DA max-width, overflow, ellipsis KULLANMA!
  @media (min-width: 1640px) {
    font-size: 1.27rem;
    padding: 0.19rem 0.40rem 0.16rem 0.34rem;
  }
  @media (min-width: 1440px) and (max-width: 1639px) {
    font-size: 1.10rem;
    padding: 0.15rem 0.23rem 0.13rem 0.19rem;
  }
  @media (min-width: 1024px) and (max-width: 1439px) {
    font-size: 1.03rem;
    padding: 0.12rem 0.12rem 0.10rem 0.10rem;
  }
  @media (min-width: 900px) and (max-width: 1023px) {
    font-size: 0.97rem;
    padding: 0.08rem 0.09rem 0.08rem 0.09rem;
  }
  @media (min-width: 600px) and (max-width: 899px) {
    font-size: 0.8rem;
    padding: 0.06rem 0.07rem 0.06rem 0.07rem;
  }
  @media (min-width: 425px) and (max-width: 599px) {
    font-size: 0.7rem;
    padding: 0.03rem 0.05rem 0.03rem 0.04rem;
  }
`;


