"use client";

import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

interface Props {
  onSend: (message: string) => void;
  placeholder?: string;
  sendLabel?: string;
  disabled?: boolean;
}

const PublicChatInput: React.FC<Props> = ({
  onSend,
  placeholder = "Bir şey yazın...",
  sendLabel = "Gönder",
  disabled = false,
}) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus ilk renderda (UX)
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Wrapper>
      <Textarea
        ref={textareaRef}
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={disabled}
        maxLength={512}
        spellCheck={true}
        tabIndex={0}
      />
      <Button type="button" onClick={handleSend} disabled={disabled || !value.trim()}>
        {sendLabel}
      </Button>
    </Wrapper>
  );
};

export default PublicChatInput;

// --- Styled ---
const Wrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  padding: 1rem;
  border-top: 1px solid #ddd;
  background: ${({ theme }) => theme.colors?.cardBackground || "#fafbfc"};
`;

const Textarea = styled.textarea`
  flex: 1;
  padding: 0.6rem 0.8rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  resize: none;
  font-family: inherit;
  outline: none;
  background: ${({ theme }) => theme.colors?.inputBackground || "#fff"};
  color: ${({ theme }) => theme.colors?.text || "#111"};
  &:disabled {
    background: #f2f2f2;
    color: #bbb;
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors?.primary || "#0070f3"};
  color: #fff;
  font-weight: 500;
  border: none;
  padding: 0.6rem 1.1rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 88px;
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors?.primaryHover || "#005bbb"};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
