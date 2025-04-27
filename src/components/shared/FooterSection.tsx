"use client";

import styled from "styled-components";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaXing,
} from "react-icons/fa6";

const FooterWrapper = styled.footer`
  padding: 2rem 1rem;
  background: ${({ theme }) => theme.backgroundAlt};
  color: ${({ theme }) => theme.text};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  text-align: left;
  margin-top: 2rem;
`;

const FooterBlock = styled.div`
  margin: 1rem;
  max-width: 300px;

  h3 {
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    margin-bottom: 1rem;
  }

  p, li, a {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.textSecondary};
  }

  ul {
    list-style: none;
    padding: 0;
  }

  a {
    text-decoration: none;
    transition: color ${({ theme }) => theme.transition.fast};

    &:hover {
      color: ${({ theme }) => theme.primary};
    }
  }
`;

const SocialMedia = styled.div`
  margin-top: 2rem;

  a {
    margin: 0 0.5rem;
    font-size: 1.2rem;
    color: ${({ theme }) => theme.text};

    &:hover {
      color: ${({ theme }) => theme.primary};
    }
  }
`;

const Copyright = styled.p`
  margin-top: 1.5rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.textSecondary};
`;

export default function FooterSection() {
  const { t } = useTranslation("footer");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <FooterWrapper>
      <img src="/navbar/logo-light.png" alt="Ensotek Logo" width={100} />
      <FooterContent>
        <FooterBlock>
          <h3>{t("aboutTitle")}</h3>
          <ul>
            <li><Link href="/visitor/about#uber-uns">{t("aboutUs")}</Link></li>
            <li><Link href="/visitor/about#vision">{t("vision")}</Link></li>
            <li><Link href="/visitor/about#geschichte">{t("history")}</Link></li>
            <li><Link href="/visitor/about#referenzen">{t("references")}</Link></li>
            <li><Link href="/visitor/contact">{t("contact")}</Link></li>
          </ul>
        </FooterBlock>

        <FooterBlock>
          <h3>{t("contactTitle")}</h3>
          <p>{t("welcomeMessage")}</p>
          <p><strong>{t("center")}:</strong> Oruçreis Mah. Tekstilkent Sit. A17 Blok No:41<br />34235 Esenler / İstanbul - Türkiye</p>
          <p><strong>{t("factory")}:</strong> Saray Mah. Gimat Cad. No:6A<br />06980 Kahramankazan / Ankara - Türkiye</p>
          <p>Email: <a href="mailto:ensotek@ensotek.com.tr">ensotek@ensotek.com.tr</a></p>
          <p>{t("phone")}: +90 212 613 33 01</p>
        </FooterBlock>

        <FooterBlock>
          <h3>{t("servicesTitle")}</h3>
          <ul>
            <li><Link href="/visitor/products">{t("products")}</Link></li>
            <li><Link href="/visitor/materials">{t("materials")}</Link></li>
            <li><Link href="/visitor/articles">{t("articles")}</Link></li>
            <li><Link href="/visitor/contact">{t("getOffer")}</Link></li>
          </ul>
        </FooterBlock>
      </FooterContent>

      <SocialMedia>
        <a href="https://facebook.com/Ensotek/" target="_blank"><FaFacebookF /></a>
        <a href="https://instagram.com/ensotekcoolingtowers/" target="_blank"><FaInstagram /></a>
        <a href="https://linkedin.com/company/ensotek-su-so-utma-kuleleri-ltd-ti-/" target="_blank"><FaLinkedin /></a>
        <a href="https://youtube.com/channel/UCX22ErWzyT4wDqDRGN9zYmg" target="_blank"><FaYoutube /></a>
        <a href="https://x.com/Ensotek_Cooling" target="_blank"><FaXing /></a>
      </SocialMedia>

      <Copyright>
        © {new Date().getFullYear()} Ensotek Kühlturm GmbH. {t("rights")}.<br />
        <a href="https://www.guezelwebdesign.com" target="_blank" rel="noopener noreferrer">Designed by OG</a>
      </Copyright>
    </FooterWrapper>
  );
}
