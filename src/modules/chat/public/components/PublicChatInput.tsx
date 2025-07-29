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
      <SendButton type="button" onClick={handleSend} disabled={disabled || !value.trim()}>
        {sendLabel}
      </SendButton>
    </Wrapper>
  );
};

export default PublicChatInput;

// --- Styled Components ---
const Wrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: flex-end;
  padding: ${({ theme }) => theme.spacings.md};
  border-top: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  border-bottom-left-radius: ${({ theme }) => theme.radii.md};
  border-bottom-right-radius: ${({ theme }) => theme.radii.md};

  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacings.sm};
    gap: ${({ theme }) => theme.spacings.xs};
    border-radius: 0 0 ${({ theme }) => theme.radii.sm} ${({ theme }) => theme.radii.sm};
  }
`;

const Textarea = styled.textarea`
  flex: 1;
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  min-height: 40px;
  max-height: 90px;
  resize: none;
  font-family: inherit;
  outline: none;
  transition: border 0.17s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: 0 0 0 1.5px ${({ theme }) => theme.colors.inputOutline};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 0.65;
  }
`;

const SendButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  border: none;
  padding: 0.65rem 1.1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast}, color ${({ theme }) => theme.transition.fast};
  min-width: 90px;
  box-shadow: ${({ theme }) => theme.shadows.xs};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    min-width: 66px;
    padding: ${({ theme }) => theme.spacings.xs} ${({ theme }) => theme.spacings.sm};
  }
`;
