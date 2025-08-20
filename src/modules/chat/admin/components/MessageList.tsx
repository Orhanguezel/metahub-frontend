"use client";

import React from "react";
import styled from "styled-components";
import type { ChatMessage } from "@/modules/chat/types";
import {
  Empty as BaseEmpty,
  ErrorBox,
  Table as BaseTable,
  TableWrap as BaseTableWrap,
  Wrap,
  Header,
} from "./ListStyles";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";

type Props = {
  chatMessages: ChatMessage[];
  loading?: boolean;
  error?: string;
  searchTerm?: string;
  lang?: string;
  emptyText?: string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onDeleteOne: (id: string) => void;
};

export default function MessageList({
  chatMessages = [],
  loading,
  error,
  emptyText,
  lang,
  selectedIds,
  onToggleSelect,
  onDeleteOne,
}: Props) {
  const { t } = useI18nNamespace("chat", translations);

  const T = {
    title: t("admin.messages_title", "Mesajlar"),
    loading: t("common.loading", "Yükleniyor…"),
    thSelect: t("admin.select", "Seç"),
    thTime: t("admin.time", "Zaman"),
    thSender: t("admin.sender", "Gönderen"),
    thMessage: t("admin.message", "Mesaj"),
    thFlags: t("admin.flags", "Bayraklar"),
    thActions: t("admin.actions", "İşlemler"),
    delete: t("admin.delete", "Sil"),
    flagAdmin: t("admin.flag_admin", "Admin"),
    flagBot: t("admin.flag_bot", "Bot"),
    flagRead: t("admin.flag_read", "Okundu"),
    empty: t("admin.no_messages", "Mesaj yok."),
  };

  const emptyFinal = emptyText ?? T.empty;

  return (
    <Wrap>
      <Header>
        <h4 style={{ margin: 0 }}>{T.title}</h4>
        {loading ? <SmallMuted>{T.loading}</SmallMuted> : null}
      </Header>

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {/* ===== YALNIZCA ≥1441px: TABLO ===== */}
      <DesktopTableWrap role="region" aria-label={T.title}>
        <DesktopTable role="table">
          <thead>
            <tr role="row">
              <th role="columnheader" aria-label={T.thSelect} title={T.thSelect}>
                <span aria-hidden>✓</span>
                <SrOnly>{T.thSelect}</SrOnly>
              </th>
              <th role="columnheader">{T.thTime}</th>
              <th role="columnheader">{T.thSender}</th>
              <th role="columnheader">{T.thMessage}</th>
              <th role="columnheader">{T.thFlags}</th>
              <th role="columnheader" className="right">{T.thActions}</th>
            </tr>
          </thead>
          <tbody>
            {chatMessages.length === 0 && (
              <tr role="row">
                <td colSpan={6}><Empty>{emptyFinal}</Empty></td>
              </tr>
            )}

            {chatMessages.map((m) => {
              const id = m._id || "";
              const dt = formatDT(m.createdAt, lang);
              const sender = m.sender
                ? `${m.sender.name || ""}${m.sender.email ? ` <${m.sender.email}>` : ""}`
                : "—";

              return (
                <tr key={id || `${m.createdAt}-${Math.random()}`} role="row">
                  <td className="center">
                    <input
                      type="checkbox"
                      aria-label={T.thSelect}
                      disabled={!id}
                      checked={id ? selectedIds.has(id) : false}
                      onChange={() => id && onToggleSelect(id)}
                    />
                  </td>
                  <td className="mono">{dt}</td>
                  <td className="ellipsis">{sender}</td>
                  <td className="wrap">{m.message}</td>
                  <td className="ellipsis">
                    <Flag $on={!!m.isFromAdmin}>{T.flagAdmin}</Flag>{" "}
                    <Flag $on={!!m.isFromBot}>{T.flagBot}</Flag>{" "}
                    <Flag $on={!!m.isRead}>{T.flagRead}</Flag>
                  </td>
                  <td className="right">
                    <SmallDangerBtn
                      type="button"
                      onClick={() => id && onDeleteOne(id)}
                      disabled={!id}
                      title={T.delete}
                    >
                      {T.delete}
                    </SmallDangerBtn>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DesktopTable>
      </DesktopTableWrap>

      {/* ===== ≤1440px: KART LİSTESİ ===== */}
      <CardList role="list" aria-label={T.title}>
        {chatMessages.length === 0 && <Empty>{emptyFinal}</Empty>}

        {chatMessages.map((m) => {
          const id = m._id || "";
          const dt = formatDT(m.createdAt, lang);
          const sender = m.sender
            ? `${m.sender.name || ""}${m.sender.email ? ` <${m.sender.email}>` : ""}`
            : "—";

          return (
            <Card key={id || `${m.createdAt}-${Math.random()}`} role="listitem">
              <CardTop>
                <label>
                  <input
                    type="checkbox"
                    aria-label={T.thSelect}
                    disabled={!id}
                    checked={id ? selectedIds.has(id) : false}
                    onChange={() => id && onToggleSelect(id)}
                  />{" "}
                  <TopMeta className="mono">{dt}</TopMeta>
                </label>

                <SmallDangerBtn
                  type="button"
                  onClick={() => id && onDeleteOne(id)}
                  disabled={!id}
                  title={T.delete}
                >
                  {T.delete}
                </SmallDangerBtn>
              </CardTop>

              <Row>
                <Label>{T.thSender}</Label>
                <Value className="ellipsis">{sender}</Value>
              </Row>

              <Row>
                <Label>{T.thMessage}</Label>
                <Value className="wrap">{m.message}</Value>
              </Row>

              <Row>
                <Label>{T.thFlags}</Label>
                <Value className="ellipsis">
                  <Flag $on={!!m.isFromAdmin}>{T.flagAdmin}</Flag>{" "}
                  <Flag $on={!!m.isFromBot}>{T.flagBot}</Flag>{" "}
                  <Flag $on={!!m.isRead}>{T.flagRead}</Flag>
                </Value>
              </Row>
            </Card>
          );
        })}
      </CardList>
    </Wrap>
  );
}

function formatDT(iso: string, lang?: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(lang || undefined, {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }).format(d);
  } catch { return iso; }
}

/* ===== styled ===== */

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
`;

const SmallMuted = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const Flag = styled.span<{ $on: boolean }>`
  display: inline-block;
  padding: 0.2em 0.6em;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $on, theme }) => ($on ? theme.colors.successBg : theme.colors.inputBackgroundLight)};
  color: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.textSecondary)};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  line-height: 1.4;
