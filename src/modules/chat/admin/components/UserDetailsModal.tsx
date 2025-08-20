"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import type { EscalatedRoom } from "@/modules/chat/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";

interface Props {
  session: EscalatedRoom | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<Props> = ({ session, onClose }) => {
  const { t } = useI18nNamespace("chat", translations);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!session) return null;

  const { user, room, lang, message, createdAt } = session;

  const T = {
    title: t("admin.user_details_title", "👤 Kullanıcı Bilgisi"),
    name: t("admin.user_name", "Ad"),
    email: t("admin.user_email", "E-posta"),
    room: t("admin.user_room", "Oda"),
    language: t("admin.user_language", "Dil"),
    firstMessage: t("admin.user_first_message", "İlk Mesaj"),
    startedAt: t("admin.user_started_at", "Başlangıç"),
    close: t("common.close", "Kapat"),
  };

  return (
    <Overlay role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <Modal>
        <Title id="modal-title">{T.title}</Title>

        <Info><strong>{T.name}:</strong> {user?.name ?? "—"}</Info>
        <Info><strong>{T.email}:</strong> {user?.email ?? "—"}</Info>
        <Info><strong>{T.room}:</strong> {room}</Info>
        <Info><strong>{T.language}:</strong> {lang?.toUpperCase() || "—"}</Info>
        <Info><strong>{T.firstMessage}:</strong> {message}</Info>
        <Info><strong>{T.startedAt}:</strong> {formatDT(createdAt, lang)}</Info>

        <CloseButton onClick={onClose} aria-label={T.close}>{T.close}</CloseButton>
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
  padding: ${({theme})=>theme.spacings.md};
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
  word-break: break-word;
`;

const CloseButton = styled.button`
  margin-top:${({theme})=>theme.spacings.md};
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  padding:10px 14px; border:none;
  border-radius:${({theme})=>theme.radii.md};
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  cursor:pointer;
  transition:${({theme})=>theme.transition.fast};

  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
  &:focus{ outline:2px solid ${({theme})=>theme.colors.inputOutline}; outline-offset:3px; }
`;

function formatDT(iso?: string, lang?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(lang || undefined, {
      year:"numeric", month:"2-digit", day:"2-digit",
      hour:"2-digit", minute:"2-digit"
    }).format(d);
  } catch { return iso; }
}
