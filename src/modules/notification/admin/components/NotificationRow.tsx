import React from "react";
import styled from "styled-components";
import type { INotification } from "@/modules/notification/types";
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

export default function NotificationRow({
  notification,
  lang,
  onMarkRead,
  onDelete,
}: Props) {
  const { t } = useI18nNamespace("notification", translations);

  return (
    <tr>
      <td>{notification.type}</td>
      <td>{notification.user?.name || "-"}</td>
      <td>{notification.user?.email || "-"}</td>
      <td>{notification.title?.[lang] || "-"}</td>
      <td>{notification.message?.[lang] || "-"}</td>
      <td>{new Date(notification.createdAt).toLocaleString(lang)}</td>
      <td>
        <Status $read={notification.isRead}>
          {notification.isRead ? t("read", "Okundu") : t("unread", "Okunmadı")}
        </Status>
      </td>
      <td>
        <NotificationActions
          isRead={notification.isRead}
          onMarkRead={() => onMarkRead(notification._id)}
          onDelete={() => onDelete(notification._id)}
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
