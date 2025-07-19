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
  FaYoutube,
} from "react-icons/fa";

// Sosyal ikon haritası
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
          <SocialIconLink
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={key}
            title={key.charAt(0).toUpperCase() + key.slice(1)}
          >
            {IconComponent}
          </SocialIconLink>
        );
      })}
    </SocialLinksWrapper>
  );
}

const SocialLinksWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;

  @media (max-width: 900px) {
    gap: 12px;
  }
  @media (max-width: 600px) {
    gap: 7px;
  }
`;

const SocialIconLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.13em;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  transition:
    color 0.17s,
    background 0.16s,
    box-shadow 0.16s;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.primaryTransparent};
    color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 1px 6px 0 ${({ theme }) => theme.colors.primaryTransparent};
  }

  @media (max-width: 900px) {
    width: 26px;
    height: 26px;
    font-size: 1em;
  }
  @media (max-width: 600px) {
    width: 22px;
    height: 22px;
    font-size: 0.92em;
  }
`;
