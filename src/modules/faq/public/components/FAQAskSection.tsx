"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { askFAQ, clearFAQMessages } from "@/modules/faq/slice/faqSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/faq/locales";
import { toast } from "react-toastify";
import { MdInfoOutline } from "react-icons/md";

export default function FAQAskSection() {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("faq", translations);
  const [question, setQuestion] = useState("");
  const { answer, loading } = useAppSelector((state) => state.faq);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error(t("publicFaq.askRequired"));
      return;
    }
    dispatch(clearFAQMessages());
    await dispatch(askFAQ({ question }));
  };

  return (
    <Container>
      <Title>🤖 {t("publicFaq.askTitle")}</Title>

      <Notice>
        <MdInfoOutline size={22} />
        <NoticeText>
          <strong>{t("publicFaq.askNoticeTitle", "Not:")} </strong>
          {t(
            "publicFaq.askNotice",
            "Buradan ucu açık veya detaylı sorular sorabilirsiniz. Cevaplar, yapay zeka tarafından verilmektedir ve test aşamasındadır. Bazen cevaplar eksik veya hatalı olabilir."
          )}
        </NoticeText>
      </Notice>

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
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.primary};
`;

const Notice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  background: ${({ theme }) => theme.colors.warningBackground || "#FFFBE6"};
  border: 1px solid ${({ theme }) => theme.colors.warning || "#FFC107"};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 1rem 1.1rem;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.warning || "#FFC107"};
`;

const NoticeText = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.base};
  strong {
    color: ${({ theme }) => theme.colors.warning};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  }
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
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  color: ${({ theme }) => theme.colors.text};
`;

const Button = styled.button`
  margin-top: ${({ theme }) => theme.spacings.lg};
  padding: 10px 18px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: background 0.18s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AnswerBox = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xl};
  padding: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.inputBackgroundLight || "#F0F4F8"};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};

  h4 {
    margin-bottom: ${({ theme }) => theme.spacings.xs};
    color: ${({ theme }) => theme.colors.success};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
  }

  p {
    white-space: pre-line;
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.base};
  }
`;
