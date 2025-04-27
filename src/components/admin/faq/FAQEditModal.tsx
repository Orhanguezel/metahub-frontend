"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FAQ, createFAQ } from "@/store/faqSlice"; // alternatif olarak updateFAQ varsa onunla değiştir

interface Props {
  faq: FAQ;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FAQEditModal({ faq, onClose, onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("admin");

  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [category, setCategory] = useState(faq.category ?? "");
  const [language, setLanguage] = useState<"tr" | "en" | "de">(faq.language ?? "en");

  const handleUpdate = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error(t("faqs.required"));
      return;
    }

    const updated = {
      ...faq,
      question,
      answer,
      category,
      language,
    };

    try {
      await dispatch(createFAQ(updated)).unwrap(); // create yerine updateFAQ varsa onu kullan
      toast.success(t("faqs.updated") || "FAQ güncellendi");
      onSuccess();
    } catch {
      toast.error(t("faqs.updateError") || "Güncelleme sırasında hata oluştu.");
    }
  };

  return (
    <Overlay>
      <Modal>
        <h3>📝 {t("faqs.edit") || "SSS Düzenle"}</h3>

        <Label>{t("faqs.question")}</Label>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} />

        <Label>{t("faqs.answer")}</Label>
        <TextArea rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} />

        <Label>{t("faqs.category")}</Label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} />

        <Label>{t("faqs.language")}</Label>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "tr" | "en" | "de")}
        >
          <option value="en">English</option>
          <option value="tr">Türkçe</option>
          <option value="de">Deutsch</option>
        </Select>

        <ButtonGroup>
          <Button onClick={handleUpdate}>{t("common.save")}</Button>
          <Button danger onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

// 💅 Styled Components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  padding: 2rem;
  max-width: 500px;
  margin: 8vh auto;
  border-radius: 12px;
`;

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin: 1rem 0 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  font-size: 1rem;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  resize: vertical;
  font-size: 1rem;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const ButtonGroup = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ danger?: boolean }>`
  padding: 10px 18px;
  background: ${({ danger, theme }) => (danger ? theme.danger : theme.success)};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;
