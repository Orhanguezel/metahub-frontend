"use client";

import { useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { createFAQ } from "@/modules/faq/slice/faqSlice";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

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
  const dispatch = useAppDispatch();
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

  const isComplete = (["en", "tr", "de"] as LangCode[]).every(
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

    try {
      await dispatch(
        createFAQ({
          question,
          answer,
          category,
          isActive: true,
          isPublished: true,
        })
      ).unwrap();

      toast.success(
        t("adminFaq.messages.created", "FAQ created successfully.")
      );

      // Reset form
      setQuestion({ en: "", tr: "", de: "" });
      setAnswer({ en: "", tr: "", de: "" });
      setCategory("");

      onSuccess?.();
    } catch {
      toast.error(
        t("adminFaq.messages.error", "Error occurred while creating FAQ.")
      );
    }
  };

  return (
    <Container>
      <Title>➕ {t("adminFaq.title.multi", "New FAQ (Multi-language)")}</Title>

      <CardGrid>
        {(Object.keys(languageLabels) as LangCode[]).map((lang) => (
          <LangCard key={lang}>
            <LangHeader>
              {languageLabels[lang]}{" "}
              {question[lang].trim() && answer[lang].trim() && (
                <CheckMark>✓</CheckMark>
              )}
            </LangHeader>

            <Label>{t("adminFaq.form.question", "Question")}</Label>
            <Input
              value={question[lang]}
              onChange={(e) =>
                setQuestion({ ...question, [lang]: e.target.value })
              }
            />

            <Label>{t("adminFaq.form.answer", "Answer")}</Label>
            <TextArea
              rows={3}
              value={answer[lang]}
              onChange={(e) => setAnswer({ ...answer, [lang]: e.target.value })}
            />
          </LangCard>
        ))}
      </CardGrid>

      <Label>{t("adminFaq.form.category", "Category")}</Label>
      <Input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder={t(
          "adminFaq.form.categoryPlaceholder",
          "e.g., Shipping, Returns"
        )}
      />

      <SubmitButton disabled={!isComplete} onClick={handleSubmit}>
        {t("common.create", "Create")}
      </SubmitButton>
    </Container>
  );
}

// 💅 Styled Components (değişmedi)
const Container = styled.div`
  margin-top: 2rem;
`;

const Title = styled.h3`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const CardGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  margin-bottom: 2rem;
`;

const LangCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: 1.2rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const LangHeader = styled.div`
  font-weight: 600;
  margin-bottom: 0.8rem;
`;

const CheckMark = styled.span`
  color: ${({ theme }) => theme.colors.success};
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
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  resize: vertical;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
`;

const SubmitButton = styled.button<{ disabled?: boolean }>`
  padding: 10px 18px;
  background: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.success};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-weight: 600;

  &:hover {
    opacity: ${({ disabled }) => (disabled ? 1 : 0.9)};
  }
`;
