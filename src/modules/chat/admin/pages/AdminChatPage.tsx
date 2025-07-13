"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";

import {
  addMessage,
  addEscalatedRoom,
  selectSelectedRoom,
} from "@/modules/chat/slice/chatSlice";
import { ChatMessage } from "@/modules/chat/types";
import {
  MessageList,
  ChatInput,
  EscalatedSessions,
  ChatSessionList,
  ArchivedSessions,
  SearchBox,
} from "@/modules/chat";
import socket from "@/lib/socket";

const isDev = process.env.NODE_ENV === "development";

export default function AdminChatPage() {
  const dispatch = useAppDispatch();
  // Tüm chat state’lerini merkezi hook ile alıyoruz!
  const { chat } = useAdminModuleState();

  // selector ile değil, merkezi state ile!
  const selectedRoom = chat.selectedRoom;
  const chatMessages = chat.chatMessages;
  const loading = chat.loading;
  const error = chat.error;

  const [searchTerm, setSearchTerm] = useState("");

  // 🔌 Socket bağlantısı ve eventler (Oda yönetimi merkezi hook’ta olmalı!)
  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      if (isDev) console.log("✅ Socket bağlı:", socket.id);
    });
    // Merkezi state’e message push
    const handleChatMessage = (chatMessage: ChatMessage) => {
      dispatch(addMessage(chatMessage));
    };
    const handleEscalation = (data: any) => dispatch(addEscalatedRoom(data));
    socket.on("chat-message", handleChatMessage);
    socket.on("escalate-to-admin", handleEscalation);

    return () => {
      socket.off("chat-message", handleChatMessage);
      socket.off("escalate-to-admin", handleEscalation);
      socket.off("connect");
      socket.disconnect();
    };
  }, [dispatch]);

  // Oda değişimi — fetchMessagesByRoom çağrısı merkezi hook’ta olacak, burada değil!
  // Eğer halen merkezi hook’ta fetch yapılmıyorsa, orada ekle (selectedRoom değişince fetch)

  // ✉️ Mesaj gönder
  const handleSend = (message: string) => {
    if (!message.trim() || !selectedRoom) return;
    socket.emit("admin-message", { room: selectedRoom, message });
  };

  // 🔍 Mesaj filtreleme
  const filteredChatMessages = (chatMessages || []).filter(
    (chatMessage: unknown): chatMessage is ChatMessage =>
      !!chatMessage &&
      typeof (chatMessage as ChatMessage).message === "string" &&
      (chatMessage as ChatMessage).message
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <h2>💬 Admin Chat Paneli</h2>
      <EscalatedSessions />
      <Layout>
        <Sidebar>
          <SearchBox onSearch={setSearchTerm} />
          <ChatSessionList socket={socket} />
          <ArchivedSessions />
        </Sidebar>
        <Main>
          <MessageList
            chatMessages={filteredChatMessages}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
          />
          <ChatInput onSend={handleSend} />
        </Main>
      </Layout>
    </Container>
  );
}

// 💅 Styles
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
