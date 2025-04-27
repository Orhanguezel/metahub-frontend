"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createFAQ } from "@/store/faqSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface Props {
  onSuccess?: () => void;
}

export default function FAQForm({ onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("admin");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState<"tr" | "en" | "de">("de");

  const handleSubmit = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error(t("faqs.required"));
      return;
    }

    dispatch(createFAQ({ question, answer, category, language }))
      .unwrap()
      .then(() => {
        toast.success(t("faqs.created"));
        setQuestion("");
        setAnswer("");
        setCategory("");
        if (onSuccess) onSuccess();
      })
      .catch(() => toast.error(t("faqs.error")));
  };

  return (
    <FormContainer>
      <h3>➕ {t("faqs.new")}</h3>

      <Label>{t("faqs.question")}</Label>
      <Input value={question} onChange={(e) => setQuestion(e.target.value)} />

      <Label>{t("faqs.answer")}</Label>
      <TextArea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={3} />

      <Label>{t("faqs.category")}</Label>
      <Input value={category} onChange={(e) => setCategory(e.target.value)} />

      <Label>{t("faqs.language")}</Label>
      <Select value={language} onChange={(e) => setLanguage(e.target.value as "tr" | "en" | "de")}>
        <option value="en">English</option>
        <option value="tr">Türkçe</option>
        <option value="de">Deutsch</option>
      </Select>

      <Button onClick={handleSubmit}>{t("common.create")}</Button>
    </FormContainer>
  );
}

// Styled Components
const FormContainer = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  padding: 2rem;
  border-radius: 12px;
  margin-top: 2rem;
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
  resize: vertical;
  border-radius: 6px;
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

const Button = styled.button`
  margin-top: 1.5rem;
  padding: 10px 18px;
  background: ${({ theme }) => theme.success};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }
`;
