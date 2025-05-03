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

// 🔥 İkonlar map'i
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
    <SocialMedia>
      {activeLinks.map(([key, url]) => {
        const normalizedKey = key.trim().toLowerCase();
        const icon = iconMap[normalizedKey];

        if (!icon) return null; // desteklenmeyen sosyal medya varsa geç

        console.log("🌀 Rendering icon:", normalizedKey, "➡️", url);

        return (
          <SocialLink
            key={normalizedKey}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={normalizedKey}
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
  gap: ${({ theme }) => theme.spacing.sm};

  ${({ theme }) => theme.media.small} {
    margin-top: ${({ theme }) => theme.spacing.md};
  }
`;

const SocialLink = styled.a`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color ${({ theme }) => theme.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
