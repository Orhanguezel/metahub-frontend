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
  ChatSessionList,
  ArchivedSessions,
  SearchBox,
} from "@/modules/chat";
import { getSocket } from "@/lib/socket";

const isDev = process.env.NODE_ENV === "development";

export default function AdminChatPage() {
  const { i18n, t } = useI18nNamespace("chat", translations);
  const lang = (i18n.language?.slice(0, 2) as SupportedLocale) || "en";
  const dispatch = useAppDispatch();

  const roomId = useAppSelector(selectChatRoomId);
  const chatMessagesAdmin = useAppSelector(selectChatMessagesAdmin);
  const manualMessageState = useAppSelector(selectManualMessageState);
  const loading = manualMessageState.loading;
  const error = manualMessageState.error;

  const [searchTerm, setSearchTerm] = useState("");

  // Socket referansını bir defa oluştur
  const socket = getSocket();

  // --- SOCKET HANDLING ---
  useEffect(() => {
    if (!socket) return;

    socket.connect();
    if (isDev) {
      socket.on("connect", () =>
        console.log("✅ Socket bağlı:", socket.id)
      );
    }

    const handleChatMessage = (chatMessage: ChatMessage) => {
      dispatch(addMessageAdmin(chatMessage));
    };

    socket.on("admin-message", handleChatMessage);

    return () => {
      socket.off("admin-message", handleChatMessage);
      socket.off("connect");
      socket.disconnect();
    };
  }, [dispatch, socket]);

  const handleSend = (message: string) => {
    if (!message.trim() || !roomId || !socket) return;
    socket.emit("admin-message", { roomId, message, lang });
  };

  const filteredChatMessages = chatMessagesAdmin.filter(
    (msg: ChatMessage) =>
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <h2>{t("admin.title", "💬 Admin Chat Paneli")}</h2>
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

const Container = styled.div`
  padding: ${({ theme }) => theme.spacings.xxl} 0 ${({ theme }) => theme.spacings.xxl} 0;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};

  ${({ theme }) => theme.media.medium} {
    padding: ${({ theme }) => theme.spacings.lg} 0 ${({ theme }) => theme.spacings.lg} 0;
  }
  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.md} 0 ${({ theme }) => theme.spacings.md} 0;
  }
`;

const Layout = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xl};
  min-height: 75vh;

  ${({ theme }) => theme.media.medium} {
    gap: ${({ theme }) => theme.spacings.lg};
  }
  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacings.md};
    min-height: 0;
  }
`;

const Sidebar = styled.aside`
  width: 320px;
  min-width: 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacings.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.medium} {
    width: 260px;
    padding: ${({ theme }) => theme.spacings.md};
    border-radius: ${({ theme }) => theme.radii.md};
    gap: ${({ theme }) => theme.spacings.md};
  }
  ${({ theme }) => theme.media.small} {
    width: 100%;
    padding: ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
    gap: ${({ theme }) => theme.spacings.sm};
    box-shadow: none;
    background: transparent;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  min-width: 0;
  min-height: 540px;

  ${({ theme }) => theme.media.medium} {
    border-radius: ${({ theme }) => theme.radii.md};
    min-height: 380px;
  }
  ${({ theme }) => theme.media.small} {
    min-height: 0;
    border-radius: ${({ theme }) => theme.radii.sm};
    box-shadow: none;
    background: ${({ theme }) => theme.colors.backgroundAlt};
    margin-top: ${({ theme }) => theme.spacings.sm};
    padding-bottom: ${({ theme }) => theme.spacings.md};
  }
`;


