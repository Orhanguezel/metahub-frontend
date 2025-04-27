"use client";

import { MenuItem, MenuItem1, MenuLink } from "./NavbarStyles";
import { MAIN_NAV_LINKS, SPECIAL_NAV_LINK } from "./navigationLinks";
import { useTranslation } from "react-i18next";
import { MenuDropdown, DropdownLink } from "./MenuDropdown";

export function NavbarLinks() {
  const { t } = useTranslation("navbar");

  return (
    <>
      {MAIN_NAV_LINKS.map((item) => {
        if (item.type === "link") {
          return (
            <MenuItem key={item.href}>
              <MenuLink href={item.href}>{t(item.labelKey)}</MenuLink>
            </MenuItem>
          );
        }

        if (item.type === "dropdown") {
          return (
            <MenuItem key={item.key}>
              <MenuDropdown label={t(item.labelKey)}>
                {item.children.map((child) => (
                  <DropdownLink key={child.href} href={child.href}>
                    {t(child.labelKey)}
                  </DropdownLink>
                ))}
              </MenuDropdown>
            </MenuItem>
          );
        }

        return null;
      })}

      <MenuItem1>
        <MenuLink href={SPECIAL_NAV_LINK.href}>
          {SPECIAL_NAV_LINK.icon}
        </MenuLink>
      </MenuItem1>
    </>
  );
}
