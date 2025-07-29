"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getSocket } from "@/lib/socket";
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

  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

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
      socket.disconnect();
    };
  }, [socket]);

  const handleSend = (message: string) => {
    if (!message.trim() || !roomId || !socket) return;

    const filledLanguage: Record<SupportedLocale, string> = {} as any;
    SUPPORTED_LOCALES.forEach((lng) => {
      filledLanguage[lng] = message;
    });

    socket.emit("chat-message", {
      room: roomId,
      message,
      language: filledLanguage,
    });

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
        <h4>🤖 {t("assistantTitle", "Sanal Asistan")}</h4>
      </Header>
      <MessageArea>
        <PublicMessageList messages={messages} />
      </MessageArea>
      <InputArea>
        <PublicChatInput onSend={handleSend} />
      </InputArea>
    </Wrapper>
  );
};

export default ChatBox;

// Styled Components - Ensotek Theme & Responsive

const Wrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  height: 75vh;
  min-height: 450px;
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.22s;
  @media (max-width: 700px) {
    max-width: 100%;
    border-radius: ${({ theme }) => theme.radii.md};
    height: 68vh;
    min-height: 350px;
  }
`;

const Header = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  padding: 1rem 1.6rem;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  letter-spacing: 0.01em;
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.primaryDark};
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 2;
  h4 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes.lg};
    color: ${({ theme }) => theme.colors.buttonText};
    font-family: ${({ theme }) => theme.fonts.heading};
  }
`;

const MessageArea = styled.div`
  flex: 1;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.background};
  padding: 1.3rem 1rem 0.7rem 1rem;
  @media (max-width: 700px) {
    padding: 1rem 0.3rem 0.5rem 0.3rem;
  }
`;

const InputArea = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 1rem 1.3rem 1.2rem 1.3rem;
  border-top: 1.5px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 700px) {
    padding: 0.7rem 0.5rem 0.7rem 0.5rem;
  }
`;

