"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  adminGetArchivedSessions,
  selectAdmin,
  setCurrentRoom,
} from "@/modules/chat/slice/chatSlice";
import type { ArchivedSession } from "@/modules/chat/types";
import {
  Wrap,
  Header,
  Empty,
  Table,
  TableWrap,
  Primary,
  Secondary,
} from "./ListStyles";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";

type Props = {
  lang?: string;
  onOpenRoom?: (roomId: string) => void;
};

export default function ArchivedSessions({ onOpenRoom }: Props) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useI18nNamespace("chat", translations);
  const lang = i18n?.language;

  const admin = useAppSelector(selectAdmin);
  const archived = admin.archivedSessions;

  useEffect(() => {
    dispatch(adminGetArchivedSessions());
  }, [dispatch]);

  const open = (row: ArchivedSession) => {
    onOpenRoom?.(row.room);
    dispatch(setCurrentRoom(row.room));
  };

  const T = {
    title: t("admin.archived", "Arşiv"),
    colRoom: t("admin.col_room", "Oda"),
    colUser: t("admin.col_user", "Kullanıcı"),
    colLast: t("admin.col_last_message", "Son Mesaj"),
    colClosed: t("admin.col_closed", "Kapanış"),
    open: t("admin.open", "Aç"),
    copy: t("admin.copy_id", "ID Kopyala"),
    none: t("admin.no_archived", "Arşivlenmiş oturum yok."),
  };

  return (
    <Wrap>
      <Header>
        <h4 style={{ margin: 0 }}>{T.title}</h4>
        <SmallMuted aria-live="polite">{archived.length}</SmallMuted>
      </Header>

      {/* ===== Masaüstü + Tablet: Tablo ===== */}
      <DesktopTableWrap role="region" aria-label={T.title}>
        <DesktopTable>
          <thead>
            <tr>
              <th>{T.colRoom}</th>
              <th>{T.colUser}</th>
              <th>{T.colLast}</th>
              <th>{T.colClosed}</th>
              <th className="right" />
            </tr>
          </thead>
          <tbody>
            {archived.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <Empty>{T.none}</Empty>
                </td>
              </tr>
            )}

            {archived.map((a, idx) => (
              <tr key={`${a.room}-${idx}`}>
                <td className="mono ellipsis" title={a.room}>{a.room}</td>
                <td className="ellipsis">
                  {a.user ? `${a.user.name || ""} <${a.user.email || ""}>` : "—"}
                </td>
                <td className="wrap" title={a.lastMessage}>
                  {a.lastMessage}
                </td>
                <td className="nowrap">{formatDT(a.closedAt, lang)}</td>
                <td className="right nowrap">
                  <Primary onClick={() => open(a)} aria-label={T.open}>
                    {T.open}
                  </Primary>{" "}
                  <Secondary
                    onClick={() => navigator.clipboard?.writeText(a.room)}
                    aria-label={T.copy}
                  >
                    {T.copy}
                  </Secondary>
                </td>
              </tr>
            ))}
          </tbody>
        </DesktopTable>
      </DesktopTableWrap>

      {/* ===== Mobil: Kart Listesi ===== */}
      <CardList role="list" aria-label={T.title}>
        {archived.length === 0 && <Empty>{T.none}</Empty>}

        {archived.map((a, idx) => (
          <Card key={`${a.room}-${idx}`} role="listitem">
            <CardTop>
              <Room mono title={a.room}>{a.room}</Room>
              <Actions>
                <Primary onClick={() => open(a)} aria-label={T.open}>
                  {T.open}
                </Primary>
                <Secondary
                  onClick={() => navigator.clipboard?.writeText(a.room)}
                  aria-label={T.copy}
                >
                  {T.copy}
                </Secondary>
              </Actions>
            </CardTop>

            <Row>
              <Label>{T.colUser}</Label>
              <Value className="ellipsis">
                {a.user ? `${a.user.name || ""} <${a.user.email || ""}>` : "—"}
              </Value>
            </Row>

            <Row>
              <Label>{T.colLast}</Label>
              <Value className="wrap">{a.lastMessage}</Value>
            </Row>

            <Row>
              <Label>{T.colClosed}</Label>
              <Value className="nowrap">{formatDT(a.closedAt, lang)}</Value>
            </Row>
          </Card>
        ))}
      </CardList>
    </Wrap>
  );
}

function formatDT(iso: string, lang?: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(lang || undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

/* ============== styled ============== */

const SmallMuted = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

/* Masaüstü/Tablet tablo kapsayıcı */
const DesktopTableWrap = styled(TableWrap)`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: none;
  background: transparent;
  border: none;
  padding: 0;

  ${({ theme }) => theme.media.mobile} {
    display: none; /* mobilde tabloyu gizle */
  }
`;

const DesktopTable = styled(Table)`
  table-layout: fixed;
  width: 100%;

  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  /* sütun stilleri */
  th, td { vertical-align: top; }
  .right { text-align: right; }
  .nowrap { white-space: nowrap; }
  .ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .wrap { white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; }

  /* genişlikler: masaüstü */
  thead th:nth-child(1), tbody td:nth-child(1) { width: 220px; } /* room */
  thead th:nth-child(4), tbody td:nth-child(4) { width: 170px; } /* closed */
  thead th:nth-child(5), tbody td:nth-child(5) { width: 160px; } /* actions */

  /* tablet sıkılaştırma */
  ${({ theme }) => theme.media.tablet} {
    thead th, tbody td {
      font-size: ${({ theme }) => theme.fontSizes.xsmall};
      padding: ${({ theme }) => theme.spacings.sm};
    }
    thead th:nth-child(1), tbody td:nth-child(1) { width: 180px; }
    thead th:nth-child(4), tbody td:nth-child(4) { width: 150px; }
    thead th:nth-child(5), tbody td:nth-child(5) { width: 140px; }
  }
`;

/* Mobil kart görünümü */
const CardList = styled.div`
  display: none;
  ${({ theme }) => theme.media.mobile} {
    display: grid;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.sectionBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.md};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const Room = styled.span<{ mono?: boolean }>`
  font-family: ${({ mono, theme }) => (mono ? theme.fonts.mono : theme.fonts.main)};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  max-width: 60%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  & > * { white-space: nowrap; }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: clamp(90px, 32%, 140px) 1fr;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: 6px 0;

  &:not(:last-child) {
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  }
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const Value = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  &.nowrap { white-space: nowrap; }
  &.ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &.wrap { white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; }
`;
