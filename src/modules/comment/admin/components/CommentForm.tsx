"use client";

import { useState } from "react";
import styled from "styled-components";
import { MdSend } from "react-icons/md";
import { motion } from "framer-motion";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import { useAppDispatch } from "@/store/hooks";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { createComment, fetchCommentsForContent } from "@/modules/comment/slice/commentSlice";
import type { CommentContentType } from "@/modules/comment/types";

type Props = { contentId: string; contentType: CommentContentType };

export default function CommentForm({ contentId, contentType }: Props) {
  const { t } = useI18nNamespace("testimonial", translations3);
  const dispatch = useAppDispatch();
  const executeRecaptcha = useRecaptcha();

  const [form, setForm] = useState({ name: "", email: "", comment: "" });
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setTouched(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
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
    await dispatch(fetchCommentsForContent({ id: contentId, type: contentType }));

    setForm({ name: "", email: "", comment: "" });
    setTouched(false);
    setSuccess(true);
    window.setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card as={motion.form} onSubmit={onSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Row>
        <Col>
          <Label>{t("yourName", "Adınız")}</Label>
          <Input name="name" value={form.name} onChange={onChange} />
        </Col>
        <Col>
          <Label>{t("yourEmail", "E-posta Adresiniz")}</Label>
          <Input name="email" type="email" value={form.email} onChange={onChange} />
        </Col>
      </Row>

      <Col>
        <Label>{t("writeComment", "Yorumunuzu yazın")}</Label>
        <TextArea name="comment" rows={4} value={form.comment} onChange={onChange} />
        {touched && !form.comment.trim() && <ErrorMsg>{t("commentRequired", "Yorum gereklidir.")}</ErrorMsg>}
      </Col>

      <Actions>
        <Primary type="submit" disabled={!form.comment.trim()}>
          <MdSend size={20} style={{ marginRight: 8 }} />
          {t("submit", "Gönder")}
        </Primary>
      </Actions>

      {success && <Success>{t("commentSuccess", "Yorumunuz gönderildi! Onaylandıktan sonra görünecek.")}</Success>}
    </Card>
  );
}

/* styled (site genel form paternine yakın) */
const Card = styled.form`
  background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius:${({ theme }) => theme.radii.lg};
  box-shadow:${({ theme }) => theme.cards.shadow};
  padding:${({ theme }) => theme.spacings.lg};
  display:flex; flex-direction:column; gap:${({ theme }) => theme.spacings.md};
  max-width:640px; margin:0 auto;
`;
const Row = styled.div`
  display:grid; grid-template-columns:1fr 1fr; gap:${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.small}{ grid-template-columns:1fr; }
`;
const Col = styled.div`display:flex; flex-direction:column; gap:${({ theme }) => theme.spacings.xs};`;
const Label = styled.label`font-size:${({ theme }) => theme.fontSizes.xsmall}; color:${({ theme }) => theme.colors.textSecondary};`;
const Input = styled.input`
  padding:10px 12px; border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background:${({ theme }) => theme.inputs.background}; color:${({ theme }) => theme.inputs.text};
`;
const TextArea = styled.textarea`
  padding:10px 12px; border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background:${({ theme }) => theme.inputs.background}; color:${({ theme }) => theme.inputs.text};
  resize:vertical;
`;
const Actions = styled.div`display:flex; justify-content:flex-end;`;
const Primary = styled.button`
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  border:${({ theme }) => theme.borders.thin} transparent;
  padding:10px 14px; border-radius:${({ theme }) => theme.radii.md}; cursor:pointer;
  &:disabled{ opacity:${({ theme }) => theme.opacity.disabled}; cursor:not-allowed; }
`;
const ErrorMsg = styled.div`color:${({ theme }) => theme.colors.danger}; font-size:${({ theme }) => theme.fontSizes.sm};`;
const Success = styled.div`
  margin-top:${({ theme }) => theme.spacings.xs};
  background:${({ theme }) => theme.colors.successBg};
  color:${({ theme }) => theme.colors.success};
  border-radius:${({ theme }) => theme.radii.md};
  padding:${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  text-align:center; font-weight:${({ theme }) => theme.fontWeights.semiBold};
`;
