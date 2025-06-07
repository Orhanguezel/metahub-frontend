"use client";

import React from "react";
import styled from "styled-components";
import { BookingForm } from "@/modules/booking";
import SlotRulesTable from "@/modules/booking/public/components/SlotRulesTable";
import { useTranslation } from "react-i18next";

export default function BookingPublicPage() {
  const { t } = useTranslation("booking");

  return (
    <Wrapper>
      <Header>
        <Title>{t("page.title", "Book Your Appointment")}</Title>
        <Description>
          {t(
            "page.description",
            "Fill in the form below to schedule your session."
          )}
        </Description>
      </Header>
      <Content>
        <Left>
          <SlotRulesTable />
        </Left>
        <Right>
          <BookingForm />
        </Right>
      </Content>
    </Wrapper>
  );
}

// Styled Components ... (senin mevcut stilin zaten uygun)


// Styled Components
const Wrapper = styled.main`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
`;

const Description = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: 0;
  font-family: ${({ theme }) => theme.fonts.body};
`;

const Content = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxl};
  justify-content: center;

  @media ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const Left = styled.div`
  flex: 1;
  min-width: 280px;
  max-width: 370px;

  @media ${({ theme }) => theme.media.mobile} {
    max-width: 100%;
  }
`;

const Right = styled.div`
  flex: 2;
  min-width: 340px;
  max-width: 600px;

  @media ${({ theme }) => theme.media.mobile} {
    max-width: 100%;
  }
`;
