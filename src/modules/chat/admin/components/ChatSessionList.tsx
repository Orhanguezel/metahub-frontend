"use client";

import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  adminGetActiveSessions,
  selectAdmin,
  setCurrentRoom,
  fetchRoomMessages,
  adminMarkMessagesRead,
} from "@/modules/chat/slice/chatSlice";
import type { ChatSession } from "@/modules/chat/types";
import type { SupportedLocale } from "@/types/common";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import {
  Badge as BaseBadge,
  Empty as BaseEmpty,
  Table as BaseTable,
  TableWrap as BaseTableWrap,
  Wrap as BaseWrap,
  Header as BaseHeader,
  Primary as BasePrimary,
  Secondary as BaseSecondary,
} from "./ListStyles";

type Props = {
  onSelectRoom?: (roomId: string) => void;
  selectedRoomId?: string;
  lang?: SupportedLocale;
};

export default function ChatSessionList({ onSelectRoom, selectedRoomId, lang: langProp }: Props) {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(selectAdmin);
  const sessions = admin.activeSessions;

  const { i18n, t } = useI18nNamespace("chat", translations);
  const lang = useMemo<SupportedLocale>(
    () => (langProp || (i18n?.language?.slice(0, 2) as SupportedLocale) || "tr"),
    [i18n?.language, langProp]
  );

  useEffect(() => {
    dispatch(adminGetActiveSessions());
  }, [dispatch]);

  const colRoom = t("admin.col_room", "Oda");
  const colUser = t("admin.col_user", "Kullanıcı");
  const colCreated = t("admin.col_created", "Oluşturulma");
  const colSelected = t("admin.col_selected", "Seçili");
  const colActions = t("admin.col_actions", "İşlemler");

  const txtActiveSessions = t("admin.active_sessions_title", "Aktif Oturumlar");
  const txtNoActive = t("admin.no_active_sessions", "Aktif oturum yok.");
  const txtOpen = t("admin.open", "Aç");
  const txtCopyId = t("admin.copy_id", "ID Kopyala");
  const txtYes = t("yes", "Evet");
  const txtNo = t("no", "Hayır");

  const open = (s: ChatSession) => {
    onSelectRoom?.(s.roomId);
    dispatch(setCurrentRoom(s.roomId));
    dispatch(fetchRoomMessages({ roomId: s.roomId, page: 1, limit: 20, sort: "asc" }));
    dispatch(adminMarkMessagesRead({ roomId: s.roomId }));
  };

  const copy = (text: string) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text);
    else {
      const el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el);
      el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
  };

  return (
    <Wrap aria-label={txtActiveSessions}>
      <Header>
        <h4 style={{ margin: 0 }}>{txtActiveSessions}</h4>
        <span>{sessions.length}</span>
      </Header>

      {/* ======== DESKTOP (≥1441px): TABLO ======== */}
      <DesktopTableWrap>
        <DesktopTable role="table">
          <thead>
            <tr role="row">
              <th style={{ width: 220 }} role="columnheader">{colRoom}</th>
              <th role="columnheader">{colUser}</th>
              <th style={{ width: 180 }} role="columnheader">{colCreated}</th>
              <th style={{ width: 120 }} role="columnheader">{colSelected}</th>
              <th style={{ width: 160 }} role="columnheader">{colActions}</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr role="row">
                <td colSpan={5}><Empty>{txtNoActive}</Empty></td>
              </tr>
            )}
            {sessions.map((s) => {
              const userStr =
                s.user ? (s.user.email ? `${s.user.name ?? "—"} <${s.user.email}>` : (s.user.name ?? "—")) : "—";
              return (
                <tr key={s._id} role="row">
                  <td className="mono clip" title={s.roomId}>{s.roomId}</td>
                  <td className="ellipsis" title={userStr}>{userStr}</td>
                  <td>{formatDT(s.createdAt, lang)}</td>
                  <td>
                    <Badge $on={selectedRoomId === s.roomId}>
                      {selectedRoomId === s.roomId ? txtYes : txtNo}
                    </Badge>
                  </td>
                  <td className="actions">
                    <Primary type="button" onClick={() => open(s)}>{txtOpen}</Primary>
                    <Secondary type="button" onClick={() => copy(s.roomId)} title={t("admin.copy_id_title", "Oda ID’yi kopyala")}>
                      {txtCopyId}
                    </Secondary>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DesktopTable>
      </DesktopTableWrap>

      {/* ======== MOBILE/TABLET/SMALL DESKTOP (≤1440px): KART ======== */}
      <CardList role="list" aria-label={txtActiveSessions}>
        {sessions.length === 0 && <Empty>{txtNoActive}</Empty>}

        {sessions.map((s) => {
          const userStr =
            s.user ? (s.user.email ? `${s.user.name ?? "—"} <${s.user.email}>` : (s.user.name ?? "—")) : "—";
          const selected = selectedRoomId === s.roomId;
          return (
            <Card role="listitem" key={s._id}>
              <CardRow>
                <Label>{colRoom}</Label>
                <Value className="mono scrollx" title={s.roomId}>{s.roomId}</Value>
              </CardRow>

              <CardRow>
                <Label>{colUser}</Label>
                <Value className="wrap" title={userStr}>{userStr}</Value>
              </CardRow>

              <CardRow>
                <Label>{colCreated}</Label>
                <Value>{formatDT(s.createdAt, lang)}</Value>
              </CardRow>

              <CardRow>
                <Label>{colSelected}</Label>
                <Value><Badge $on={selected}>{selected ? txtYes : txtNo}</Badge></Value>
              </CardRow>

              <Actions>
                <Primary type="button" onClick={() => open(s)}>{txtOpen}</Primary>
                <Secondary type="button" onClick={() => copy(s.roomId)} title={t("admin.copy_id_title", "Oda ID’yi kopyala")}>
                  {txtCopyId}
                </Secondary>
              </Actions>
            </Card>
          );
        })}
      </CardList>
    </Wrap>
  );
}

/* ================= styled ================= */

const Wrap = styled(BaseWrap)``;
const Header = styled(BaseHeader)``;

/* —— Desktop tablo: sadece xlarge (≥1441px) —— */
const DesktopTableWrap = styled(BaseTableWrap)`
  display: none;
  ${({ theme }) => theme.media.xlarge} {
    display: block;
  }
`;

const DesktopTable = styled(BaseTable)`
  .clip { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

/* —— Kart liste: ≤1440px —— */
const CardList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  ${({ theme }) => theme.media.xlarge} {
    display: none;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.sectionBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.md};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const CardRow = styled.div`
  display: grid;
  grid-template-columns: clamp(90px, 30%, 150px) 1fr;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: 6px 0;

  &:not(:last-of-type) {
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  }
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const Value = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  &.wrap { white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; }
  &.scrollx { display:block; max-width:100%; overflow-x:auto; white-space:nowrap; }
  &.mono { font-family: ${({ theme }) => theme.fonts.mono}; }
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacings.sm};
  & > * { flex: 1 1 auto; }
`;

const Badge = styled(BaseBadge)``;
const Empty = styled(BaseEmpty)``;
const Primary = styled(BasePrimary)``;
const Secondary = styled(BaseSecondary)``;

/* ====== Yardımcı ====== */
function formatDT(iso: string, locale?: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(locale || undefined, {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }).format(d);
  } catch { return iso; }
}
