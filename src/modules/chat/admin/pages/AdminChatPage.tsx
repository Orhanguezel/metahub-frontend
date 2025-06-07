
 "use client";
 
 import React, { useEffect, useState } from "react";
 import styled from "styled-components";
 import { useAppDispatch, useAppSelector } from "@/store/hooks";
 import {
   fetchMessagesByRoom,
   selectChatMessages,
   selectChatLoading,
   selectChatError,
   addMessage,
   addEscalatedRoom,
   selectSelectedRoom,
 } from "@/modules/chat/slice/chatSlice";
 import { ChatMessage } from "@/modules/chat/types/chat";
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
   const selectedRoom = useAppSelector(selectSelectedRoom);
   const chatMessages = useAppSelector(selectChatMessages);
   const loading = useAppSelector(selectChatLoading);
   const error = useAppSelector(selectChatError);
   const [searchTerm, setSearchTerm] = useState("");
 
   // 🔌 Socket bağlantısı
   useEffect(() => {
     socket.connect();
     return () => {
       socket.disconnect();
     };
   }, []);
 
   // 🔄 Oda değişince mesajları getir ve odaya katıl
   useEffect(() => {
     if (!selectedRoom) return;
     dispatch(fetchMessagesByRoom(selectedRoom));
     socket.emit("join-room", selectedRoom);
   }, [dispatch, selectedRoom]);
 
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
