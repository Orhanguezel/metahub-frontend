"use client";

import React from "react";
import styled, { keyframes } from "styled-components";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, onNext, onPrev, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close modal">
          <X size={28} />
        </CloseButton>

        {onPrev && (
          <ArrowButtonLeft onClick={(e) => { e.stopPropagation(); onPrev(); }}>
            <ChevronLeft size={36} />
          </ArrowButtonLeft>
        )}

        <ContentWrapper>
          {children}
        </ContentWrapper>

        {onNext && (
          <ArrowButtonRight onClick={(e) => { e.stopPropagation(); onNext(); }}>
            <ChevronRight size={36} />
          </ArrowButtonRight>
        )}
      </Content>
    </Overlay>
  );
}

// 🎨 Animasyon ve stiller (senin gönderdiğin gibi)
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal || 9999};
`;

const Content = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  animation: ${fadeIn} ${({ theme }) => theme.transition?.normal || "0.3s"};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentWrapper = styled.div`
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 95vw;
    max-height: 95vh;
    object-fit: contain;
    border-radius: 12px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;

  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const ArrowButtonLeft = styled.button`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;

  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const ArrowButtonRight = styled.button`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;

  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;
