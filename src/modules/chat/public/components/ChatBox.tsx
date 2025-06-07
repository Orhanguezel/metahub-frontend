"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import socket from "@/lib/socket";
import { useTranslation } from "../../../../../node_modules/react-i18next";
import {
  ChatMessage,
  PublicMessageList,
  PublicChatInput,
} from "@/modules/chat";

const ChatBox = () => {
  const { i18n, t } = useTranslation("chat"); // "chat" namespace örnek, isteğe göre değiştir
  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "de"
  ) as "tr" | "en" | "de";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<string>("");

  // ✅ Socket bağlantısı ve oda atama
  useEffect(() => {
    socket.connect();

    const handleRoomAssigned = async (roomId: string) => {
      setRoom(roomId);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/${roomId}`,
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

    return () => {
      socket.off("room-assigned", handleRoomAssigned);
      socket.off("chat-message", handleIncomingMessage);
      socket.off("bot-message", handleIncomingMessage);
      socket.off("admin-message", handleIncomingMessage);
    };
  }, []);

  // ✅ Mesaj gönderimi
  const handleSend = (message: string) => {
    if (!message.trim() || !room) return;

    socket.emit("chat-message", {
      room,
      message,
      lang,
    });

    // Frontend'de optimistic gösterim
    setMessages((prev) => [
      ...prev,
      {
        _id: `temp-${Date.now()}`,
        sender: null,
        message,
        room,
        createdAt: new Date().toISOString(),
        lang,
        isFromAdmin: false,
      },
    ]);
  };

  return (
    <Wrapper>
      <Header>
        <h4>🤖 {t("assistantTitle", "Ensotek Asistan")}</h4>
        {/* Artık LanguageSelector yok. */}
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
