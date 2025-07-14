"use client";

import React, { useState } from "react";
import styled from "styled-components";

interface Props {
  onSend: (message: string) => void;
  sendLabel?: string;
  placeholder?: string;
  lang?: string;
}

const ChatInput: React.FC<Props> = ({
  onSend,
  sendLabel = "Gönder",
  placeholder = "Mesaj yaz...",
}) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Wrapper>
      <StyledTextarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={2}
        onKeyDown={handleKeyDown}
      />
      <SendButton onClick={handleSend} disabled={!value.trim()}>
        {sendLabel}
      </SendButton>
    </Wrapper>
  );
};

export default ChatInput;

// 💅 Styles
const Wrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-top: 1rem;
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
  font-size: 1rem;
  line-height: 1.4;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0070f3;
  }
`;

const SendButton = styled.button`
  padding: 0.6rem 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover:enabled {
    background-color: #005bbb;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;
