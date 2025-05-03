"use client";

import { MobileMenuLink } from "./NavbarStyles";
import { MAIN_NAV_LINKS, AUTH_LINKS } from "./navigationLinks";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { MenuDropdown, DropdownLink } from "./MenuDropdown"; 

interface Props {
  onClose: () => void;
}

export function MobileNavbarLinks({ onClose }: Props) {
  const { t } = useTranslation("navbar");
  const { profile: user } = useAppSelector((state) => state.account);
  const isAuthenticated = !!user;

  return (
    <>
      {MAIN_NAV_LINKS.map((item) =>
        item.type === "link" ? (
          <MobileMenuLink key={item.href} href={item.href} onClick={onClose}>
            {t(item.labelKey)}
          </MobileMenuLink>
        ) : item.type === "dropdown" ? (
          <MenuDropdown
            key={item.key}
            label={t(item.labelKey)}
            isMobile
            onClose={onClose}
          >
            {item.children.map((child) => (
              <DropdownLink
                key={child.href}
                href={child.href}
                isMobile
              >
                {t(child.labelKey)}
              </DropdownLink>
            ))}
          </MenuDropdown>
        ) : null
      )}

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


