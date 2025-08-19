"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import type { SupportedLocale } from "@/types/common";
import type { ChatMessage } from "@/modules/chat/types";
import {
  setCurrentRoom,
  messageReceived,
  selectCurrentRoomId,
  selectMessagesByRoom,
  selectChatState,
  // ⬇️ REST göndermek ve odayı tazelemek için ekledik
  adminSendManualMessage,
  adminMarkMessagesRead,
  fetchRoomMessages,
} from "@/modules/chat/slice/chatSlice";

import MessageList from "@/modules/chat/admin/components/MessageList";
import ChatInput from "@/modules/chat/admin/components/ChatInput";
import ChatSessionList from "@/modules/chat/admin/components/ChatSessionList";
import ArchivedSessions from "@/modules/chat/admin/components/ArchivedSessions";
import SearchBox from "@/modules/chat/admin/components/SearchBox";
import EscalatedSessions from "@/modules/chat/admin/components/EscalatedSessions";

import { getSocket } from "@/lib/socket";

const isDev = process.env.NODE_ENV === "development";

export default function AdminChatPage() {
  const { i18n, t } = useI18nNamespace("chat", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";

  const dispatch = useAppDispatch();
  const roomId = useAppSelector(selectCurrentRoomId);
  const { loading, error } = useAppSelector(selectChatState);
  const [searchTerm, setSearchTerm] = useState("");

  const roomMessages = useAppSelector(
    useMemo(() => selectMessagesByRoom(roomId || ""), [roomId])
  );

  const socket = getSocket();

  // Socket lifecycle: iki event'i de dinle
  useEffect(() => {
    if (!socket) return;
    socket.connect();
    if (isDev) socket.on("connect", () => console.log("✅ Socket bağlı:", socket.id));

    const handleInbound = (chatMessage: ChatMessage) => {
      dispatch(messageReceived(chatMessage));
    };

    socket.on("chat-message", handleInbound);
    socket.on("admin-message", handleInbound); // ← admin publish gelirse de yakala

    return () => {
      socket.off("chat-message", handleInbound);
      socket.off("admin-message", handleInbound);
      socket.off("connect");
      socket.disconnect();
    };
  }, [dispatch, socket]);

  // Aktif oda için join/leave
  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("join-room", { roomId });
    return () => { socket.emit("leave-room", { roomId }); };
  }, [socket, roomId]);

  // ❌ socket.emit ile göndermeyi bırak
  // ✅ REST: adminSendManualMessage kullan
  const handleSend = async (text: string) => {
    const message = text.trim();
    if (!message || !roomId) return;
    try {
      await dispatch(adminSendManualMessage({ roomId, message })).unwrap();
      // Garanti akış: mesajları yenile + okundu yap
      dispatch(fetchRoomMessages({ roomId, page: 1, limit: 20, sort: "asc" }));
      dispatch(adminMarkMessagesRead({ roomId }));
    } catch (e) {
      if (isDev) console.error("Admin send failed:", e);
    }
  };

  const filteredChatMessages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return roomMessages;
    return roomMessages.filter((m) => m.message?.toLowerCase().includes(term));
  }, [roomMessages, searchTerm]);

  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "💬 Admin Chat Paneli")}</h1>
          <Subtitle>{t("admin.subtitle", "Odaları, mesajları ve arşivleri yönetin")}</Subtitle>
        </TitleBlock>
        <Right>
          <Badge aria-label="selected-room">
            {roomId ? roomId : t("admin.noRoom", "Oda seçilmedi")}
          </Badge>
        </Right>
      </Header>

      {/* 🔥 TEK KART */}
      <BigCard>
        <TopBar>
          <SearchBox
            onSearch={setSearchTerm}
            placeholder={t("admin.search_placeholder", "Mesajlarda ara...")}
          />
        </TopBar>

        <Section>
          <EscalatedSessions />
        </Section>

        {/* Mesajlar */}
        <Section>
          <MessageList
            chatMessages={filteredChatMessages}
            loading={loading}
            error={error || undefined}
            searchTerm={searchTerm}
            lang={lang}
            emptyText={
              roomId
                ? t("admin.emptyRoom", "Bu odada henüz mesaj yok.")
                : t("admin.empty", "Önce bir oda seçin.")
            }
          />
        </Section>

        {/* Composer */}
        <ComposerRow>
          <ChatInput
            onSend={handleSend}
            sendLabel={t("admin.send", "Gönder")}
            placeholder={t("admin.input_placeholder", "Bir mesaj yazın...")}
            lang={lang}
            disabled={!roomId || !!loading}
          />
        </ComposerRow>

        <Divider />
        <Section>
          <ChatSessionList
            onSelectRoom={(rid: string) => dispatch(setCurrentRoom(rid))}
            selectedRoomId={roomId}
          />
        </Section>

        <Divider />
        <Section>
          <ArchivedSessions
            onOpenRoom={(rid: string) => dispatch(setCurrentRoom(rid))}
          />
        </Section>
      </BigCard>
    </PageWrap>
  );
}

/* styled */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
  ${({ theme }) => theme.media.mobile} { padding: ${({ theme }) => theme.spacings.md}; }
`;

const Header = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction:column; align-items:flex-start; gap:${({ theme }) => theme.spacings.sm};
  }
`;

const TitleBlock = styled.div`
  display:flex; flex-direction:column; gap:4px;
  h1{ margin:0; font-size:${({ theme }) => theme.fontSizes.h3}; }
`;
const Subtitle = styled.p`
  margin:0; color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;

const Right = styled.div`display:flex; align-items:center;`;
const Badge = styled.span`
  padding:6px 10px; border-radius:${({ theme }) => theme.radii.pill};
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  font-size:${({ theme }) => theme.fontSizes.sm};
`;

const BigCard = styled.section`
  background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  box-shadow:${({ theme }) => theme.cards.shadow};
  border-radius:${({ theme }) => theme.radii.lg};
  padding:${({ theme }) => theme.spacings.lg};
  display:flex;
  flex-direction:column;
  gap:${({ theme }) => theme.spacings.md};
`;

const TopBar = styled.div``;
const Section = styled.div``;

const ComposerRow = styled.div`
  padding-top:${({ theme }) => theme.spacings.sm};
`;

const Divider = styled.hr`
  border:0;
  height:1px;
  background:${({ theme }) => theme.colors.borderBright};
  margin:${({ theme }) => theme.spacings.md} 0;
`;
