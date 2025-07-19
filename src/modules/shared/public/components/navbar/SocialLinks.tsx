// /modules/shared/SocialLinks.tsx
"use client";
import { IconCircleButton } from "@/shared/IconCircleButton";
import { useAppSelector } from "@/store/hooks";
import {
  FaInstagram, FaTiktok, FaPinterestP, FaFacebook,
  FaLinkedin, FaTwitter, FaYoutube
} from "react-icons/fa";
import styled from "styled-components";
import type { ReactNode } from "react";

const ICON_MAP: Record<string, ReactNode> = {
  facebook: <FaFacebook />,
  instagram: <FaInstagram />,
  tiktok: <FaTiktok />,
  pinterest: <FaPinterestP />,
  linkedin: <FaLinkedin />,
  twitter: <FaTwitter />,
  youtube: <FaYoutube />,
};

export default function SocialLinks() {
  const company = useAppSelector((state) => state.company.company);
  if (!company || !company.socialLinks) return null;
  return (
    <SocialLinksWrapper>
      {Object.entries(company.socialLinks).map(([key, url]) => {
        if (!url) return null;
        const IconComponent = ICON_MAP[key.toLowerCase()];
        if (!IconComponent) return null;
        return (
          <IconCircleButton
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={key}
            title={key.charAt(0).toUpperCase() + key.slice(1)}
            tabIndex={0}
          >
            {IconComponent}
          </IconCircleButton>
        );
      })}
    </SocialLinksWrapper>
  );
}

const SocialLinksWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  @media (max-width: 900px) { gap: 10px; }
  @media (max-width: 600px) { gap: 6px; }
`;
