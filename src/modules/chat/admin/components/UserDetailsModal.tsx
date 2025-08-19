"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import type { EscalatedRoom } from "@/modules/chat/types";

interface Props {
  session: EscalatedRoom | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<Props> = ({ session, onClose }) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!session) return null;

  const { user, room, lang, message, createdAt } = session;

  return (
    <Overlay role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <Modal>
        <Title id="modal-title">👤 Kullanıcı Bilgisi</Title>

        <Info><strong>Ad:</strong> {user?.name ?? "—"}</Info>
        <Info><strong>E-posta:</strong> {user?.email ?? "—"}</Info>
        <Info><strong>Oda:</strong> {room}</Info>
        <Info><strong>Dil:</strong> {lang?.toUpperCase() || "—"}</Info>
        <Info><strong>İlk Mesaj:</strong> {message}</Info>
        <Info><strong>Başlangıç:</strong> {formatDT(createdAt)}</Info>

        <CloseButton onClick={onClose}>Kapat</CloseButton>
      </Modal>
    </Overlay>
  );
};

export default UserDetailsModal;

/* 💅 Styles (classicTheme) */
const Overlay = styled.div`
  position: fixed; inset: 0;
  background: ${({theme})=>theme.colors.overlayBackground};
  display:flex; justify-content:center; align-items:center;
  z-index: ${({theme})=>theme.zIndex.modal};
`;

const Modal = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.lg};
  width:100%; max-width:520px;
  box-shadow:${({theme})=>theme.shadows.lg};
  outline:none;
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;

const Title = styled.h3`
  margin-top:0; margin-bottom:${({theme})=>theme.spacings.sm};
  font-size:${({theme})=>theme.fontSizes.md};
  color:${({theme})=>theme.colors.title};
`;

const Info = styled.p`
  margin:${({theme})=>theme.spacings.xs} 0;
  font-size:${({theme})=>theme.fontSizes.sm};
  color:${({theme})=>theme.colors.text};
`;

const CloseButton = styled.button`
  margin-top:${({theme})=>theme.spacings.md};
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  padding:10px 14px; border:none;
  border-radius:${({theme})=>theme.radii.md};
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  cursor:pointer;
  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
  &:focus{ outline:2px solid ${({theme})=>theme.colors.inputOutline}; outline-offset:3px; }
`;

function formatDT(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      year:"numeric", month:"2-digit", day:"2-digit",
      hour:"2-digit", minute:"2-digit"
    }).format(d);
  } catch { return iso; }
}
