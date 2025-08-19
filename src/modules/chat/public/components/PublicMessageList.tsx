"use client";

import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import type { ChatMessage } from "@/modules/chat/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  getLocaleStringFromLang,
} from "@/types/common";

type Props = {
  messages: ChatMessage[];
  /** Geçmezsen i18n'den dinamik gelir */
  emptyText?: string;
  error?: string;
};

export default function PublicMessageList({
  messages = [],
  emptyText,
  error,
}: Props) {
  const { t, i18n } = useI18nNamespace("chat", translations);

  // UI dili → SupportedLocale'a zorunlu eşleme
  const uiLang = (() => {
    const two = (i18n?.language || "tr").slice(0, 2).toLowerCase() as SupportedLocale;
    return (SUPPORTED_LOCALES as readonly string[]).includes(two) ? two : ("tr" as SupportedLocale);
  })();

  const dateLocale = getLocaleStringFromLang(uiLang);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // i18n fallback'leri
  const effectiveEmpty =
    emptyText ?? t("support.empty", "Henüz mesaj yok.");
  const youLabel = t("support.me", "Ben");
  const botLabel = t("support.bot", "Bot");
  const agentFallback = t("support.agent", "Destek");

  const formatDT = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat(dateLocale, {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      }).format(d);
    } catch {
      return iso;
    }
  };

  return (
    <Wrap role="log" aria-live="polite" aria-label={t("support.message_log", "Mesaj günlüğü")}>
      {error && <ErrorBox role="alert">{error}</ErrorBox>}

      {messages.length === 0 ? (
        <Empty>{effectiveEmpty}</Empty>
      ) : (
        messages.map((m) => {
          const mine = !m.isFromAdmin && !m.isFromBot;
          const who = m.isFromBot ? botLabel : m.isFromAdmin ? (m.sender?.name || agentFallback) : youLabel;
          const dt = formatDT(m.createdAt);
          const initials = (m.sender?.name || agentFallback)
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <Row key={m._id} $mine={mine}>
              {!mine && <Avatar aria-hidden>{initials}</Avatar>}
              <Bubble $mine={mine}>
                <Meta>
                  <strong>{who}</strong> · <span>{dt}</span>
                </Meta>
                <Text>{m.message}</Text>
              </Bubble>
            </Row>
          );
        })
      )}

      <div ref={endRef} />
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`
  padding: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Row = styled.div<{ $mine: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: ${({ theme }) => theme.radii.circle};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const Bubble = styled.div<{ $mine: boolean }>`
  max-width: 74%;
  background: ${({ $mine, theme }) =>
    $mine ? theme.colors.primaryTransparent : theme.colors.inputBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  padding: ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme, $mine }) =>
    $mine
      ? `${theme.radii.lg} ${theme.radii.lg} ${theme.radii.md} ${theme.radii.lg}`
      : `${theme.radii.lg} ${theme.radii.lg} ${theme.radii.lg} ${theme.radii.md}`};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const Meta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const Text = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  white-space: pre-wrap;
`;

const Empty = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  padding: ${({ theme }) => theme.spacings.md};
`;

const ErrorBox = styled.div`
  padding: ${({ theme }) => theme.spacings.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.radii.md};
  margin: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
`;
