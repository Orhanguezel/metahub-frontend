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

// basit url normalizer: şema yoksa https ekler
const normalizeUrl = (u: unknown) => {
  const s = String(u || "").trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
};

export default function SocialLinks() {
  const company = useAppSelector((state) => state.company.company);
  if (!company || !company.socialLinks) return null;

  return (
    <SocialLinksWrapper>
      {Object.entries(company.socialLinks).map(([key, url]) => {
        const icon = ICON_MAP[key.toLowerCase()];
        const href = normalizeUrl(url);
        if (!icon || !href) return null;

        const label = key.charAt(0).toUpperCase() + key.slice(1);

        return (
          <IconCircleButton
            // kritik kısım: anchor olarak render + href ekle
            as="a"
            href={href}
            key={key}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            tabIndex={0}
          >
            {icon}
          </IconCircleButton>
        );
      })}
    </SocialLinksWrapper>
  );
}

const SocialLinksWrapper = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textMuted};
  gap: 14px;

  @media (max-width: 900px) { gap: 10px; }
  @media (max-width: 600px) { gap: 6px; }
`;
