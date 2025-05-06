"use client";

import { MobileMenuLink } from "./NavbarStyles";
import { AUTH_LINKS } from "./navigationLinks";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";

interface Props {
  onClose: () => void;
}

export function MobileNavbarLinks({ onClose }: Props) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const { profile: user } = useAppSelector((state) => state.account);
  const isAuthenticated = !!user;

  const navbarLinksSetting = useAppSelector((state) =>
    state.setting.settings.find((s) => s.key === "navbar_main_links")
  );

  const links: any = navbarLinksSetting?.value || {};

  return (
    <>
      {Object.entries(links).map(([key, link]: any) => {
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
