"use client";

import styled from "styled-components";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useTranslation } from "react-i18next";


const HeaderWrapper = styled.header`
  width: 100%;
  min-height: 120px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: ${({ theme }) => `${theme.borders.thin} ${theme.colors.border}`};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const Welcome = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};

  strong {
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ApiKeyInfo = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.success};
  margin-top: 4px;
`;

export default function Header() {
  const { user } = useSelector((state: RootState) => state.auth);
  const settings = useSelector((state: RootState) => state.setting.settings) || [];
  const { t } = useTranslation("header"); // 🔑 Çeviri namespace

  const apiKeySetting = settings.find((s) => s.key === "api_key");
  const hasApiKey = !!apiKeySetting?.value;

  return (
    <HeaderWrapper>
      <Welcome>
        👋 {t("welcome", "Hoş geldiniz")},{" "}
        <strong>{user?.name || t("defaultUser", "Admin")}</strong>
      </Welcome>
      {hasApiKey && (
        <ApiKeyInfo>
          ✅ {t("apiKeyLoaded", "API Key başarıyla yüklendi.")}
        </ApiKeyInfo>
      )}
    </HeaderWrapper>
  );
}
