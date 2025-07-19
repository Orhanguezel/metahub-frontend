// @/modules/shared/FooterSocialLinks.tsx
"use client";
import styled from "styled-components";
import {
  FaFacebookF, FaInstagram, FaLinkedin, FaYoutube, FaXing,
  FaTwitter, FaTiktok, FaPinterest, FaTelegram, FaWhatsapp,
} from "react-icons/fa6";
import React from "react";
import { useAppSelector } from "@/store/hooks";
import { ISocialLink } from "@/modules/company/types";

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

export default function FooterSocialLinks() {
  const company = useAppSelector((state) => state.company.company);
  const links: ISocialLink | undefined = company?.socialLinks;

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

const SocialMedia = styled.div`
  margin-top: ${({ theme }) => theme.spacings.lg};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.md};

  ${({ theme }) => theme.media.small} {
    gap: ${({ theme }) => theme.spacings.sm};
    margin-top: ${({ theme }) => theme.spacings.md};
  }
`;

const SocialLink = styled.a`
  font-size: 2.1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: transparent;
  border-radius: 50%;
  padding: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 8px 0 ${({ theme }) => theme.colors.primaryTransparent};
  transition:
    color ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast},
    box-shadow 0.2s,
    transform 0.18s cubic-bezier(.27,1.4,.5,.99);

  /* hover & focus: canlı ve modern efekt */
  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.primary};
    background: linear-gradient(
      100deg,
      ${({ theme }) => theme.colors.primaryTransparent} 0%,
      ${({ theme }) => theme.colors.footerBackground} 85%
    );
    box-shadow: 0 2px 18px 0 ${({ theme }) => theme.colors.primaryTransparent};
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
    transform: translateY(-3px) scale(1.12);
  }

  &:active {
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.backgroundAlt};
    transform: scale(0.97);
  }
`;
