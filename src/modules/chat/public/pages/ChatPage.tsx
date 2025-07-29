"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getSocket } from "@/lib/socket";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks"; // <- Tenant bilgisini almak için ekledik
import {
  ChatMessage,
  PublicChatInput,
  PublicMessageList,
} from "@/modules/chat";

type ChatBoxProps = {
  initialRoom?: string;
  initialMessages?: ChatMessage[];
  onRoomAssigned?: (roomId: string) => void;
  onNewMessage?: (msg: ChatMessage) => void;
};

const ChatBox: React.FC<ChatBoxProps> = ({
  initialRoom = "",
  initialMessages = [],
  onRoomAssigned,
  onNewMessage,
}) => {
  const { i18n, t } = useI18nNamespace("chat", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Redux veya context üzerinden tenantName ve/veya tenantId alınır
  const tenantName = useAppSelector((state) =>
    state.company?.company?.tenant ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    "MetaHub"
  );

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [room, setRoom] = useState<string>(initialRoom);

  const socket = getSocket();
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!socket) return;

    socket.connect();

    if (isDev) {
      socket.on("connect", () =>
        console.log("✅ Socket connected:", socket.id)
      );
    }

    const handleRoomAssigned = async (roomId: string) => {
      setRoom(roomId);
      onRoomAssigned?.(roomId);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/${roomId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
          data.forEach((msg: ChatMessage) => onNewMessage?.(msg));
        }
      } catch (err) {
        console.error("❌ Error loading chat history:", err);
      }
    };

    const handleIncomingMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        const tempIndex = prev.findIndex(
          (m) =>
            m._id?.startsWith("temp-") &&
            m.message === msg.message &&
            m.sender === msg.sender &&
            Math.abs(new Date(m.createdAt!).getTime() - new Date(msg.createdAt!).getTime()) < 3000
        );
        let next = prev;
        if (tempIndex !== -1) {
          next = [...prev];
          next.splice(tempIndex, 1);
        }
        if (next.some((m) => m._id === msg._id)) return next;
        onNewMessage?.(msg);
        return [...next, msg];
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
      socket.off("connect");
      socket.disconnect();
    };
  }, [socket, onRoomAssigned, onNewMessage, isDev]);

  // Room/messaging dışardan gelirse state güncelle
  useEffect(() => {
    if (initialRoom && initialRoom !== room) setRoom(initialRoom);
  }, [initialRoom, room]);

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) setMessages(initialMessages);
  }, [initialMessages]);

  const handleSend = (message: string) => {
    if (!message.trim() || !room || !socket) return;

    socket.emit("chat-message", { room, message, lang });

    const msgObj: ChatMessage = {
      _id: `temp-${Date.now()}`,
      sender: null,
      message,
      roomId: room,
      tenant: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFromAdmin: false,
      isFromBot: false,
      isRead: false,
      language: { [lang]: message },
    };

    setMessages((prev) => [...prev, msgObj]);
    onNewMessage?.(msgObj);
  };

  // --- BAŞLIKTA DİNAMİK TENANT + DİL ---
  return (
    <Wrapper>
      <Header>
        <h4>
          🤖 {t("assistantTitle", `${tenantName} Asistanı`)}
          <LangTag>{lang.toUpperCase()}</LangTag>
        </h4>
      </Header>
      <PublicMessageList messages={messages} />
      <PublicChatInput onSend={handleSend} />
    </Wrapper>
  );
};

export default ChatBox;

// --- THEMED + RESPONSIVE STYLES ---
const Wrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  height: 78vh;
  min-height: 420px;
  transition: box-shadow 0.16s;

  @media (max-width: 700px) {
    min-width: 0;
    max-width: 99vw;
    height: 68vh;
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  border-top-left-radius: ${({ theme }) => theme.radii.md};
  border-top-right-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.01em;

  @media (max-width: 700px) {
    padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.sm};
    font-size: ${({ theme }) => theme.fontSizes.base};
    border-radius: ${({ theme }) => theme.radii.sm} ${({ theme }) => theme.radii.sm} 0 0;
  }
`;

const LangTag = styled.span`
  margin-left: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85em;
  font-weight: 500;
  border-radius: 7px;
  padding: 2px 10px;
  letter-spacing: 0.04em;
  vertical-align: middle;
`;

