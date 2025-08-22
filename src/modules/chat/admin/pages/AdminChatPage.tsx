// AdminChatPage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { createSelector } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import type { SupportedLocale } from "@/types/common";
import type { ChatMessage } from "@/modules/chat/types";
import {
  setCurrentRoom,
  messageReceived,
  selectCurrentRoomId,
  selectChatState,
  adminSendManualMessage,
  adminMarkMessagesRead,
  fetchRoomMessages,
  adminDeleteMessage,
  adminBulkDeleteMessages,
} from "@/modules/chat/slice/chatSlice";

import {
  MessageList,
  ChatInput,
  ChatSessionList,
  ArchivedSessions,
  SearchBox,
  EscalatedSessions,
} from "@/modules/chat";
import { getSocket } from "@/lib/socket";

const isDev = process.env.NODE_ENV === "development";

/* ------------ Memoize mesaj selector'u (oda bazlı) ------------ */
const EMPTY_ARR: any[] = [];

const makeSelectMessagesForRoom = () =>
  createSelector(
    [
      (s: any) => s.chat,                         // chat slice
      (_: any, rid: string) => rid || "__none__", // roomId
    ],
    (chat, rid) => {
      if (!chat) return EMPTY_ARR;

      // Normalized yapı
      const byRoom = chat.byRoom || chat.roomsById || chat.roomMap;
      if (byRoom && byRoom[rid]?.messages) return byRoom[rid].messages as any[];

      // Düz liste ise filtrele (boşsa sabit referans)
      const all = Array.isArray(chat.messages) ? chat.messages : [];
      if (!all.length) return EMPTY_ARR;

      const filtered = all.filter((m: any) => m?.roomId === rid);
      return filtered.length ? filtered : EMPTY_ARR;
    }
  );

