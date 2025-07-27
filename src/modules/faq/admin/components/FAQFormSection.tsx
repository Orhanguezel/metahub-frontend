"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/faq/locales";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/hooks";
import {
  SUPPORTED_LOCALES,
  SupportedLocale,
  LANG_LABELS,
} from "@/types/common";
import type { IFaq } from "@/modules/faq/types";

interface Props {
  editingItem: IFaq | null;
  onSubmit: (data: IFaq) => void;
}

export default function FAQFormSection({ editingItem, onSubmit }: Props) {
  const { t } = useI18nNamespace("faq", translations);
  const successMessage = useAppSelector((s) => s.faq.successMessage);
  const error = useAppSelector((s) => s.faq.error);

  const emptyField = SUPPORTED_LOCALES.reduce(
    (acc, lng) => ({ ...acc, [lng]: "" }),
    {} as Record<SupportedLocale, string>
  );

  const [question, setQuestion] = useState(emptyField);
  const [answer, setAnswer] = useState(emptyField);
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (editingItem) {
      setQuestion({ ...emptyField, ...editingItem.question });
      setAnswer({ ...emptyField, ...editingItem.answer });
      setCategory(editingItem.category || "");
    } else {
      setQuestion(emptyField);
      setAnswer(emptyField);
      setCategory("");
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingItem]);

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
  }, [successMessage, error]);

  const hasAtLeastOneLang = (obj: Record<SupportedLocale, string>) =>
    Object.values(obj).some((val) => val.trim() !== "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasAtLeastOneLang(question) || !hasAtLeastOneLang(answer)) {
      toast.error(
        t(
          "adminFaq.form.required",
          "Please fill in at least one language for question and answer."
        )
      );
      return;
    }

    const now = new Date();
    const newFAQ: IFaq = {
      _id: editingItem?._id,
      question,
      answer,
      category,
      isPublished: true,
      isActive: true,
      createdAt: editingItem?.createdAt || now,
      updatedAt: now,
    };

    onSubmit(newFAQ);
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <h2>
        {editingItem
          ? t("adminFaq.form.titleEdit", "Edit FAQ")
          : t("adminFaq.form.titleCreate", "Create FAQ")}
      </h2>

      {SUPPORTED_LOCALES.map((lng) => (
        <div key={lng}>
          <LangHeader>{LANG_LABELS[lng]}</LangHeader>

          <label>
            {t("adminFaq.form.question", "Question")}
            <input
              type="text"
              value={question[lng]}
              onChange={(e) =>
                setQuestion({ ...question, [lng]: e.target.value })
              }
            />
          </label>

          <label>
            {t("adminFaq.form.answer", "Answer")}
            <textarea
              rows={3}
              value={answer[lng]}
              onChange={(e) =>
                setAnswer({ ...answer, [lng]: e.target.value })
              }
            />
          </label>
        </div>
      ))}

      <label>
        {t("adminFaq.form.category", "Category")}
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </label>

      <ButtonGroup>
        <button type="submit">
          {editingItem ? t("common.update", "Update") : t("common.create", "Create")}
        </button>
      </ButtonGroup>
    </FormWrapper>
  );
}

// 💅 STYLES
const FormWrapper = styled.form`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  h2 {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin: 1rem 0 0.5rem;
    font-weight: 600;

    input,
    textarea {
      width: 100%;
      padding: 0.6rem;
      margin-top: 0.25rem;
      border-radius: 6px;
      background: ${({ theme }) => theme.colors.inputBackground};
      border: 1px solid ${({ theme }) => theme.colors.border};
      color: ${({ theme }) => theme.colors.text};
    }
  }

  textarea {
    resize: vertical;
  }
`;

const LangHeader = styled.h4`
  margin-top: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const ButtonGroup = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;

  button {
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    background: ${({ theme }) => theme.colors.success};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.radii.sm};
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
  }
`;
