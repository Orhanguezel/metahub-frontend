"use client";
import React from "react";
import styled from "styled-components";
import Link from "next/link";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";

const OrderSuccessPage: React.FC = () => {
  const { t } = useI18nNamespace("order", translations);

  return (
    <PageWrapper>
      <WaveBackground />
      <MainContent>
        <SuccessIcon>
          <svg width="86" height="86" viewBox="0 0 86 86" fill="none">
            <circle cx="43" cy="43" r="43" fill={`url(#ensotek-gradient)`} />
            <path
              d="M25 44.5L39 58L62 33"
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="ensotek-gradient" x1="0" y1="0" x2="86" y2="86" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2875c2"/>
                <stop offset="1" stopColor="#0bb6d6"/>
              </linearGradient>
            </defs>
          </svg>
        </SuccessIcon>
        <Title>{t("title")}</Title>
        <Message>{t("purchaseSuccess")}</Message>
        <Message>{t("emailInfo")}</Message>
        <Message>{t("shippingInfo")}</Message>
        <ButtonGroup>
          <StyledLink href="/order">{t("myOrders", "My Orders")}</StyledLink>
          <StyledLinkSecondary href="/">{t("backToHomepage")}</StyledLinkSecondary>
        </ButtonGroup>
      </MainContent>
    </PageWrapper>
  );
};

export default OrderSuccessPage;

// --- Styled Components ---

const PageWrapper = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: ${({ theme }) =>
    `linear-gradient(120deg, ${theme.colors.background} 0%, ${theme.colors.backgroundSecondary} 100%)`};
  position: relative;
  overflow-x: hidden;
`;

const WaveBackground = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  background: url("https://svgshare.com/i/14qv.svg") no-repeat bottom right;
  background-size: 50vw 38vh;
  opacity: 0.11;
`;

const MainContent = styled.main`
  z-index: 2;
  position: relative;
  flex-grow: 1;
  min-height: 75vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 2rem 4rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text || "#18335A"};
`;

const SuccessIcon = styled.div`
  margin-bottom: 2rem;
  svg {
    box-shadow: 0 8px 32px rgba(40, 117, 194, 0.12);
    border-radius: 50%;
    background: #fff;
    display: block;
    margin: 0 auto;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.2rem;
  letter-spacing: -0.5px;
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: 0.7rem;
  max-width: 500px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textPrimary || theme.colors.text};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.3rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const StyledLink = styled(Link)`
  display: inline-block;
  min-width: 170px;
  padding: 0.95em 2em;
  background: ${({ theme }) => `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`};
  color: ${({ theme }) => theme.colors.buttonText};
  text-decoration: none;
  border-radius: 2em;
  font-weight: 600;
  font-size: 1.06rem;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: none;
  transition: background 0.22s, box-shadow 0.22s, color 0.14s;
  &:hover, &:focus {
    background: ${({ theme }) => `linear-gradient(90deg, ${theme.colors.accent} 0%, ${theme.colors.primary} 100%)`};
    color: #fff;
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const StyledLinkSecondary = styled(Link)`
  display: inline-block;
  min-width: 170px;
  padding: 0.95em 2em;
  background: #fff;
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 2em;
  font-weight: 600;
  font-size: 1.06rem;
  margin-left: 0.4rem;
  transition: background 0.19s, color 0.19s, border-color 0.19s;
  text-decoration: none;
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;
