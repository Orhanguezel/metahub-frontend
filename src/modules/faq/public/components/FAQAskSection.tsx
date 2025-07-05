"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { askFAQ, clearFAQMessages } from "@/modules/faq/slice/faqSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export default function FAQAskSection() {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("faq");
  const [question, setQuestion] = useState("");

  const { answer, loading } = useAppSelector((state) => state.faq);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error(t("publicFaq.askRequired"));
      return;
    }

    dispatch(clearFAQMessages());
    await dispatch(askFAQ({ question, language: i18n.language }));
  };

  return (
    <Container>
      <Title>🤖 {t("publicFaq.askTitle")}</Title>

      <Label>{t("publicFaq.question")}</Label>
      <TextArea
        rows={3}
        placeholder={t("publicFaq.askPlaceholder")}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <Button onClick={handleAsk} disabled={loading}>
        {loading ? t("common.loading") : t("publicFaq.askButton")}
      </Button>

      {answer && (
        <AnswerBox>
          <h4>{t("publicFaq.answerTitle")}</h4>
          <p>{answer}</p>
        </AnswerBox>
      )}
    </Container>
  );
}

// 💅 Styled Components

const Container = styled.section`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-top: ${({ theme }) => theme.spacings.xl};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin: ${({ theme }) => theme.spacings.md} 0
    ${({ theme }) => theme.spacings.xs};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  resize: vertical;
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const Button = styled.button`
  margin-top: ${({ theme }) => theme.spacings.lg};
  padding: 10px 18px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
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
  margin-top: ${({ theme }) => theme.spacings.xl};
  padding: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.inputBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};

  h4 {
    margin-bottom: ${({ theme }) => theme.spacings.xs};
    color: ${({ theme }) => theme.colors.success};
  }

  p {
    white-space: pre-line;
  }
`;
