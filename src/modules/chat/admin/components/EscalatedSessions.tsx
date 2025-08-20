"use client";

import React from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { selectEscalatedRooms } from "@/modules/chat/slice/chatSlice";
import type { SupportedLocale } from "@/types/common";
import type { EscalatedRoom } from "@/modules/chat/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";

interface Props {
  lang?: SupportedLocale;
  /** başlık ve boş metni override etmek isterseniz geçin */
  title?: string;
  emptyText?: string;
}

const EscalatedSessions: React.FC<Props> = ({ lang, title, emptyText }) => {
  const rooms = useAppSelector(selectEscalatedRooms) as EscalatedRoom[];
  const { t, i18n } = useI18nNamespace("chat", translations);

  // i18n metinleri
  const T = {
    title: title ?? t("admin.escalated.title", "⚠️ Canlı Destek Bekleyenler"),
    empty: emptyText ?? t("admin.escalated.empty", "Şu anda bekleyen bir destek talebi yok."),
    anonName: t("admin.escalated.anon_name", "—"),
    anonEmail: t("admin.escalated.anon_email", "—"),
  };

  return (
    <Wrapper role="region" aria-label={T.title} lang={lang || i18n.language}>
      <Heading>{T.title}</Heading>

      {(!rooms || rooms.length === 0) ? (
        <Empty>{T.empty}</Empty>
      ) : (
        <List role="list">
          {rooms.map((r) => (
            <Item key={r.room} role="listitem">
              <strong>{r.user?.name ?? T.anonName}</strong>{" "}
              <Email>({r.user?.email ?? T.anonEmail})</Email>{" "}
              — <Message title={r.message}>{r.message}</Message>
            </Item>
          ))}
        </List>
      )}
    </Wrapper>
  );
};

export default EscalatedSessions;

/* 💅 Styles (classicTheme) */
const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.warningBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.warning};
  padding: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.sm};
  }
`;

const Heading = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacings.sm} 0;
  color: ${({ theme }) => theme.colors.title};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const Empty = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => theme.spacings.sm} 0;
  font-style: italic;
`;

const List = styled.ul`
  list-style: none;
  padding: 0; margin: 0;
  display: flex; flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const Item = styled.li`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const Email = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const Message = styled.span`
  font-style: italic;
  color: ${({ theme }) => theme.colors.textAlt};
  word-break: break-word;
  overflow-wrap: anywhere;
`;
