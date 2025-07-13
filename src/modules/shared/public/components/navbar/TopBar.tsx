"use client";
import styled from "styled-components";
import { SocialLinks } from "@/modules/shared";
import { FaPhone } from "react-icons/fa";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales/navbar";
import { useAppSelector } from "@/store/hooks";

export default function TopBar() {
   const { i18n } = useI18nNamespace("navbar", translations);
  const { settings } = useAppSelector((state) => state.settings);

  // Setting'ten telefonu çek
  const phoneSetting = settings?.find((s: any) => s.key === "navbar_contact_phone");

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

const TopBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.backgroundAlt || "#fdfaf4"};
  color: ${({ theme }) => theme.colors.primary || "#8b5e3c"};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Phone = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;
