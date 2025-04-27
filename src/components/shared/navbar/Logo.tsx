"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface LogoProps {
  logoSrc: string;
  width?: number;
  height?: number;
}

export function Logo({ logoSrc, width = 60, height = 60 }: LogoProps) {
  const { t } = useTranslation("navbar");
  return (
    <LogoWrapper href="/">
      <LogoImage
        src={logoSrc}
        alt="Logo"
        width={width}
        height={height}
        priority
      />
      <LogoTextWrapper>
        <LogoText>Retroy</LogoText>
        <LogoText2>{t("navbar.slogan")}</LogoText2>
      </LogoTextWrapper>
    </LogoWrapper>
  );
}

const LogoWrapper = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
`;

const LogoImage = styled(Image)`
  height: 60px;
  width: auto;
  object-fit: contain;
`;

const LogoTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoText = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
`;

const LogoText2 = styled.span`
  font-size: 0.85rem;
  font-style: italic;
  color: ${({ theme }) => theme.textSecondary};
`;
