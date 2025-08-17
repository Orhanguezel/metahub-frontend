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

      <Label htmlFor="faq-ask-q">{t("adminFaq.form.question", "Your Question")}</Label>
      <TextArea
        id="faq-ask-q"
        rows={3}
        placeholder={t("adminFaq.ask.placeholder", "e.g. How does the system work?")}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <Actions>
        <Primary onClick={handleAsk} disabled={loading}>
          {loading ? t("common.loading", "Loading...") : t("adminFaq.ask.submit", "Ask")}
        </Primary>
      </Actions>

      {answer && (
        <AnswerBox>
          <h4>{t("adminFaq.ask.answerTitle", "Answer")}:</h4>
          <p>{answer}</p>
        </AnswerBox>
      )}
    </Panel>
  );
}

/* ---- styled (admin inputs/buttons) ---- */
const Panel = styled.section`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  margin-top: ${({ theme }) => theme.spacings.lg};
`;

const Label = styled.label`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
  display:block;
  margin: ${({ theme }) => theme.spacings.sm} 0 ${({ theme }) => theme.spacings.xs};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  resize: vertical;
  background: ${({ theme }) => theme.inputs.background};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  color: ${({ theme }) => theme.inputs.text};
`;

const Actions = styled.div`
  display:flex; justify-content:flex-end; margin-top:${({theme})=>theme.spacings.md};
`;

const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} transparent;
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  &:disabled{ opacity:${({theme})=>theme.opacity.disabled}; cursor:not-allowed; }
  &:hover:not(:disabled){ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;

const AnswerBox = styled.div`
  margin-top: ${({ theme }) => theme.spacings.lg};
  padding: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.inputBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  h4 { margin-bottom: ${({ theme }) => theme.spacings.xs}; color:${({ theme }) => theme.colors.success}; }
  p { white-space: pre-line; }
`;
