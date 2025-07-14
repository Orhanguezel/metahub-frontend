"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import { SupportedLocale } from "@/types/common";
import {
  addMessageAdmin,
  selectChatRoomId,
  selectChatMessagesAdmin,
  selectManualMessageState,
} from "@/modules/chat/slice/chatSlice";
import { ChatMessage } from "@/modules/chat/types";
import {
  MessageList,
  ChatInput,
  // EscalatedSessions,
  ChatSessionList,
  ArchivedSessions,
  SearchBox,
} from "@/modules/chat";
import socket from "@/lib/socket";

const isDev = process.env.NODE_ENV === "development";

export default function AdminChatPage() {
  // --- Dil & i18n ---
  const { i18n, t } = useI18nNamespace("chat", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";
  const dispatch = useAppDispatch();

  // --- SLICE STATE ---
  const roomId = useAppSelector(selectChatRoomId);
  const chatMessagesAdmin = useAppSelector(selectChatMessagesAdmin);
  const manualMessageState = useAppSelector(selectManualMessageState);
  const loading = manualMessageState.loading;
  const error = manualMessageState.error;

  const [searchTerm, setSearchTerm] = useState("");

  // --- SOCKET HANDLING ---
  useEffect(() => {
    socket.connect();
    if (isDev) socket.on("connect", () => console.log("✅ Socket bağlı:", socket.id));

    // Mesajları admin state'e ekle
    const handleChatMessage = (chatMessage: ChatMessage) => {
      dispatch(addMessageAdmin(chatMessage));
    };
    socket.on("admin-message", handleChatMessage);

    return () => {
      socket.off("admin-message", handleChatMessage);
      socket.off("connect");
      socket.disconnect();
    };
  }, [dispatch]);

  // --- MESAJ GÖNDERME ---
  const handleSend = (message: string) => {
    if (!message.trim() || !roomId) return;
    socket.emit("admin-message", { roomId, message, lang });
  };

  // --- FİLTRELEME (Arama kutusu dil desteği ile) ---
  const filteredChatMessages = chatMessagesAdmin.filter(
    (msg: ChatMessage) => msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <h2>{t("admin.title", "💬 Admin Chat Paneli")}</h2>
      {/* <EscalatedSessions /> */}
      <Layout>
        <Sidebar>
          <SearchBox
            onSearch={setSearchTerm}
            placeholder={t("admin.search_placeholder", "Mesajlarda ara...")}
          />
          <ChatSessionList socket={socket} lang={lang} />
          <ArchivedSessions lang={lang} />
        </Sidebar>
        <Main>
          <MessageList
            chatMessages={filteredChatMessages}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            lang={lang}
            emptyText={t("admin.empty", "Henüz mesaj yok.")}
          />
          <ChatInput
            onSend={handleSend}
            sendLabel={t("admin.send", "Gönder")}
            placeholder={t("admin.input_placeholder", "Bir mesaj yazın...")}
            lang={lang}
          />
        </Main>
      </Layout>
    </Container>
  );
}

// --- Styles ---
const Container = styled.div`
  padding: 2rem;
`;

const Layout = styled.div`
  display: flex;
  gap: 2rem;
`;

const Sidebar = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
