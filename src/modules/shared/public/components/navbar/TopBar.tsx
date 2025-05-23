"use client";

import { TopBar as TopBarWrapper, Phone } from "./NavbarStyles";
import { SocialLinks } from "@/modules/shared";
import { FaPhone } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";

export default function TopBar() {
  const { i18n } = useTranslation("navbar");
  const { settings } = useAppSelector((state) => state.setting);

  // Setting'ten telefonu çek
  const phoneSetting = settings?.find((s) => s.key === "navbar_contact_phone");

  let phone = "+49 1764 1107158"; // varsayılan fallback

  if (phoneSetting && typeof phoneSetting.value === "object") {
    const lang = i18n.language;
    const value = phoneSetting.value as Record<string, string>;
    phone = value[lang] || value.en || value.de || phone;
  }

  return (
    <TopBarWrapper>
      <SocialLinks />
      <Phone>
        <FaPhone /> {phone}
      </Phone>
    </TopBarWrapper>
  );
}
