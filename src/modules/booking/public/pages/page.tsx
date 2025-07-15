"use client";

import React from "react";
import styled from "styled-components";
import { BookingForm } from "@/modules/booking";
import SlotRulesTable from "@/modules/booking/public/components/SlotRulesTable";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/booking";

export default function BookingPublicPage() {
  const { t } = useI18nNamespace("booking", translations);

  return (
    <Wrapper>
      <Header>
        <Title aria-label={t("page.title", "Book Your Appointment")}>
          {t("page.title", "Book Your Appointment")}
        </Title>
        <Description aria-label={t("page.description", "Fill in the form below to schedule your session.")}>
          {t("page.description", "Fill in the form below to schedule your session.")}
        </Description>
      </Header>
      <ResponsiveContent>
        <LeftCard>
          <SlotRulesTable />
        </LeftCard>
        <RightCard>
          <BookingForm />
        </RightCard>
      </ResponsiveContent>
    </Wrapper>
  );
}

// --- Styled Components ---

const Wrapper = styled.main`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.sectionBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};

  @media ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.lg};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.xl};
`;

const Title = styled.h1`
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};

  @media ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

const Description = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: 0;
  font-family: ${({ theme }) => theme.fonts.body};
`;

const ResponsiveContent = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xxl};
  justify-content: center;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacings.lg};
  }
`;

const LeftCard = styled.section`
  flex: 1;
  min-width: 260px;
  max-width: 470px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.xl};
  order: 1;

  @media (max-width: 900px) {
    max-width: 100%;
    padding: ${({ theme }) => theme.spacings.lg};
    margin-bottom: ${({ theme }) => theme.spacings.md};
    order: 2;
  }
`;

const RightCard = styled.section`
  flex: 2;
  min-width: 320px;
  max-width: 600px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.xl};
  order: 2;

  @media (max-width: 900px) {
    max-width: 100%;
    padding: ${({ theme }) => theme.spacings.lg};
    order: 1;
  }
`;

