"use client";

import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";

type Props = {
  onSend: (message: string) => void;
  placeholder?: string;
  sendLabel?: string;
  lang?: string;
  disabled?: boolean;
};

export default function ChatInput({ onSend, placeholder = "Type a message...", sendLabel = "Send", disabled }: Props) {
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const send = useCallback(() => {
    const msg = text.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setText("");
    taRef.current?.focus();
  }, [text, disabled, onSend]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Composer>
      <Area
        ref={taRef}
        value={text}
        onChange={(e)=>setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        disabled={disabled}
        rows={2}
      />
      <SendBtn onClick={send} disabled={disabled}>
        {sendLabel}
      </SendBtn>
    </Composer>
  );
}

const Composer = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.sm};
  align-items:flex-end;
`;

const Area = styled.textarea`
  flex:1;
  resize:vertical;
  min-height:56px;
  font-size:${({theme})=>theme.fontSizes.sm};
  line-height:${({theme})=>theme.lineHeights.normal};
  background:${({theme})=>theme.colors.inputBackground};
  color:${({theme})=>theme.colors.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  border-radius:${({theme})=>theme.radii.md};
  padding:${({theme})=>theme.spacings.sm};
  &:focus{
    outline:none;
    border-color:${({theme})=>theme.colors.inputBorderFocus};
    box-shadow:${({theme})=>theme.colors.shadowHighlight};
    background:${({theme})=>theme.colors.inputBackgroundFocus};
  }
  &::placeholder{ color:${({theme})=>theme.colors.placeholder}; }
`;

const SendBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:10px 14px; border-radius:${({theme})=>theme.radii.md};
  cursor:pointer;
  &:disabled{
    opacity:${({theme})=>theme.opacity.disabled};
    cursor:not-allowed;
  }
`;
