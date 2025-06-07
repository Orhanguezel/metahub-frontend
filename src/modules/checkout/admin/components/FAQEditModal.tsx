"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FAQ } from "@/modules/faq";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

type LangCode = "tr" | "en" | "de";
const LANGS: LangCode[] = ["en", "tr", "de"];

const languageLabels: Record<LangCode, string> = {
  en: "English",
  tr: "Türkçe",
  de: "Deutsch",
};

interface Props {
  isOpen: boolean;
  editingItem: FAQ | null;
  onClose: () => void;
  onSubmit: (data: FAQ) => void;
}

export default function FAQEditModal({
  isOpen,
  editingItem,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslation("faq");

  const [question, setQuestion] = useState<Record<LangCode, string>>({
    en: "",
    tr: "",
    de: "",
  });

  const [answer, setAnswer] = useState<Record<LangCode, string>>({
    en: "",
    tr: "",
    de: "",
  });

  const [category, setCategory] = useState("");

  useEffect(() => {
    if (editingItem) {
      setQuestion(editingItem.question as Record<LangCode, string>);
      setAnswer(editingItem.answer as Record<LangCode, string>);
      setCategory(editingItem.category || "");
    } else {
      setQuestion({ en: "", tr: "", de: "" });
      setAnswer({ en: "", tr: "", de: "" });
      setCategory("");
    }
  }, [editingItem]);

  if (!isOpen) return null;

  const isComplete = LANGS.every(
    (lang) => question[lang].trim() && answer[lang].trim()
  );

  const handleSubmit = () => {
    if (!isComplete) {
      toast.error(
        t(
          "adminFaq.form.required",
          "Please fill in all fields in all languages."
        )
      );
      return;
    }

    const updatedFAQ: FAQ = {
      ...(editingItem || {}),
      question,
      answer,
      category,
      isPublished: true,
      isActive: true,
    };

    onSubmit(updatedFAQ);
  };

  return (
    <Overlay>
      <Modal>
        <h3>📝 {t("adminFaq.form.titleEdit", "Edit FAQ")}</h3>

        {LANGS.map((lang) => (
          <div key={lang}>
            <LangHeader>{languageLabels[lang]}</LangHeader>

            <Label>{t("adminFaq.form.question", "Question")}</Label>
            <Input
              value={question[lang]}
              onChange={(e) =>
                setQuestion({ ...question, [lang]: e.target.value })
              }
            />

            <Label>{t("adminFaq.form.answer", "Answer")}</Label>
            <TextArea
              rows={4}
              value={answer[lang]}
              onChange={(e) => setAnswer({ ...answer, [lang]: e.target.value })}
            />
          </div>
        ))}

        <Label>{t("adminFaq.form.category", "Category")}</Label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} />

        <ButtonGroup>
          <Button onClick={handleSubmit}>{t("common.save", "Save")}</Button>
          <Button $danger onClick={onClose}>
            {t("common.cancel", "Cancel")}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}

const LangHeader = styled.h4`
  margin-top: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 2rem;
  max-width: 520px;
  margin: 10vh auto;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin: 1rem 0 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.6rem;
  resize: vertical;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const ButtonGroup = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ $danger?: boolean }>`
  padding: 10px 18px;
  background: ${({ $danger, theme }) =>
    $danger ? theme.colors.danger : theme.colors.success};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;
