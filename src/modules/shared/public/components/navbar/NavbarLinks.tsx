"use client";
import styled from "styled-components";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { SPECIAL_NAV_LINK } from "./navigationLinks";

export default function NavbarLinks() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const { settings = [] } = useAppSelector((state) => state.setting || {});
  const navbarLinksSetting = settings.find(
    (s) => s.key === "navbar_main_links"
  );

  const links: any = navbarLinksSetting?.value || {};

  return (
    <>
      {Object.entries(links).map(([key, link]: any) => {
        const label = link.label?.[currentLang] || key;
        const url = link.url || "#";

        return (
          <MenuItem key={key}>
            <MenuLink href={url}>{label}</MenuLink>
          </MenuItem>
        );
      })}

      <MenuItem1>
        <MenuLink href={SPECIAL_NAV_LINK.href}>
          {SPECIAL_NAV_LINK.icon}
        </MenuLink>
      </MenuItem1>
    </>
  );
}

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
  letter-spacings: 0.5px;
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
