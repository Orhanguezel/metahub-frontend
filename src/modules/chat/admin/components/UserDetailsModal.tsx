"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { EscalatedRoom } from "@/modules/chat/types";

interface Props {
  session: EscalatedRoom | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<Props> = ({ session, onClose }) => {
  // ✅ useEffect her zaman çağrılır
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // JSX'te conditional rendering yapılır
  if (!session) return null;

  const { user, room, lang, message, createdAt } = session;

  return (
    <Overlay role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <Modal>
        <Title id="modal-title">👤 Kullanıcı Bilgisi</Title>
        <Info>
          <strong>Ad:</strong> {user.name}
        </Info>
        <Info>
          <strong>E-posta:</strong> {user.email}
        </Info>
        <Info>
          <strong>Oda:</strong> {room}
        </Info>
        <Info>
          <strong>Dil:</strong> {lang?.toUpperCase()}
        </Info>
        <Info>
          <strong>İlk Mesaj:</strong> {message}
        </Info>
        <Info>
          <strong>Başlangıç:</strong> {new Date(createdAt).toLocaleString()}
        </Info>
        <CloseButton onClick={onClose}>Kapat</CloseButton>
      </Modal>
    </Overlay>
  );
};

export default UserDetailsModal;

// 💅 Styles
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
`;

const Modal = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  outline: none;
`;

const Title = styled.h3`
  margin-top: 0;
  font-size: 1.3rem;
`;

const Info = styled.p`
  margin: 0.5rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  margin-top: 2rem;
  background-color: #0070f3;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #005bbb;
  }

  &:focus {
    outline: 2px solid #005bbb;
    outline-offset: 3px;
  }
`;
