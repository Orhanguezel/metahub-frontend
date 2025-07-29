// components/PublicMessageList.tsx
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
  lang?: SupportedLocale;
}

const PublicMessageList: React.FC<Props> = ({
  messages,
  currentUserId,
  lang: langProp,
}) => {
  const { i18n } = useI18nNamespace("chat", translations);
  const lang: SupportedLocale =
    langProp || (i18n.language?.slice(0, 2) as SupportedLocale) || "en";
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  function getMessageText(msg: ChatMessage): string {
    if (msg.language && typeof msg.language === "object") {
      if (msg.language[lang] && msg.language[lang]?.trim())
        return msg.language[lang]!;
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
          (!msg.sender && !msg.isFromBot && !msg.isFromAdmin);
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

// Styled Components – Ensotek Theme & Responsive

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  min-height: 160px;

  @media (max-width: 700px) {
    padding: ${({ theme }) => theme.spacings.sm};
    margin-bottom: ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;

const MessageItem = styled.div<{ $me?: boolean; $bot?: boolean; $admin?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 97%;
  margin-bottom: ${({ theme }) => theme.spacings.md};
  padding: 0.85rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border-left: 4px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.xs};

  ${({ $me, theme }) =>
    $me &&
    css`
      align-self: flex-end;
      background: ${theme.colors.successBg};
      border-left: 4px solid ${theme.colors.success};
    `}
  ${({ $bot, theme }) =>
    $bot &&
    css`
      background: ${theme.colors.info};
      border-left: 4px solid ${theme.colors.primary};
    `}
  ${({ $admin, theme }) =>
    $admin &&
    css`
      background: ${theme.colors.warningBackground};
      border-left: 4px solid ${theme.colors.warning};
    `}

  @media (max-width: 700px) {
    padding: ${({ theme }) => theme.spacings.sm};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    max-width: 100%;
    margin-bottom: ${({ theme }) => theme.spacings.sm};
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.13rem;
`;

const Avatar = styled.span<{ $bot?: boolean; $admin?: boolean; $me?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radii.circle};
  font-size: 1.12rem;
  font-weight: bold;
  background: ${({ theme }) => theme.colors.skeleton};
  ${({ $bot, theme }) =>
    $bot &&
    css`
      background: ${theme.colors.accent};
      color: ${theme.colors.accentText};
    `}
  ${({ $admin, theme }) =>
    $admin &&
    css`
      background: ${theme.colors.warning};
      color: ${theme.colors.textOnWarning};
    `}
  ${({ $me, theme }) =>
    $me &&
    css`
      background: ${theme.colors.success};
      color: ${theme.colors.textOnSuccess};
    `}
`;

const Sender = styled.span<{ $bot?: boolean; $admin?: boolean; $me?: boolean }>`
  font-weight: 600;
  font-size: 0.96rem;
  color: ${({ $bot, $admin, $me, theme }) =>
    $bot ? theme.colors.accent
    : $admin ? theme.colors.warning
    : $me ? theme.colors.success
    : theme.colors.text};
`;

const Text = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin: 0.25rem 0 0.09rem 0;
  word-break: break-word;
  color: ${({ theme }) => theme.colors.text};
  @media (max-width: 700px) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const Time = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-left: auto;
  min-width: 40px;
  text-align: right;
`;
