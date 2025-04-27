"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { askFAQ, clearFAQMessages } from "@/store/faqSlice";
import { RootState } from "@/store";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function FAQAskPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const { t} = useTranslation("admin");

  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState<"en" | "de" | "tr">("en");

  const { answer, loading } = useSelector((state: RootState) => state.faq);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error(t("faqs.askRequired") || "Bitte gib eine Frage ein.");
      return;
    }

    dispatch(clearFAQMessages());
    await dispatch(askFAQ({ question, language }));
  };

  return (
    <Container>
      <h3>❓ {t("faqs.askTitle") || "Frage stellen"}</h3>

      <Label>{t("faqs.question")}</Label>
      <TextArea
        rows={3}
        placeholder={t("faqs.askPlaceholder") || "Was möchten Sie wissen?"}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <Label>{t("faqs.language")}</Label>
      <Select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "en" | "de" | "tr")}
      >
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="tr">Türkçe</option>
      </Select>

      <Button onClick={handleAsk} disabled={loading}>
        {loading ? t("common.loading") : t("faqs.askButton") || "Frage stellen"}
      </Button>

      {answer && (
        <AnswerBox>
          <h4>{t("faqs.answerTitle") || "Antwort:"}</h4>
          <p>{answer}</p>
        </AnswerBox>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.div`
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

const Button = styled.button`
  margin-top: 1.5rem;
  padding: 10px 18px;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AnswerBox = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: ${({ theme }) => theme.inputBackground};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};

  h4 {
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.success};
  }

  p {
    white-space: pre-line;
  }
`;
