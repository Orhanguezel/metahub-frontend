// src/modules/chat/components/FloatingChatbox.tsx
"use client";

import { useState } from "react";
import styled from "styled-components";
import { BsChatDots } from "react-icons/bs";
import ChatBox from "@/modules/chat/public/components/ChatBox"; // Senin ana chat kutun

export default function FloatingChatboxSection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ChatButton
        aria-label="Chat"
        onClick={() => setOpen(true)}
        title="Canlı Sohbet"
      >
        <BsChatDots size={28} />
      </ChatButton>
      {open && (
        <ChatModalOverlay onClick={() => setOpen(false)}>
          <ChatModal onClick={e => e.stopPropagation()}>
            <CloseBtn onClick={() => setOpen(false)}>×</CloseBtn>
            <ChatBox />
          </ChatModal>
        </ChatModalOverlay>
      )}
    </>
  );
}

// --- Styles ---
const ChatButton = styled.button`
  position: fixed;
  bottom: 34px;
  right: 234px;
  z-index: 1201;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 0.85em 1.15em;
  box-shadow: ${({ theme }) => theme.shadows.md};
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  display: flex;
  align-items: center;
  gap: 0.6em;
`;

const ChatModalOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(36, 38, 47, 0.34);
  z-index: 1401;
  display: flex; align-items: flex-end; justify-content: flex-end;
`;

const ChatModal = styled.div`
  width: 95vw; max-width: 480px; height: 78vh; max-height: 640px;
  margin: 0 2vw 36px 0;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 12px 48px #3336;
  display: flex; flex-direction: column;
  position: relative;
  @media (max-width: 800px) {
    width: 99vw; max-width: 99vw; margin: 0 0 8px 0;
    border-radius: 16px 16px 0 0;
  }
`;

const CloseBtn = styled.button`
  position: absolute; top: 9px; right: 18px; z-index: 2;
  background: none; border: none; color: #888;
  font-size: 2em; opacity: 0.63; cursor: pointer;
  &:hover { opacity: 1; color: #D31B1B; }
`;
