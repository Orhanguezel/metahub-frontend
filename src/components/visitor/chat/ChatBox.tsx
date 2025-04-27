"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import socket from "@/lib/socket";
import { ChatMessage } from "@/types/chat";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import LanguageSelector from "./LanguageSelector";

const ChatBox = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lang, setLang] = useState<"tr" | "en" | "de">("de");
  const [room, setRoom] = useState<string>("");

  // ✅ Socket bağlantısı ve room atama
  useEffect(() => {
    socket.connect();

    const handleRoomAssigned = async (roomId: string) => {
      setRoom(roomId);
      console.log("🆔 Room assigned from server:", roomId);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${roomId}`, {
          credentials: "include",
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
        }
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

    // Backend'e gönder
    socket.emit("chat-message", {
      room,
      message,
      lang,
    });

    // Frontend'de geçici gösterim (optimistic)
    setMessages((prev) => [
      ...prev,
      {
        _id: `temp-${Date.now()}`, // geçici ID
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
        <h4>🤖 Ensotek Asistan</h4>
        <LanguageSelector lang={lang} setLang={setLang} />
      </Header>

      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} />
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
