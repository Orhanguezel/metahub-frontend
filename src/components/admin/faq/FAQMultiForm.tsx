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

type LangCode = "tr" | "en" | "de";

const languageLabels: Record<LangCode, string> = {
  en: "English",
  tr: "Türkçe",
  de: "Deutsch",
};

export default function FAQMultiForm({ onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation("admin");

  const [faqMultilang, setFaqMultilang] = useState<
    Record<LangCode, { question: string; answer: string }>
  >({
    en: { question: "", answer: "" },
    tr: { question: "", answer: "" },
    de: { question: "", answer: "" },
  });

  const isComplete = Object.values(faqMultilang).every(
    (val) => val.question.trim() && val.answer.trim()
  );

  const handleSubmit = async () => {
    try {
      await Promise.all(
        Object.entries(faqMultilang).map(([lang, { question, answer }]) =>
          dispatch(
            createFAQ({ question, answer, language: lang as LangCode })
          ).unwrap()
        )
      );

      toast.success(t("faqs.created"));

      setFaqMultilang({
        en: { question: "", answer: "" },
        tr: { question: "", answer: "" },
        de: { question: "", answer: "" },
      });

      if (onSuccess) onSuccess();
    } catch (err:any) {
      toast.error(t("faqs.error"),err);
    }
  };

  return (
    <Container>
      <h3>➕ {t("faqs.newMulti") || "Yeni SSS (Çok Dilli)"}</h3>

      <CardGrid>
        {(["en", "tr", "de"] as LangCode[]).map((lang) => {
          const entry = faqMultilang[lang];
          const filled = entry.question.trim() && entry.answer.trim();

          return (
            <LangCard key={lang}>
              <LangHeader>
                {languageLabels[lang]} {filled && <CheckMark>✓</CheckMark>}
              </LangHeader>

              <Label>{t("faqs.question")}</Label>
              <Input
                value={entry.question}
                onChange={(e) =>
                  setFaqMultilang((prev) => ({
                    ...prev,
                    [lang]: { ...prev[lang], question: e.target.value },
                  }))
                }
              />

              <Label>{t("faqs.answer")}</Label>
              <TextArea
                rows={3}
                value={entry.answer}
                onChange={(e) =>
                  setFaqMultilang((prev) => ({
                    ...prev,
                    [lang]: { ...prev[lang], answer: e.target.value },
                  }))
                }
              />
            </LangCard>
          );
        })}
      </CardGrid>

      <Button disabled={!isComplete} onClick={handleSubmit}>
        {t("common.create")}
      </Button>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  margin-top: 2rem;
`;

const CardGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  margin-bottom: 2rem;
`;

const LangCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  padding: 1.2rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
`;

const LangHeader = styled.div`
  font-weight: 600;
  margin-bottom: 0.8rem;
`;

const CheckMark = styled.span`
  color: green;
  font-size: 1.1rem;
  margin-left: 6px;
`;

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin: 0.5rem 0 0.3rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  resize: vertical;
  background: ${({ theme }) => theme.inputBackground};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
`;

const Button = styled.button<{ disabled?: boolean }>`
  padding: 10px 18px;
  background: ${({ disabled, theme }) => (disabled ? "#999" : theme.success)};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-weight: 600;
`;
