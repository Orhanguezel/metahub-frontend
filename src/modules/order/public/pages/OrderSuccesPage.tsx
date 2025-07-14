"use client";

import React from "react";
import styled from "styled-components";
import Link from "next/link";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/order";

// İstersen react-icons kullanabilirsin, örnek:
// import { FaCheckCircle } from "react-icons/fa";

const OrderSuccessPage: React.FC = () => {
  const { t} = useI18nNamespace("order", translations);

  return (
    <PageWrapper>
      <MainContent>
        <SuccessIcon>
          {/* <FaCheckCircle /> */}
          <span role="img" aria-label="success" style={{ fontSize: "4rem" }}>
            ✅
          </span>
        </SuccessIcon>
        <Title>{t("title")}</Title>
        <Message>{t("purchaseSuccess")}</Message>
        <Message>{t("emailInfo")}</Message>
        <Message>{t("shippingInfo")}</Message>
        <StyledLink href="/order">{t("myOrders", "My Orders")}</StyledLink>
        <StyledLink href="/">{t("backToHomepage")}</StyledLink>
      </MainContent>
    </PageWrapper>
  );
};

export default OrderSuccessPage;

// --- Styled Components ---

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.grey || "#f0f0f0"};
`;

const MainContent = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 2rem 4rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.black || "#000"};
`;

const SuccessIcon = styled.div`
  font-size: 4rem;
  color: #28a745;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  max-width: 500px;
  line-height: 1.6;
`;

// next/link için styled-component
const StyledLink = styled(Link)`
  display: inline-block;
  margin-top: 2rem;
  padding: 0.8em 2em;
  background-color: ${({ theme }) => theme.colors.primary || "#0a0a0a"};
  color: ${({ theme }) => theme.colors.white || "#fff"};
  text-decoration: none;
  border-radius: 25px;
  font-weight: 500;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary || "#303030"};
  }
`;
