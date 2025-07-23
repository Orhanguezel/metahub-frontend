// src/modules/newsletter/components/NewsletterModal.tsx
"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useState } from "react";

export default function NewsletterModal({ onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18nNamespace("newsletter", translations);
  const [sent, setSent] = useState(false);

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
        <ModalTitle>{t("modalTitle", "E-Bülten Aboneliği")}</ModalTitle>
        {sent ? (
          <SuccessMsg>{t("success", "Teşekkürler! E-bültenimize abone oldunuz.")}</SuccessMsg>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              placeholder={t("form.email", "E-posta adresiniz")}
              type="email"
              required
            />
            <SubmitBtn type="submit">{t("form.subscribe", "Abone Ol")}</SubmitBtn>
          </form>
        )}
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(30, 38, 51, 0.38);
  z-index: 1400;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
`;
const Modal = styled.div`
  width: 350px;
  background: #fff;
  border-radius: 16px 0 0 16px;
  margin: 2.7rem 0 0 0;
  padding: 2.1rem 2rem 1.5rem 2rem;
  box-shadow: 0 10px 32px #2226;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 180px;
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
  font-size: 1.28em;
  font-weight: 700;
  margin-bottom: 1.1em;
  color: #1e2633;
`;
const Input = styled.input`
  width: 100%; margin-bottom: 1em;
  padding: 0.95em 1em; font-size: 1em; border-radius: 7px;
  border: 1.4px solid #e0e0e0;
  &:focus { border-color: #F97316; outline: none; }
`;
const SubmitBtn = styled.button`
  width: 100%; background: #F97316;
  color: #fff; border: none; border-radius: 7px;
  padding: 0.85em 1em; font-size: 1.08em;
  font-weight: 600; cursor: pointer;
  box-shadow: 0 2px 14px #F9731633;
  transition: background 0.18s;
  &:hover { background: #EA580C; }
`;
const SuccessMsg = styled.div`
  color: #0b933c; font-size: 1.13em; text-align: center; margin-top: 2em;
`;
