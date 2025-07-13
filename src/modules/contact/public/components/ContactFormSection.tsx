"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sendContactMessage, clearContactMessages } from "@/modules/contact/slice/contactSlice";

export default function ContactFormSection() {
  const { t } = useI18nNamespace("contact", translations);
  const dispatch = useAppDispatch();
  const { loading, error, successMessage } = useAppSelector((state) => state.contact);

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  useEffect(() => {
    if (successMessage) setForm({ name: "", email: "", subject: "", message: "" });
    return () => { dispatch(clearContactMessages()); };
  }, [successMessage, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(sendContactMessage(form));
  };

  return (
    <FormSection>
      <FormTitle>{t("form.title", "Contact Us")}</FormTitle>
      <Form onSubmit={handleSubmit} autoComplete="off">
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder={t("form.name", "Your Name")}
          required
          disabled={loading}
        />
        <Input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder={t("form.email", "Your Email")}
          type="email"
          required
          disabled={loading}
        />
        <Input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder={t("form.subject", "Subject")}
          required
          disabled={loading}
        />
        <TextArea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder={t("form.message", "Your Message")}
          rows={6}
          required
          disabled={loading}
        />
        <SubmitBtn type="submit" disabled={loading}>
          {loading ? t("form.sending", "Sending...") : t("form.send", "Send")}
        </SubmitBtn>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        {successMessage && <SuccessMsg>{successMessage}</SuccessMsg>}
      </Form>
    </FormSection>
  );
}

const FormSection = styled.section`
  padding: 28px 24px 40px 24px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 2px 16px rgba(0,0,0,0.05);
  margin-bottom: 36px;
`;

const FormTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 1.7rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

const SubmitBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.18s;
  &:hover { background: ${({ theme }) => theme.colors.primaryDark}; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const ErrorMsg = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 1rem;
  margin-top: 8px;
`;

const SuccessMsg = styled.div`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.success};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 24px;
  text-align: center;
  border-radius: 12px;
  margin-top: 20px;
`;
