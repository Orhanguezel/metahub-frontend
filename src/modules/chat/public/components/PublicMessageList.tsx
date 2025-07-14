"use client";

import React, { useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import { ChatMessage } from "@/modules/chat";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import { SupportedLocale } from "@/types/common";

interface Props {
  messages: ChatMessage[];
  currentUserId?: string;
  lang?: SupportedLocale; // dışarıdan da dil override edilebilir
}

const PublicMessageList: React.FC<Props> = ({
  messages,
  currentUserId,
  lang: langProp,
}) => {
  // Eğer lang prop gelmezse, i18n üzerinden aktif dili çek
  const { i18n } = useI18nNamespace("chat", translations);
  const lang: SupportedLocale =
    langProp || (i18n.language?.slice(0, 2) as SupportedLocale) || "en";
  const scrollRef = useRef<HTMLDivElement>(null);

  // Otomatik scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  // Çoklu dilde mesaj metni: önce seçili dil, yoksa ilk dolu dili, yoksa message stringi göster
  function getMessageText(msg: ChatMessage): string {
    if (msg.language && typeof msg.language === "object") {
      if (msg.language[lang] && msg.language[lang]?.trim())
        return msg.language[lang]!;
      // Fallback: ilk dolu dili bul
      const first = Object.values(msg.language).find((t) => t && t.trim());
      if (first) return first;
    }
    return msg.message;
  }

  return (
    <Container ref={scrollRef}>
      {messages.map((msg) => {
        const isMe =
          (currentUserId && msg.sender && msg.sender._id === currentUserId) ||
          (!msg.sender && !msg.isFromBot && !msg.isFromAdmin); // Guest mesajı ise
        const isBot = msg.isFromBot;
        const isAdmin = msg.isFromAdmin && !isBot;

        return (
          <MessageItem
            key={msg._id || `${msg.createdAt}-${msg.message}`}
            $me={isMe}
            $bot={isBot}
            $admin={isAdmin}
          >
            <Meta>
              <Avatar $bot={isBot} $admin={isAdmin} $me={isMe}>
                {isBot
                  ? "🤖"
                  : isAdmin
                  ? "🛡️"
                  : msg.sender?.name?.[0]?.toUpperCase() || "🧑"}
              </Avatar>
              <Sender $bot={isBot} $admin={isAdmin} $me={isMe}>
                {isBot
                  ? "Bot"
                  : isAdmin
                  ? msg.sender?.name || "Admin"
                  : msg.sender?.name || "Siz"}
              </Sender>
              <Time>
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Time>
            </Meta>
            <Text>{getMessageText(msg)}</Text>
          </MessageItem>
        );
      })}
    </Container>
  );
};

export default PublicMessageList;

// Styles
const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f7f7f7;
  border: 1px solid #eaeaea;
  margin-bottom: 1rem;
`;

const MessageItem = styled.div<{
  $me?: boolean;
  $bot?: boolean;
  $admin?: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 96%;
  margin-bottom: 0.7rem;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border-left: 4px solid #ddd;
  background: #fff;
  box-shadow: 0 0 0.5px #ececec;

  ${({ $me }) =>
    $me &&
    css`
      align-self: flex-end;
      background: #e5f7e8;
      border-left: 4px solid #49b95b;
    `}
  ${({ $bot }) =>
    $bot &&
    css`
      background: #eef6ff;
      border-left: 4px solid #1890ff;
    `}
  ${({ $admin }) =>
    $admin &&
    css`
      background: #fff4e1;
      border-left: 4px solid #ffc048;
    `}
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.1rem;
`;

const Avatar = styled.span<{ $bot?: boolean; $admin?: boolean; $me?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: bold;
  background: #e2e6ea;
  ${({ $bot }) =>
    $bot &&
    css`
      background: #c8e1ff;
    `}
  ${({ $admin }) =>
    $admin &&
    css`
      background: #ffe29d;
    `}
  ${({ $me }) =>
    $me &&
    css`
      background: #98eaa1;
    `}
`;

const Sender = styled.span<{ $bot?: boolean; $admin?: boolean; $me?: boolean }>`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${({ $bot, $admin, $me }) =>
    $bot ? "#1876d2" : $admin ? "#b68d11" : $me ? "#2d9a43" : "#222"};
`;

const Text = styled.div`
  font-size: 1.05rem;
  margin: 0.25rem 0 0.1rem 0;
  word-break: break-word;
`;

const Time = styled.span`
  font-size: 0.79rem;
  color: #999;
  margin-left: auto;
  margin-right: 0;
  min-width: 44px;
  text-align: right;
`;
