"use client";

import { useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { askFAQ, clearFAQMessages } from "@/modules/faq/slice/faqSlice";
import { toast } from "react-toastify";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/faq/locales";

export default function FAQAskPanel() {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("faq", translations);


  const [question, setQuestion] = useState("");

  const { answer, loading } = useAppSelector((state) => state.faq);


  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error(t("ask.required", "Please enter a question."));
      return;
    }

    dispatch(clearFAQMessages());
    await dispatch(askFAQ({ question }));
  };

  return (
    <Panel>
      <h3>❓ {t("adminFaq.ask.title", "Ask a Question")}</h3>

      <Label>{t("adminFaq.form.question", "Your Question")}</Label>
      <TextArea
        rows={3}
        placeholder={t(
          "adminFaq.ask.placeholder",
          "e.g. How does the system work?"
        )}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <Button onClick={handleAsk} disabled={loading}>
        {loading
          ? t("common.loading", "Loading...")
          : t("adminFaq.ask.submit", "Ask")}
      </Button>

      {answer && (
        <AnswerBox>
          <h4>{t("adminFaq.ask.answerTitle", "Answer")}:</h4>
          <p>{answer}</p>
        </AnswerBox>
      )}
    </Panel>
  );
}

const Panel = styled.section`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.radii.md};
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
  border-radius: ${({ theme }) => theme.radii.sm};
  resize: vertical;
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const Button = styled.button`
  margin-top: 1.5rem;
  padding: 10px 18px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
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
  background: ${({ theme }) => theme.colors.inputBackground};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};

  h4 {
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.success};
  }

  p {
    white-space: pre-line;
  }
`;
