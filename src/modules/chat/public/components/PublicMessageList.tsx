"use client";

import React from "react";
import styled from "styled-components";
import { ChatMessage } from "@/modules/chat";

interface Props {
  messages: ChatMessage[];
}

const PublicMessageList: React.FC<Props> = ({ messages }) => {
  return (
    <Container>
      {messages.map((msg) => (
        <MessageItem
          key={msg._id || `${msg.createdAt}-${msg.message}`}
          $bot={msg.isFromBot}
        >
          <Sender>
            {msg.isFromBot ? "🤖 Bot" : msg.sender?.name || "Siz"}:
          </Sender>
          <Text>{msg.message}</Text>
          <Time>{new Date(msg.createdAt).toLocaleTimeString()}</Time>
        </MessageItem>
      ))}
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

const MessageItem = styled.div<{ $bot?: boolean }>`
  background-color: ${({ $bot }) => ($bot ? "#eef6ff" : "#fff")};
  padding: 0.6rem 1rem;
  margin-bottom: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid ${({ $bot }) => ($bot ? "#1890ff" : "#ddd")};
`;

const Sender = styled.div`
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const Text = styled.div`
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
`;

const Time = styled.div`
  font-size: 0.75rem;
  color: #999;
  text-align: right;
`;
