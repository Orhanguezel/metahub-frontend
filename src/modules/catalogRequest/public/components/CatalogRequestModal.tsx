// src/modules/catalogRequest/components/CatalogRequestModal.tsx
"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useState } from "react";

export default function CatalogRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18nNamespace("catalogRequest", translations);
  const [sent, setSent] = useState(false);

  // Demo form submit
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(onClose, 1400);
  }

  return (
    <Overlay onClick={onClose}>
      <Modal
        as={motion.div}
        initial={{ x: 360, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 360, opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={e => e.stopPropagation()}
      >
        <CloseButton onClick={onClose}>×</CloseButton>
        <ModalTitle>{t("modalTitle", "Katalog Talep Formu")}</ModalTitle>
        {sent ? (
          <SuccessMsg>{t("success", "Talebiniz iletildi! Teşekkürler.")}</SuccessMsg>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input placeholder={t("form.name", "Ad Soyad")} required />
            <Input placeholder={t("form.email", "E-posta")} required type="email" />
            <Input placeholder={t("form.company", "Firma Adı")} />
            <Input placeholder={t("form.phone", "Telefon")} />
            <Textarea placeholder={t("form.message", "Ek mesaj veya notunuz...")} />
            <SubmitBtn type="submit">{t("form.send", "Gönder")}</SubmitBtn>
          </form>
        )}
      </Modal>
    </Overlay>
  );
}

// Styled Components...
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(30, 38, 51, 0.42);
  z-index: 1400;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
`;
const Modal = styled.div`
  width: 360px;
  background: #fff;
  border-radius: 16px 0 0 16px;
  margin: 2.7rem 0 0 0;
  padding: 2.1rem 2rem 1.5rem 2rem;
  box-shadow: 0 10px 32px #2227;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 350px;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 12px; right: 18px;
  font-size: 2em;
  background: none;
  border: none;
  color: #444;
  opacity: 0.6;
  cursor: pointer;
  &:hover { opacity: 1; }
`;
const ModalTitle = styled.div`
  font-size: 1.36em;
  font-weight: 700;
  margin-bottom: 1.1em;
  color: #1e2633;
`;
const Input = styled.input`
  width: 100%; margin-bottom: 1em;
  padding: 0.9em 1em; font-size: 1em; border-radius: 7px;
  border: 1.4px solid #e0e0e0;
  &:focus { border-color: #1976d2; outline: none; }
`;
const Textarea = styled.textarea`
  width: 100%; min-height: 60px;
  margin-bottom: 1em; padding: 0.9em 1em;
  border-radius: 7px; border: 1.4px solid #e0e0e0; font-size: 1em;
  &:focus { border-color: #1976d2; outline: none; }
`;
const SubmitBtn = styled.button`
  width: 100%; background: #1976d2;
  color: #fff; border: none; border-radius: 7px;
  padding: 0.87em 1em; font-size: 1.08em;
  font-weight: 600; cursor: pointer;
  box-shadow: 0 2px 14px #1976d244;
  transition: background 0.18s;
  &:hover { background: #1258a2; }
`;
const SuccessMsg = styled.div`
  color: #0b933c; font-size: 1.19em; text-align: center; margin-top: 2.5em;
`;

