"use client";
import React from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";

const UsersCard = () => {
  const { t } = useTranslation("admin-dashboard"); // dashboard → admin-dashboard olarak düzeltildi!
  const userCount = useAppSelector((s) => s.dashboard.stats?.users ?? 0);

  return (
    <Card>
      <Title>{t("users", "Toplam Kullanıcı")}</Title>
      <Number>{userCount}</Number>
    </Card>
  );
};
export default UsersCard;

// --- Styled Components ---
const Card = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1.2rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 3px 16px rgba(0, 0, 0, 0.07);
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Number = styled.div`
  font-size: 2.1rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;
