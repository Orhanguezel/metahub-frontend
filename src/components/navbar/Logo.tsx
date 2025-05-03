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
  gap: ${({ theme }) => theme.spacing.xs};
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
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const LogoText2 = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-style: italic;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
`;
