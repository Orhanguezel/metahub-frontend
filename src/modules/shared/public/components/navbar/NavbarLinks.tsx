"use client";
import styled from "styled-components";
import Link from "next/link";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";
import { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks";

export default function NavbarLinks() {
  const { i18n } = useI18nNamespace("navbar", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const settings = useAppSelector((state) => state.settings.settings || []);
  const navbarLinksSetting = settings.find((s: any) => s.key === "navbar_main_links");

  const links = navbarLinksSetting?.value || {};

  return (
    <>
      {Object.entries(links).map(([key, link]: any) => {
        const label = link.label?.[lang] || key;
        const url = (link.url || "/").trim();
        if (!url) return null;

        return (
          <MenuItem key={key}>
            <MenuLink href={url}>{label}</MenuLink>
          </MenuItem>
        );
      })}
    </>
  );
}

/* ---------------- styled ---------------- */

const MenuItem = styled.li`
  list-style: none;
  position: relative;
  display: flex;
  align-items: center;
  margin: 0 0.12rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.laptop}) {
    margin: 0 0.06rem;
  }
`;

const MenuLink = styled(Link).attrs<{ $active?: boolean }>(props => ({
  className: props.$active ? "active" : "",
}))<{ $active?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;

  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  text-decoration: none;                 /* ✨ temel durumda alt çizgi yok */

  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: 1.12rem;
  text-transform: capitalize;
  letter-spacing: 0.003em;
  padding: 0.28rem 0.6rem;
  border-radius: ${({ theme }) => theme.radii.pill};

  transition:
    background ${({ theme }) => theme.transition.fast},
    color ${({ theme }) => theme.transition.fast},
    border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  /* 🔥 Hover: alt çizgi YOK, sadece arkaplan/border rengi */
  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.borderHighlight};
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    text-decoration: none;
  }

  /* ✅ Active: sarı chip + siyah metin + sarı border */
  &.active,
  &[aria-current="page"],
  ${({ $active }) => $active && "&"} {
    background: ${({ theme }) => theme.colors.cardBackground};
    color: ${({ theme }) => theme.colors.black};
    border-color: ${({ theme }) => theme.colors.borderHighlight};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  /* Active + hover: görünümü koru (alt çizgi kalacak) */
  &.active:hover,
  &.active:focus-visible {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.black};
    border-color: ${({ theme }) => theme.colors.secondaryDark};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  /* 🔻 Alt vurgu çizgisi — SADECE aktifken */
  &::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 4px;
    height: 2px;
    background: ${({ theme }) => theme.colors.borderHighlight};
    border-radius: 2px;
    opacity: 0;
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.18s cubic-bezier(.4,1,.45,.95), opacity 0.12s;
  }
  &.active::after,
  &[aria-current="page"]::after,
  ${({ $active }) => $active && "&::after"} {
    opacity: 1;
    transform: scaleX(1);
  }

  /* Responsive */
  @media (min-width: 1640px) {
    font-size: 1.08rem;
    padding: 0.26rem 0.56rem;
  }
  @media (max-width: 1440px) {
    font-size: 1.02rem;
    padding: 0.24rem 0.5rem;
  }
  @media (max-width: 1024px) {
    font-size: 0.98rem;
    padding: 0.22rem 0.44rem;
  }
  @media (max-width: 900px) {
    font-size: 0.94rem;
    padding: 0.2rem 0.4rem;
  }
  @media (max-width: 600px) {
    font-size: 0.88rem;
    padding: 0.18rem 0.34rem;
  }
  @media (max-width: 425px) {
    font-size: 0.84rem;
    padding: 0.16rem 0.3rem;
  }
`;
