import React, { useEffect, useRef } from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);

  // Body scroll'u disable et
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Odaklanma
      setTimeout(() => {
        contentRef.current?.focus();
      }, 30);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Overlay
      onClick={onClose}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <Content
        ref={contentRef}
        tabIndex={0}
        onClick={e => e.stopPropagation()}
      >
        <CloseButton onClick={onClose} aria-label="Close modal">
          <X size={28} />
        </CloseButton>

        {onPrev && (
          <ArrowButtonLeft onClick={e => { e.stopPropagation(); onPrev(); }}>
            <ChevronLeft size={36} />
          </ArrowButtonLeft>
        )}

        <ContentWrapper>
          {children}
        </ContentWrapper>

        {onNext && (
          <ArrowButtonRight onClick={e => { e.stopPropagation(); onNext(); }}>
            <ChevronRight size={36} />
          </ArrowButtonRight>
        )}
      </Content>
    </Overlay>
  );
}

// --- Styles ---
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20, 17, 23, 0.93);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex?.modal || 9999};
`;

const Content = styled.div`
  position: relative;
  min-width: 340px;
  min-height: 220px;
  max-width: 97vw;
  max-height: 98vh;
  background: none;
  animation: ${fadeIn} ${({ theme }) => theme.transition?.normal || "0.32s"};
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
`;

const ContentWrapper = styled.div`
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 22px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  z-index: 5;
  font-size: 1.4em;

  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const ArrowButtonLeft = styled.button`
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  z-index: 3;

  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const ArrowButtonRight = styled.button`
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  z-index: 3;

  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;
