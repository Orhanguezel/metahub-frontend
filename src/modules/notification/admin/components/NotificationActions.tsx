import React from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/notification/locales";

interface Props {
  isRead: boolean;
  onMarkRead: () => void;
  onDelete: () => void;
}
export default function NotificationActions({ isRead, onMarkRead, onDelete }: Props) {
  const { t } = useI18nNamespace("notification", translations);
  return (
    <div>
      {!isRead && (
        <ActionButton onClick={onMarkRead}>{t("markRead", "Okundu Yap")}</ActionButton>
      )}
      <ActionButton danger onClick={onDelete}>{t("delete", "Sil")}</ActionButton>
    </div>
  );
}

const ActionButton = styled.button<{ danger?: boolean }>`
  background: ${({ danger, theme }) =>
    danger ? theme.colors.dangerBg : theme.colors.buttonBackground};
  color: ${({ danger, theme }) =>
    danger ? theme.colors.danger : theme.colors.buttonText};
  border: ${({ theme }) => theme.borders.thin}
    ${({ danger, theme }) => (danger ? theme.colors.danger : theme.colors.buttonBorder)};
  padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  margin-right: ${({ theme }) => theme.spacings.xs};
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: ${({ danger, theme }) =>
      danger ? theme.colors.danger : theme.colors.primaryHover};
    color: #fff;
  }
`;
