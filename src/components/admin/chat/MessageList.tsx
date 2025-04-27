"use client";

import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { ChatMessage } from "@/types/chat";

interface Props {
  chatMessages: (ChatMessage & { lang?: "tr" | "en" | "de" })[];
  loading: boolean;
  error: string | null;
  searchTerm?: string;
}



const MessageList: React.FC<Props> = ({ chatMessages, loading, error, searchTerm = "" }) => {
  const listRef = useRef<HTMLDivElement>(null);

  // 📜 Yeni mesaj geldiğinde aşağı kay
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const highlightTerm = (text: string, term: string) => {
    if (!term) return text;

    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? <Highlight key={index}>{part}</Highlight> : part
    );
  };

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <ErrorText>{error}</ErrorText>;

  return (
    <List ref={listRef}>
      {chatMessages.map((message) => (
        <Item key={message._id}>
          <strong>{message.sender?.name || (message.isFromBot ? "🤖 Bot" : "Sistem")}:</strong>{" "}
          {highlightTerm(message.message, searchTerm)}
        </Item>
      ))}
    </List>
  );
};

export default MessageList;

// 💅 Styles
const List = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 1rem;
  background: #fafafa;
  margin-bottom: 1rem;
`;

const Item = styled.div`
  margin-bottom: 0.5rem;
  line-height: 1.4;
`;

const Highlight = styled.span`
  background-color: yellow;
  font-weight: bold;
`;

const ErrorText = styled.p`
  color: red;
  font-size: 0.95rem;
`;