`;

/* === TABLO: sadece ≥1441px === */
const DesktopTableWrap = styled(BaseTableWrap)`
  display: none;
  ${({ theme }) => theme.media.xlarge} {
    display: block;
    box-shadow: none;
    background: transparent;
    border-radius: 0;
    overflow: auto;
    padding: 0;
    border: none;
  }
`;

const DesktopTable = styled(BaseTable)`
  table-layout: fixed;
  width: 100%;

  th, td { vertical-align: top; }

  .mono { font-family: ${({ theme }) => theme.fonts.mono}; }
  .right { text-align: right; }
  .center { text-align: center; }
  .ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .wrap { white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; }

  thead th:nth-child(1),
  tbody td:nth-child(1) { width: 44px; }       /* checkbox */
  thead th:nth-child(2),
  tbody td:nth-child(2) { width: 176px; }      /* zaman */
  thead th:nth-child(3),
  tbody td:nth-child(3) { width: 240px; }      /* gönderen */
  thead th:nth-child(5),
  tbody td:nth-child(5) { width: 190px; }      /* bayraklar */
  thead th:nth-child(6),
  tbody td:nth-child(6) { width: 120px; }      /* işlemler */
`;

/* === KART: ≤1440px === */
const CardList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  ${({ theme }) => theme.media.xlarge} { display: none; }
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

const TopMeta = styled.span`
  margin-left: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
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
  &.ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &.wrap { white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; }
`;

const SmallDangerBtn = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.danger};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.danger};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  transition: ${({ theme }) => theme.transition.fast};
  &:disabled { opacity: .5; cursor: not-allowed; }
  &:hover { opacity: .9; box-shadow: ${({ theme }) => theme.colors.shadowHighlight}; }
`;

const Empty = styled(BaseEmpty)``;
