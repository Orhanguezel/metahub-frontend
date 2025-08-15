"use client";
import React from "react";
import styled from "styled-components";
import type { INotification } from "@/modules/notification/types"; // v2 type
import type { SupportedLocale } from "@/types/common";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/notification/locales";
import NotificationActions from "./NotificationActions";

interface Props {
  notification: INotification;
  lang: SupportedLocale;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

type UserRef =
  | string
  | { _id: string; name?: string; email?: string }
  | null
  | undefined;

const isUserObj = (
  u: UserRef
): u is { _id: string; name?: string; email?: string } =>
  typeof u === "object" && u !== null && "_id" in u;

const getUserEmail = (u: UserRef) => (isUserObj(u) ? u.email || "-" : "-");

const pickLocalized = (
  obj: Partial<Record<SupportedLocale, string>> | undefined,
  lang: SupportedLocale
): string => {
  if (!obj) return "-";
  return (
    obj[lang] ??
    obj.en ??
    (Object.values(obj).find(
      (v): v is string => typeof v === "string" && v.length > 0
    ) ?? "-")
  );
};

export default function NotificationRow({
  notification,
  lang,
  onMarkRead,
  onDelete,
}: Props) {
  const { t } = useI18nNamespace("notification", translations);

  // scope: user (name/_id/string) → roles → allTenant → fallback
  const scope =
    isUserObj(notification.user)
      ? notification.user.name || notification.user._id
      : typeof notification.user === "string"
      ? notification.user
      : notification.target?.roles?.length
      ? `roles: ${notification.target.roles.join(", ")}`
      : notification.target?.allTenant
      ? "allTenant"
      : "-";

  return (
    <tr>
      <td>{t(`type_${notification.type}`, notification.type)}</td>
      <td>{scope}</td>
      <td>{getUserEmail(notification.user)}</td>
      <td>{pickLocalized(notification.title, lang)}</td>
      <td>{pickLocalized(notification.message, lang)}</td>
      <td>{new Date(notification.createdAt as any).toLocaleString(lang)}</td>
      <td>
        <Status $read={notification.isRead}>
          {notification.isRead ? t("read", "Okundu") : t("unread", "Okunmadı")}
        </Status>
      </td>
      <td>
        <NotificationActions
          isRead={notification.isRead}
          onMarkRead={() => onMarkRead(String(notification._id))}
          onDelete={() => onDelete(String(notification._id))}
        />
      </td>
    </tr>
  );
}

const Status = styled.span<{ $read?: boolean }>`
  display: inline-block;
  padding: 0.3em 1em;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  background: ${({ $read, theme }) =>
    $read ? theme.colors.successBg : theme.colors.warningBackground};
  color: ${({ $read, theme }) =>
    $read ? theme.colors.success : theme.colors.warning};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.borderHighlight};
  min-width: 70px;
  text-align: center;
`;
