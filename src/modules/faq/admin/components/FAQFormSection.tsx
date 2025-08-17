"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/faq/locales";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/hooks";
import { SUPPORTED_LOCALES, SupportedLocale, LANG_LABELS } from "@/types/common";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        t("adminFaq.form.required", "Please fill in at least one language for question and answer.")
      );
      return;
    }

    const now = new Date();
    const payload: IFaq = {
      _id: editingItem?._id,
      question,
      answer,
      category,
      isPublished: editingItem?.isPublished ?? true,
      isActive: editingItem?.isActive ?? true,
      createdAt: editingItem?.createdAt || now,
      updatedAt: now,
    };

    onSubmit(payload);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>{editingItem ? t("adminFaq.form.titleEdit", "Edit FAQ") : t("adminFaq.form.titleCreate", "Create FAQ")}</h2>

      {SUPPORTED_LOCALES.map((lng) => (
        <LangBlock key={lng}>
          <LangHeader>{LANG_LABELS[lng]}</LangHeader>

          <Label htmlFor={`q-${lng}`}>{t("adminFaq.form.question", "Question")}</Label>
          <Input
            id={`q-${lng}`}
            type="text"
            value={question[lng]}
            onChange={(e) => setQuestion({ ...question, [lng]: e.target.value })}
          />

          <Label htmlFor={`a-${lng}`}>{t("adminFaq.form.answer", "Answer")}</Label>
          <TextArea
            id={`a-${lng}`}
            rows={3}
            value={answer[lng]}
            onChange={(e) => setAnswer({ ...answer, [lng]: e.target.value })}
          />
        </LangBlock>
      ))}

      <Label htmlFor="faq-category">{t("adminFaq.form.category", "Category")}</Label>
      <Input
        id="faq-category"
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <Actions>
        <Primary type="submit">
          {editingItem ? t("common.update", "Update") : t("common.create", "Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled (admin form pattern) ---- */
const Form = styled.form`
  max-width: 900px;
  margin: 0 auto;
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};
`;

const LangBlock = styled.div`
  padding:${({theme})=>theme.spacings.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.colors.cardBackground};
`;

const LangHeader = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;

const Label = styled.label`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
  display:block; margin:${({theme})=>theme.spacings.xs} 0;
`;

const Input = styled.input`
  width:100%;
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;

const TextArea = styled.textarea`
  width:100%;
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  resize:vertical;
`;

const Actions = styled.div`
  display:flex;justify-content:flex-end;gap:${({theme})=>theme.spacings.xs};
`;

const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} transparent;
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;
