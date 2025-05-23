"use client";

import { MenuItem, MenuItem1, MenuLink } from "./NavbarStyles";
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
