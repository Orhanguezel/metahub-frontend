"use client";
import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import {
  fetchNotifications,
  deleteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotificationMessages,
} from "@/modules/notification/slice/notificationSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/notification/locales";
import {
  NotificationTable
} from "@/modules/notification";
import type { SupportedLocale } from "@/types/common";

import { Loading, ErrorMessage, Empty } from "@/shared";

export default function AdminNotificationPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("notification", translations);
  const lang: SupportedLocale = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";
  const { notifications = [], loading, error, message } = useAppSelector((s) => s.notification);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);
  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
    if (message || error) dispatch(clearNotificationMessages());
  }, [message, error, dispatch]);

  return (
    <Wrapper>
      <h1>{t("title", "Bildirim Yönetimi")}</h1>
      <ButtonRow>
        <ActionButton onClick={() => dispatch(markAllNotificationsAsRead())}>
          {t("markAllRead", "Tümünü Okundu Yap")}
        </ActionButton>
      </ButtonRow>
      {loading && <Loading />}
      {error && <ErrorMessage  />}
      {!loading && notifications.length === 0 && <Empty t={t} />}
      {!loading && notifications.length > 0 && (
        <NotificationTable
          notifications={notifications}
          lang={lang}
          onMarkRead={(id) => dispatch(markNotificationAsRead(id))}
          onDelete={(id) => dispatch(deleteNotification(id))}
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacings.xl};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.background};
`;

const ButtonRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.lg};
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.buttonBackground};
  color: ${({ theme }) => theme.colors.buttonText};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.buttonBorder};
  padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  margin-right: ${({ theme }) => theme.spacings.xs};
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: #fff;
  }
`;
