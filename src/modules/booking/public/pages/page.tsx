"use client";

import React from "react";
import styled from "styled-components";
import {BookingForm} from "@/modules/booking";
import { useTranslation } from "react-i18next";

export default function BookingPublicPage() {
  const { t } = useTranslation("booking");

  return (
    <Wrapper>
      <Title>{t("page.title", "Book Your Appointment")}</Title>
      <Description>{t("page.description", "Fill in the form below to schedule your session.")}</Description>

      <BookingForm />
    </Wrapper>
  );
}

// 💅 Styled Components
const Wrapper = styled.main`
  max-width: 960px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: 1rem;
`;

const Description = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  margin-bottom: 2rem;
`;
