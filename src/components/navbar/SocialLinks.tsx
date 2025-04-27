"use client";

import { SocialLinks as SocialLinksWrapper } from "./NavbarStyles";
import { FaInstagram, FaTiktok, FaPinterestP } from "react-icons/fa";

const SOCIAL_LINKS = [
  { href: "https://instagram.com", icon: <FaInstagram /> },
  { href: "https://tiktok.com", icon: <FaTiktok /> },
  { href: "https://pinterest.com", icon: <FaPinterestP /> },
];

export function SocialLinks() {
  return (
    <SocialLinksWrapper>
      {SOCIAL_LINKS.map((item, index) => (
        <a
          key={index}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.icon}
        </a>
      ))}
    </SocialLinksWrapper>
  );
}
