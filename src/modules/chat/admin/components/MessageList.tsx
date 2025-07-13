"use client";

import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { ChatMessage } from "@/modules/chat/types";

interface Props {
  chatMessages: Array<ChatMessage & { lang?: "tr" | "en" | "de" }>;
  loading: boolean;
  error: string | null;
  searchTerm?: string;
}

const MessageList: React.FC<Props> = ({
  chatMessages,
  loading,
  error,
  searchTerm = "",
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Her yeni mesajda scroll'u en alta çek
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Kelimeyi vurgulamak için fonksiyon
  const highlightTerm = (text: string, term: string) => {
    if (!term.trim()) return text;

    // Regex kaçış karakterlerinden kaçınmak için:
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safeTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <Highlight key={index}>{part}</Highlight>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    );
  };

  if (loading) return <LoadingText>Yükleniyor...</LoadingText>;
  if (error) return <ErrorText>{error}</ErrorText>;

  return (
    <List ref={listRef}>
      {chatMessages.length === 0 ? (
        <EmptyText>Henüz mesaj yok.</EmptyText>
      ) : (
        chatMessages.map((message) => (
          <Item key={message._id}>
            <Sender>
              {message.sender?.name
                ? message.sender.name
                : message.isFromBot
                ? "🤖 Bot"
                : "Sistem"}
              :
            </Sender>{" "}
            {highlightTerm(message.message, searchTerm)}
          </Item>
        ))
      )}
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
  line-height: 1.5;
  word-break: break-word;
`;

const Sender = styled.strong`
  color: #2563eb;
  font-weight: 700;
`;

const Highlight = styled.span`
  background-color: #ffe066;
  font-weight: bold;
  border-radius: 2px;
  padding: 0 2px;
`;

const LoadingText = styled.p`
  color: #888;
  text-align: center;
  padding: 2rem;
`;

const ErrorText = styled.p`
  color: #d32f2f;
  font-size: 0.98rem;
  text-align: center;
`;

const EmptyText = styled.p`
  color: #bbb;
  text-align: center;
  padding: 2rem;
  font-size: 1rem;
`;