export default function AdminChatPage() {
  const { i18n, t } = useI18nNamespace("chat", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";

  const dispatch = useAppDispatch();
  const roomId = useAppSelector(selectCurrentRoomId);
  const { loading, error } = useAppSelector(selectChatState);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ⚡️ Odaya göre mesajları stable referansla seç
  const selectMessagesForRoom = useMemo(makeSelectMessagesForRoom, []);
  const roomMessages = useAppSelector((s) => selectMessagesForRoom(s, roomId || "__none__"));

  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;
    socket.connect();
    if (isDev) socket.on("connect", () => console.log("✅ Socket:", socket.id));

    const onInbound = (m: ChatMessage) => dispatch(messageReceived(m));
    socket.on("chat-message", onInbound);
    socket.on("admin-message", onInbound);

    return () => {
      socket.off("chat-message", onInbound);
      socket.off("admin-message", onInbound);
      socket.off("connect");
      socket.disconnect();
    };
  }, [dispatch, socket]);

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("join-room", { roomId });
    return () => { socket.emit("leave-room", { roomId }); };
  }, [socket, roomId]);

  const handleSend = async (text: string) => {
    const message = text.trim();
    if (!message || !roomId) return;
    try {
      await dispatch(adminSendManualMessage({ roomId, message })).unwrap();
      dispatch(fetchRoomMessages({ roomId, page: 1, limit: 20, sort: "asc" }));
      dispatch(adminMarkMessagesRead({ roomId }));
    } catch (e) {
      if (isDev) console.error("Admin send failed:", e);
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return roomMessages;
    return roomMessages.filter((m: any) => m.message?.toLowerCase().includes(term));
  }, [roomMessages, searchTerm]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllVisible = () =>
    setSelectedIds(new Set((filtered || []).map((m: any) => m._id).filter(Boolean) as string[]));

  const clearSelection = () => setSelectedIds(new Set());

  const deleteSelected = async () => {
    if (!roomId || selectedIds.size === 0) return;
    if (!confirm(t("admin.confirm_bulk_delete", "Seçili mesajları sileceksiniz. Emin misiniz?"))) return;
    try {
      await dispatch(adminBulkDeleteMessages({ ids: Array.from(selectedIds) })).unwrap();
      await dispatch(fetchRoomMessages({ roomId, page: 1, limit: 20, sort: "asc" }));
      setSelectedIds(new Set());
    } catch (e) {
      if (isDev) console.error("Bulk delete failed:", e);
    }
  };

  const deleteSingle = async (id: string) => {
    if (!confirm(t("admin.confirm_delete", "Bu mesajı silmek istiyor musunuz?"))) return;
    try {
      await dispatch(adminDeleteMessage({ id })).unwrap();
      if (roomId) await dispatch(fetchRoomMessages({ roomId, page: 1, limit: 20, sort: "asc" }));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) {
      if (isDev) console.error("Delete failed:", e);
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <PageWrap>
      <TopHeader>
        <TitleBlock>
          <h1>{t("admin.title", "💬 Admin Chat Paneli")}</h1>
          <Subtitle>{t("admin.subtitle", "Odaları, mesajları ve arşivleri yönetin")}</Subtitle>
        </TitleBlock>
        <Right>
          <Badge aria-live="polite" aria-atomic="true">
            {roomId ? roomId : t("admin.noRoom", "Oda seçilmedi")}
          </Badge>
        </Right>
      </TopHeader>

      <BigCard>
        {/* TEK SATIR: taşarsa yatay kaydır */}
        <ToolbarRow role="region" aria-label={t("admin.toolbar", "Araç Çubuğu")}>
          <SearchWrap>
            <SearchBox
              onSearch={setSearchTerm}
              placeholder={t("admin.search_placeholder", "Mesajlarda ara...")}
            />
          </SearchWrap>
          <Spacer />
          <SmallBtn onClick={selectAllVisible} disabled={!filtered?.length}>
            {t("admin.select_all_visible", "Listedekileri Seç")}
          </SmallBtn>
          <SmallBtn onClick={clearSelection} disabled={selectedCount === 0}>
            {t("admin.clear_selection", "Seçimi Temizle")}
          </SmallBtn>
          <DangerBtn
            onClick={deleteSelected}
            disabled={selectedCount === 0}
            title={t("admin.delete_selected_title", "Seçili mesajları sil")}
          >
            {t("admin.delete_selected", "Seçili Sil")} ({selectedCount})
          </DangerBtn>
        </ToolbarRow>

        {/* Eskale edilenler */}
        <Section>
          <EscalatedSessions lang={lang} />
        </Section>

        {/* Mesajlar: 👇 Kart (≤1440), Tablo (≥1441) */}
        <Section>
          <MessageList
            chatMessages={filtered}
            loading={loading}
            error={error || undefined}
            searchTerm={searchTerm}
            lang={lang}
            emptyText={
              roomId
                ? t("admin.emptyRoom", "Bu odada henüz mesaj yok.")
                : t("admin.empty", "Önce bir oda seçin.")
            }
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onDeleteOne={deleteSingle}
          />
          <ComposerRow>
            <ChatInput
              onSend={handleSend}
              sendLabel={t("admin.send", "Gönder")}
              placeholder={t("admin.input_placeholder", "Bir mesaj yazın...")}
              lang={lang}
              disabled={!roomId || !!loading}
            />
          </ComposerRow>
        </Section>

        {/* Odalar & Arşiv — TEK SÜTUN */}
        <SingleColumn>
          <SectionCard aria-label={t("admin.rooms_panel", "Odalar Paneli")}>
            <SectionTitle>{t("admin.rooms", "Odalar")}</SectionTitle>
            <ChatSessionList
              lang={lang}
              selectedRoomId={roomId}
              onSelectRoom={(rid) => {
                setSelectedIds(new Set());
                dispatch(setCurrentRoom(rid));
              }}
            />
          </SectionCard>

          <SectionCard aria-label={t("admin.archived_panel", "Arşiv Paneli")}>
            <SectionTitle>{t("admin.archived", "Arşiv")}</SectionTitle>
            <ArchivedSessions lang={lang} onOpenRoom={(rid) => dispatch(setCurrentRoom(rid))} />
          </SectionCard>
        </SingleColumn>
      </BigCard>
    </PageWrap>
  );
}

/* ===== styled ===== */

const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
  background: ${({ theme }) => theme.colors.background};
  ${({ theme }) => theme.media.mobile} { padding: ${({ theme }) => theme.spacings.md}; }
`;

const TopHeader = styled.header`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  gap: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.mobile} { flex-direction: column; align-items: stretch; }
`;

const TitleBlock = styled.div`
  display: flex; flex-direction: column; gap: 4px;
  h1 { margin: 0; font-size: ${({ theme }) => theme.fontSizes.h3};
       line-height: ${({ theme }) => theme.lineHeights.relaxed}; color: ${({ theme }) => theme.colors.title}; }
`;

const Subtitle = styled.p`
  margin: 0; color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Right = styled.div` display: flex; align-items: center; `;

const Badge = styled.span`
  padding: 6px 10px; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

const BigCard = styled.section`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.lg};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.lg};
`;

const ToolbarRow = styled.div`
  position: sticky; top: 0; z-index: ${({ theme }) => theme.zIndex.dropdown};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  padding-bottom: ${({ theme }) => theme.spacings.sm};
  margin-top: -${({ theme }) => theme.spacings.sm};
  display: grid;
  grid-template-columns: minmax(220px, 420px) 1fr auto auto auto;
  align-items: center; gap: ${({ theme }) => theme.spacings.sm};
  overflow-x: auto; -webkit-overflow-scrolling: touch;
`;

const SearchWrap = styled.div` min-width: 220px; `;
const Spacer = styled.div``;

const SmallBtn = styled.button`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  padding: 8px 12px; border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  transition: ${({ theme }) => theme.transition.fast};
  white-space: nowrap;
  &:hover{ background: ${({ theme }) => theme.cards?.hoverBackground || theme.colors.hoverBackground}; }
  &:disabled{ opacity:.5; cursor:not-allowed; }
`;

const DangerBtn = styled(SmallBtn)`
  border-color: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.danger};
`;

const Section = styled.section`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.md};
`;

const SectionCard = styled.section`
  background: ${({ theme }) => theme.colors.sectionBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacings.md};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacings.sm} 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.title};
`;

const ComposerRow = styled.div`
  padding-top: ${({ theme }) => theme.spacings.sm};
  border-top: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
`;

const SingleColumn = styled.div`
  display: grid; grid-template-columns: 1fr; gap: ${({ theme }) => theme.spacings.md};
`;
