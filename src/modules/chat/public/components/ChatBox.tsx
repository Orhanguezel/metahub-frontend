"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import socket from "@/lib/socket";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import {
  ChatMessage,
  PublicMessageList,
  PublicChatInput,
} from "@/modules/chat";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";

const ChatBox = () => {
  const { t } = useI18nNamespace("chat", translations);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string>("");

  // ✅ Socket bağlantısı ve oda atama
  useEffect(() => {
    socket.connect();

    const handleRoomAssigned = async (assignedRoomId: string) => {
      setRoomId(assignedRoomId);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/${assignedRoomId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
      } catch (err) {
        console.error("❌ Geçmiş mesajlar alınamadı:", err);
      }
    };

    const handleIncomingMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m._id === msg._id);
        return alreadyExists ? prev : [...prev, msg];
      });
    };

    socket.on("room-assigned", handleRoomAssigned);
    socket.on("chat-message", handleIncomingMessage);
    socket.on("bot-message", handleIncomingMessage);
    socket.on("admin-message", handleIncomingMessage);

    return () => {
      socket.off("room-assigned", handleRoomAssigned);
      socket.off("chat-message", handleIncomingMessage);
      socket.off("bot-message", handleIncomingMessage);
      socket.off("admin-message", handleIncomingMessage);
    };
  }, []);

  // ✅ Mesaj gönderimi
  const handleSend = (message: string) => {
    if (!message.trim() || !roomId) return;

    // BlogCategoryForm'daki gibi, seçili dil veya ilk dolu dil üzerinden language objesi oluştur
    const filledLanguage: Record<SupportedLocale, string> = {} as any;
    SUPPORTED_LOCALES.forEach((lng) => {
      filledLanguage[lng] = message;
    });

    socket.emit("chat-message", {
      room:roomId,
      message,
      language: filledLanguage,
    });

    // Optimistic UI: hemen göster
    setMessages((prev) => [
      ...prev,
      {
        _id: `temp-${Date.now()}`,
        sender: null,
        message,
        roomId,
        tenant: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFromAdmin: false,
        isFromBot: false,
        isRead: false,
        language: filledLanguage,
      },
    ]);
  };

  return (
    <Wrapper>
      <Header>
        <h4>🤖 {t("assistantTitle", "Ensotek Asistan")}</h4>
      </Header>
      <PublicMessageList messages={messages} />
      <PublicChatInput onSend={handleSend} />
    </Wrapper>
  );
};

export default ChatBox;

// 💅 Styles
const Wrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #ccc;
  padding: 1rem;
  background-color: white;
  display: flex;
  flex-direction: column;
  height: 80vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
