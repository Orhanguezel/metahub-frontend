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
import { MdSend } from "react-icons/md";
import type { CommentContentType } from "@/modules/comment/types";

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
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

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
    setTouched(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3200);
  };

  return (
    <FormCard
      as={motion.form}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.37, 0, 0.63, 1] }}
      autoComplete="off"
    >
      <Row>
        <FloatField>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder=" "
            autoComplete="off"
            spellCheck="false"
          />
          <label>{t("yourName", "Adınız")}</label>
        </FloatField>
        <FloatField>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder=" "
            autoComplete="off"
            spellCheck="false"
          />
          <label>{t("yourEmail", "E-posta Adresiniz")}</label>
        </FloatField>
      </Row>
      <FloatField $full>
        <textarea
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder=" "
          rows={4}
        />
        <label>{t("writeComment", "Yorumunuzu yazın")}</label>
        {touched && !form.comment.trim() && (
          <ErrorMsg>{t("commentRequired", "Yorum gereklidir.")}</ErrorMsg>
        )}
      </FloatField>
      <SubmitButton
        type="submit"
        whileTap={{ scale: 0.96 }}
        disabled={!form.comment.trim()}
      >
        <MdSend size={22} style={{ marginRight: 8, marginBottom: -3 }} />
        {t("submit", "Gönder")}
      </SubmitButton>
      {success && (
        <SuccessBox>
          {t("commentSuccess", "Yorumunuz gönderildi! Onaylandıktan sonra görünecek.")}
        </SuccessBox>
      )}
    </FormCard>
  );
}

// --- Styles ---

const FormCard = styled.form`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 32px rgba(40, 117, 194, 0.08);
  padding: 2.3rem 2.2rem 2.2rem 2.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 550px;
  margin: 2rem auto 0 auto;

  @media (max-width: 700px) {
    padding: 1.1rem;
    max-width: 100vw;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 1.4rem;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 0.8rem;
  }
`;

const FloatField = styled.div<{ $full?: boolean }>`
  flex: ${({ $full }) => ($full ? "1 1 100%" : "1 1 48%")};
  position: relative;
  display: flex;
  flex-direction: column;

  input, textarea {
    border: 1.5px solid ${({ theme }) => theme.colors.inputBorder};
    border-radius: 9px;
    font-size: 1.05rem;
    font-family: ${({ theme }) => theme.fonts.body};
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
    padding: 1.05rem 1.05rem 1.05rem 0.95rem;
    outline: none;
    transition: border-color 0.17s, background 0.2s;
    width: 100%;

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    }
    &:not(:placeholder-shown) + label,
    &:focus + label {
      top: 0.21rem;
      left: 1rem;
      font-size: 0.84rem;
      color: ${({ theme }) => theme.colors.primary};
      background: ${({ theme }) => theme.colors.cardBackground};
      padding: 0 0.15em;
      opacity: 1;
    }
  }

  textarea {
    resize: vertical;
    min-height: 82px;
    max-height: 260px;
  }

  label {
    position: absolute;
    left: 1.15rem;
    top: 1.25rem;
    font-size: 1rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textSecondary};
    pointer-events: none;
    background: transparent;
    transition: 0.16s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0.88;
  }
`;

const ErrorMsg = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.93rem;
  margin-top: 0.35rem;
  font-weight: 500;
  margin-left: 2px;
`;

const SubmitButton = styled(motion.button)`
  margin-top: 1rem;
  padding: 0.97rem 2.2rem 0.97rem 1.25rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: bold;
  font-size: 1.13rem;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background 0.18s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const SuccessBox = styled.div`
  margin-top: 1.2rem;
  background: ${({ theme }) => theme.colors.successBg};
  color: ${({ theme }) => theme.colors.success};
  border-radius: 8px;
  padding: 0.85rem 1.15rem;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 2px 14px rgba(40, 199, 111, 0.10);
`;

