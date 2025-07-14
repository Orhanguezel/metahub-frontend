"use client";

import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { ChatMessage } from "@/modules/chat/types";
import { SupportedLocale } from "@/types/common";

interface Props {
  chatMessages: ChatMessage[];
  loading?: boolean;
  error?: string | null;
  searchTerm?: string;
  lang?: SupportedLocale;
  emptyText?: string;
  loadingText?: string;
  errorText?: string;
}

const MessageList: React.FC<Props> = ({
  chatMessages,
  loading,
  error,
  searchTerm = "",
  lang = "tr",
  emptyText = "Henüz mesaj yok.",
  loadingText = "Yükleniyor...",
  errorText = "Bir hata oluştu.",
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Otomatik scroll to bottom
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Çoklu dil desteği: Mesaj metnini uygun dilden çek
  const getMessageText = (msg: ChatMessage) => {
    if (msg.language && typeof msg.language === "object" && lang in msg.language) {
      return msg.language[lang] || msg.message;
    }
    return msg.message;
  };

  // Kelimeyi vurgula
  const highlightTerm = (text: string, term: string) => {
    if (!term.trim()) return text;
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safeTerm})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <Highlight key={i}>{part}</Highlight> : <React.Fragment key={i}>{part}</React.Fragment>
    );
  };

  // Sender (kim yazdı)
  const renderSender = (msg: ChatMessage) => {
    if (msg.isFromBot) return <>🤖 Bot:</>;
    if (msg.isFromAdmin) return <>🛡️ Admin:</>;
    if (msg.sender?.name) return <>{msg.sender.name}:</>;
    return <>Ziyaretçi:</>;
  };

  if (loading) return <LoadingText>{loadingText}</LoadingText>;
  if (error) return <ErrorText>{errorText} {error}</ErrorText>;

  return (
    <List ref={listRef}>
      {chatMessages.length === 0 ? (
        <EmptyText>{emptyText}</EmptyText>
      ) : (
        chatMessages.map((message) => (
          <Item key={message._id || message.createdAt}>
            <Sender>{renderSender(message)}</Sender>{" "}
            {highlightTerm(getMessageText(message), searchTerm)}
            <MsgTime>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</MsgTime>
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
  display: flex;
  align-items: flex-end;
  gap: 0.45rem;
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

const MsgTime = styled.span`
  color: #aaa;
  font-size: 0.79rem;
  margin-left: 0.35em;
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
