// src/modules/contact/components/ContactMessageModal.tsx
"use client";

import { useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { markContactMessageAsRead } from "@/modules/contact/slice/contactSlice";
import type { IContactMessage } from "@/modules/contact/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

interface Props {
  message: IContactMessage;
  onClose: () => void;
}

export default function ContactMessageModal({ message, onClose }: Props) {
  const { t } = useI18nNamespace("contact", translations);
  const dispatch = useAppDispatch();

  const id = message?._id;
  const isRead = message?.isRead;

  useEffect(() => {
    if (id && !isRead) dispatch(markContactMessageAsRead(id));
  }, [dispatch, id, isRead]);

  const created = useMemo(() => new Date(message.createdAt).toLocaleString(), [message.createdAt]);

  return (
    <Overlay role="dialog" aria-modal="true">
      <Modal>
        <Header>
          <Subject>{message.subject}</Subject>
          <Close onClick={onClose}>{t("admin.close", "Kapat")}</Close>
        </Header>

        <Row>
          <b>{t("admin.from", "Gönderen")}:</b>
          <span>{message.name} ({message.email})</span>
        </Row>
        <Row>
          <b>{t("admin.date", "Tarih")}:</b>
          <span>{created}</span>
        </Row>

        <Body>
          <b>{t("admin.message", "Mesaj")}:</b>
          <Content>{message.message}</Content>
        </Body>
      </Modal>
    </Overlay>
  );
}

/* styled — pattern tokens */
const fadeIn = keyframes`
  from { opacity:0; transform:scale(.96) translateY(16px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
`;
const Overlay = styled.div`
  position:fixed; inset:0; z-index:${({theme})=>theme.zIndex.modal};
  display:flex; align-items:center; justify-content:center;
  background:rgba(25, 38, 51, 0.35); backdrop-filter:blur(5px);
`;
const Modal = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  border-radius:${({theme})=>theme.radii.xl};
  box-shadow:${({theme})=>theme.cards.shadow};
  width:100%; max-width:480px; padding:${({theme})=>theme.spacings.xl};
  animation:${fadeIn} .22s ease-out;

  ${({theme})=>theme.media.small}{
    padding:${({theme})=>theme.spacings.md}; max-width:96vw;
  }
`;
const Header = styled.div`
  display:flex; justify-content:space-between; align-items:flex-start;
  gap:${({theme})=>theme.spacings.sm}; margin-bottom:${({theme})=>theme.spacings.md};
  border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
  padding-bottom:${({theme})=>theme.spacings.sm};
`;
const Subject = styled.h2`
  margin:0; font-size:${({theme})=>theme.fontSizes.md};
  color:${({theme})=>theme.colors.primary};
`;
const Close = styled.button`
  background:none;
  color:${({theme})=>theme.colors.danger};
  border:none; border-radius:${({theme})=>theme.radii.pill};
  padding:.4em 1.1em; cursor:pointer; font-size:${({theme})=>theme.fontSizes.sm};
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  &:hover{ background:${({theme})=>theme.colors.dangerBg}; color:${({theme})=>theme.colors.textOnDanger}; }
`;
const Row = styled.p`
  margin:${({theme})=>theme.spacings.xs} 0; display:flex; gap:6px; align-items:center;
  color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.sm};
  b{ color:${({theme})=>theme.colors.textPrimary}; font-weight:${({theme})=>theme.fontWeights.medium}; }
`;
const Body = styled.div`
  background:${({theme})=>theme.colors.inputBackgroundLight};
  padding:${({theme})=>theme.spacings.md};
  border-radius:${({theme})=>theme.radii.md};
  margin-top:${({theme})=>theme.spacings.md};
  border-left:4px solid ${({theme})=>theme.colors.primary};
`;
const Content = styled.div`
  margin-top:${({theme})=>theme.spacings.sm};
  white-space:pre-line;
  font-size:${({theme})=>theme.fontSizes.sm};
  color:${({theme})=>theme.colors.text};
  line-height:${({theme})=>theme.lineHeights.relaxed};
`;
