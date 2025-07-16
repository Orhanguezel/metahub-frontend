"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getSocket } from "@/lib/socket";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import { SupportedLocale } from "@/types/common";
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
  const { i18n } = useI18nNamespace("chat", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

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

  return (
    <Wrapper>
      <Header>
        <h4>🤖 Ensotek Asistan</h4>
      </Header>
      <PublicMessageList messages={messages} />
      <PublicChatInput onSend={handleSend} />
    </Wrapper>
  );
};

export default ChatBox;

// Styled Components
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
