"use client";

import { useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import {
  createComment,
  fetchCommentsForContent,
} from "@/modules/comment/slice/commentSlice";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { motion } from "framer-motion";
import type { CommentContentType } from "@/modules/comment/types"; // ✅

interface Props {
  contentId: string;
  contentType: CommentContentType;
}

export default function CommentForm({ contentId, contentType }: Props) {
  const { t } = useI18nNamespace("testimonial", translations3);

  const dispatch = useAppDispatch();
  const executeRecaptcha = useRecaptcha();

  const [form, setForm] = useState({
    name: "",
    email: "",
    comment: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comment.trim()) return;

    const token = await executeRecaptcha("create_comment");
    if (!token) {
      alert(t("captchaError", "reCAPTCHA validation failed."));
      return;
    }

    await dispatch(
      createComment({
        comment: form.comment,
        contentType,
        contentId,
        name: form.name || "Anonymous",
        email: form.email || "anonymous@example.com",
        recaptchaToken: token,
      })
    );

    await dispatch(
      fetchCommentsForContent({ id: contentId, type: contentType })
    );

    setForm({ name: "", email: "", comment: "" });
  };

  return (
    <StyledForm
      onSubmit={handleSubmit}
      as={motion.form}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Field>
        <label>{t("yourName", "Adınız")}</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder={t("yourName", "Adınız")}
        />
      </Field>

      <Field>
        <label>{t("yourEmail", "E-posta Adresiniz")}</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder={t("yourEmail", "E-posta Adresiniz")}
        />
      </Field>

      <Field>
        <label>{t("writeComment", "Yorumunuzu yazın")}</label>
        <textarea
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder={t("writeComment", "Yorumunuzu yazın")}
          rows={4}
        />
      </Field>

      <SubmitButton type="submit" whileTap={{ scale: 0.96 }}>
        {t("submit", "Gönder")}
      </SubmitButton>
    </StyledForm>
  );
}

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  label {
    font-weight: 600;
    margin-bottom: 0.4rem;
  }

  input,
  textarea {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    background: #fff;
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;
