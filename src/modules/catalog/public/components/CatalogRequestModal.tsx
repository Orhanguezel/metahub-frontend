"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sendCatalogRequest, clearCatalogState } from "../../slice/catalogSlice";
import { SUPPORTED_LOCALES } from "@/types/common";

export default function CatalogRequestModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t, i18n } = useI18nNamespace("catalogRequest", translations);
  const dispatch = useAppDispatch();
  const { loading, error, successMessage } = useAppSelector((s) => s.catalog);

  // Locale'i i18n veya fallback'ten çek
  const locale = (i18n.language?.slice(0, 2) as typeof SUPPORTED_LOCALES[number]) || "tr";

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: t("form.subjectDefault", "Katalog Talebi"),
    message: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // Form gönderimi
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // API'ye POST /catalog
    await dispatch(
      sendCatalogRequest({
        ...form,
        locale,
      })
    ).unwrap()
      .then(() => {
        setTimeout(() => {
          dispatch(clearCatalogState());
          onClose();
        }, 1700);
      });
  }

  // Modal kapandığında form resetle
  function handleClose() {
    setForm({
      name: "",
      email: "",
      company: "",
      phone: "",
      subject: t("form.subjectDefault", "Katalog Talebi"),
      message: "",
    });
    dispatch(clearCatalogState());
    onClose();
  }

  return (
    <Overlay onClick={handleClose}>
      <Modal
        as={motion.div}
        initial={{ x: 360, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 360, opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClick={handleClose}>×</CloseButton>
        <ModalTitle>{t("modalTitle", "Katalog Talep Formu")}</ModalTitle>
        {successMessage ? (
          <SuccessMsg>{t("success", successMessage)}</SuccessMsg>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off">
            <Input
              name="name"
              placeholder={t("form.name", "Ad Soyad")}
              required
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              name="email"
              placeholder={t("form.email", "E-posta")}
              required
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              name="company"
              placeholder={t("form.company", "Firma Adı")}
              value={form.company}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              name="phone"
              placeholder={t("form.phone", "Telefon")}
              value={form.phone}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              name="subject"
              placeholder={t("form.subject", "Konu")}
              value={form.subject}
              onChange={handleChange}
              disabled={loading}
            />
            <Textarea
              name="message"
              placeholder={t("form.message", "Ek mesaj veya notunuz...")}
              value={form.message}
              onChange={handleChange}
              disabled={loading}
            />
            {error && <ErrorMsg>{t("error", error)}</ErrorMsg>}
            <SubmitBtn type="submit" disabled={loading}>
              {loading ? t("form.sending", "Gönderiliyor...") : t("form.send", "Gönder")}
            </SubmitBtn>
          </form>
        )}
      </Modal>
    </Overlay>
  );
}

// Styled Components aynı kalabilir, sadece ek olarak:
const ErrorMsg = styled.div`
  color: #c00;
  font-size: 1em;
  margin-bottom: 1em;
  text-align: center;
`;


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

