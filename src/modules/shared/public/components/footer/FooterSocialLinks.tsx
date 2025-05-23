"use client";

import styled from "styled-components";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaXing,
  FaTwitter,
  FaTiktok,
  FaPinterest,
  FaTelegram,
  FaWhatsapp,
} from "react-icons/fa6";
import React from "react";
import { SocialLinks } from "@/types/SocialLinks";

interface FooterSocialLinksProps {
  links?: SocialLinks;
}

// İkon haritası
const iconMap: { [key: string]: React.ReactNode } = {
  facebook: <FaFacebookF />,
  instagram: <FaInstagram />,
  linkedin: <FaLinkedin />,
  youtube: <FaYoutube />,
  xing: <FaXing />,
  twitter: <FaTwitter />,
  tiktok: <FaTiktok />,
  pinterest: <FaPinterest />,
  telegram: <FaTelegram />,
  whatsapp: <FaWhatsapp />,
};

export default function FooterSocialLinks({ links }: FooterSocialLinksProps) {
  if (!links) return null;

  const activeLinks = Object.entries(links).filter(([key, url]) => {
    const normalizedKey = key.trim().toLowerCase();
    return !!url && !!iconMap[normalizedKey];
  });

  if (activeLinks.length === 0) return null;

  return (
    <SocialMedia aria-label="Social Media Links">
      {activeLinks.map(([key, url]) => {
        const normalizedKey = key.trim().toLowerCase();
        const icon = iconMap[normalizedKey];

        if (!icon) return null;

        return (
          <SocialLink
            key={normalizedKey}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1)}
            tabIndex={0}
          >
            {icon}
          </SocialLink>
        );
      })}
    </SocialMedia>
  );
}

// 🎨 Styled Components
const SocialMedia = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.small} {
    margin-top: ${({ theme }) => theme.spacing.md};
  }
`;

const SocialLink = styled.a`
  font-size: 1.7rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color ${({ theme }) => theme.transition.fast}, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 6px;
  outline: none;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    transform: translateY(-2px) scale(1.08);
  }
`;
