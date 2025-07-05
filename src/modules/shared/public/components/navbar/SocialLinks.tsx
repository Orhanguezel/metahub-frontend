"use client";
import styled from "styled-components";
import type { ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  FaInstagram,
  FaTiktok,
  FaPinterestP,
  FaFacebook,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

// 🔑 Desteklenen ikonlar (string -> gerçek ikon)
const ICON_MAP: Record<string, ReactNode> = {
  FaInstagram: <FaInstagram />,
  FaTiktok: <FaTiktok />,
  FaPinterestP: <FaPinterestP />,
  FaFacebook: <FaFacebook />,
  FaLinkedin: <FaLinkedin />,
  FaTwitter: <FaTwitter />,
};

export default function SocialLinks() {
  const settings = useAppSelector((state) => state.setting.settings) || [];
  const socialLinksSetting = settings.find(
    (s) => s.key === "navbar_social_links"
  );
  const socialLinks =
    socialLinksSetting?.value && typeof socialLinksSetting.value === "object"
      ? socialLinksSetting.value
      : {};

  return (
    <SocialLinksWrapper>
      {Object.entries(socialLinks).map(([key, { url, icon }]: any) => {
        if (!url || !icon) return null;
        const IconComponent = ICON_MAP[icon] || null;
        if (!IconComponent) return null;

        return (
          <a key={key} href={url} target="_blank" rel="noopener noreferrer">
            {IconComponent}
          </a>
        );
      })}
    </SocialLinksWrapper>
  );
}

const SocialLinksWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  a {
    color: inherit;
    font-size: ${({ theme }) => theme.fontSizes.md};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover || "#d9a441"};
    }
  }
`;
