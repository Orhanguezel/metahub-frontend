"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";

import {
  addMessage,
  addEscalatedRoom,
  setRoom,
} from "@/modules/chat/slice/chatSlice";
import { ChatMessage } from "@/modules/chat/types";

// ✅ Bileşenler
import {
  MessageList,
  ManualMessageForm,
  EscalatedSessions,
  ChatSessionList,
  ArchivedSessions,
  SearchBox,
} from "@/modules/chat";

// ✅ Socket bağlantısı merkezi dosyadan
import socket from "@/lib/socket";

const isDev = process.env.NODE_ENV === "development";

const AdminChatPage = () => {
  const dispatch = useAppDispatch();
  // ---- SADECE BURADAN ----
  const { chat } = useAdminModuleState(); // merkezi tüm state

  const [searchTerm, setSearchTerm] = useState("");

  // 🔌 Socket bağlantısı başlat
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  // 🔄 Oda değişince sohbete katıl
  useEffect(() => {
    if (!chat.selectedRoom) return;
    socket.emit("join-room", chat.selectedRoom);
  }, [chat.selectedRoom]);

  // 📡 Socket event’leri
  useEffect(() => {
    const handleChatMessage = (chatMessage: ChatMessage) => {
      dispatch(addMessage(chatMessage));
    };

    const handleEscalation = (data: any) => dispatch(addEscalatedRoom(data));

    socket.on("connect", () => {
      if (isDev) console.log("✅ Socket bağlı:", socket.id);
    });
    socket.on("chat-message", handleChatMessage);
    socket.on("escalate-to-admin", handleEscalation);

    return () => {
      socket.off("chat-message", handleChatMessage);
      socket.off("escalate-to-admin", handleEscalation);
      socket.off("connect");
    };
  }, [dispatch]);

  // 🔍 Mesaj filtreleme
  const filteredChatMessages = (chat.chatMessages || []).filter(
    (chatMessage: ChatMessage) =>
      chatMessage.message.toLowerCase().includes(searchTerm.toLowerCase())
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
            loading={chat.loading}
            error={chat.error}
            searchTerm={searchTerm}
          />
          {/* 👇 Manuel Mesaj Gönderme Formu */}
          <ManualMessageForm />
        </Main>
      </Layout>
    </Container>
  );
};

export default AdminChatPage;

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
  justify-content: flex-start;
  gap: 1rem;
`;
