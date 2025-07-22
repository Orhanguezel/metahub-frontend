"use client";

import { useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/comment";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import {
  createComment,
  fetchCommentsForContent,
} from "@/modules/comment/slice/commentSlice";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { motion } from "framer-motion";

interface Props {
  contentId: string;
  contentType:
    | "news"
    | "blog"
    | "activity"
    | "news"
    | "blog"
    | "customProduct"
    | "products"
    | "bikes"
    | "articles"
    | "services"
    | "about"
    | "library"
    | "products"
    | "references"
    | "company"
    | "ensotekprod"
    | "sparepart";
  // contentType: "news" | "blog" | "products" | "radonarprod" | "bikes" | "articles" | "services" | "about" | "customProduct" | "references" | "library" | "faq" | "contact" | "company" | "tenant";
}

export default function CommentForm({ contentId, contentType }: Props) {
  const { t } = useI18nNamespace("comment", translations);

  const dispatch = useAppDispatch();
  const executeRecaptcha = useRecaptcha();

  const [form, setForm] = useState({
    name: "",
    email: "",
    comment: "",
    rating: 0,
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
        rating: form.rating,
        recaptchaToken: token,
      })
    );

    await dispatch(
      fetchCommentsForContent({ id: contentId, type: contentType })
    );

    setForm({ name: "", email: "", comment: "", rating: 0 });
  };

  return (
    <StyledForm
      onSubmit={handleSubmit}
      as={motion.form}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Field>
        <label>{t("yourName")}</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder={t("yourName")}
        />
      </Field>

      <Field>
        <label>{t("yourEmail")}</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder={t("yourEmail")}
        />
      </Field>

      <Field>
        <label>{t("rating")}</label>
        <StarWrapper>
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              onClick={() => setForm({ ...form, rating: value })}
              $active={value <= form.rating}
            >
              ★
            </Star>
          ))}
        </StarWrapper>
      </Field>

      <Field>
        <label>{t("writeComment")}</label>
        <textarea
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder={t("writeComment")}
          rows={4}
        />
      </Field>

      <SubmitButton type="submit" whileTap={{ scale: 0.96 }}>
        {t("submit")}
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

const StarWrapper = styled.div`
  display: flex;
  gap: 6px;
`;

const Star = styled.span<{ $active: boolean }>`
  cursor: pointer;
  font-size: 1.6rem;
  color: ${({ $active, theme }) => ($active ? theme.colors.warning : "#ccc")};
  transition: color 0.2s;
  &:hover {
    color: ${({ theme }) => theme.colors.warning};
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
