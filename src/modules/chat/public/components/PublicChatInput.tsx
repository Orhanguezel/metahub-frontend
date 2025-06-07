"use client";

import React, { useState } from "react";
import styled from "styled-components";

interface Props {
  onSend: (message: string) => void;
}

const PublicChatInput: React.FC<Props> = ({ onSend }) => {
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
      <Textarea
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Bir şey yazın..."
      />
      <Button onClick={handleSend}>Gönder</Button>
    </Wrapper>
  );
};

export default PublicChatInput;

// Styled
const Wrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  padding: 1rem;
  border-top: 1px solid #ddd;
`;

const Textarea = styled.textarea`
  flex: 1;
  padding: 0.6rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  resize: none;
  font-family: inherit;
`;

const Button = styled.button`
  background-color: #0070f3;
  color: white;
  font-weight: bold;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;

  &:hover {
    background-color: #005bbb;
  }
`;
