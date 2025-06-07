"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createFAQ, updateFAQ, FAQ } from "@/modules/faq/slice/faqSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface Props {
  onSuccess?: () => void;
  editingItem?: FAQ | null;
}

type LangCode = "tr" | "en" | "de";
const LANGS: LangCode[] = ["en", "tr", "de"];

const languageLabels: Record<LangCode, string> = {
  en: "English",
  tr: "Türkçe",
  de: "Deutsch",
};

export default function FAQForm({ onSuccess, editingItem }: Props) {
  const dispatch = useDispatch<AppDispatch>();
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
      resetForm();
    }
  }, [editingItem]);

  const isComplete = LANGS.every(
    (lang) => question[lang].trim() && answer[lang].trim()
  );

  const handleSubmit = async () => {
    if (!isComplete) {
      toast.error(
        t(
          "adminFaq.form.required",
          "Please fill in all fields in all languages."
        )
      );
      return;
    }

    const payload: FAQ = {
      question,
      answer,
      category,
      isActive: true,
      isPublished: true,
    };

    try {
      if (editingItem?._id) {
        await dispatch(
          updateFAQ({ id: editingItem._id, data: payload })
        ).unwrap();
        toast.success(t("adminFaq.form.updated", "FAQ updated successfully."));
      } else {
        await dispatch(createFAQ(payload)).unwrap();
        toast.success(t("adminFaq.form.success", "FAQ created successfully."));
      }

      resetForm();
      onSuccess?.();
    } catch {
      toast.error(t("adminFaq.form.error", "Operation failed."));
    }
  };

  const resetForm = () => {
    setQuestion({ en: "", tr: "", de: "" });
    setAnswer({ en: "", tr: "", de: "" });
    setCategory("");
  };

  return (
    <FormWrapper>
      <Title>
        {editingItem
          ? t("adminFaq.form.titleEdit", "Edit FAQ")
          : t("adminFaq.form.title", "Add New FAQ")}
      </Title>

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

      <SubmitButton onClick={handleSubmit} disabled={!isComplete}>
        {editingItem
          ? t("common.update", "Update")
          : t("adminFaq.form.submit", "Create")}
      </SubmitButton>
    </FormWrapper>
  );
}

const FormWrapper = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.h3`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const LangHeader = styled.h4`
  margin-top: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin: 1rem 0 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.6rem;
  resize: vertical;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const SubmitButton = styled.button<{ disabled?: boolean }>`
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : theme.colors.success};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 1rem;
  font-weight: bold;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  &:hover {
    opacity: ${({ disabled }) => (disabled ? 1 : 0.9)};
  }
`;
