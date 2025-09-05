"use client";

import styled from "styled-components";
import { useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/comment/locales";
import { useAppDispatch } from "@/store/hooks";
import { replyToComment } from "@/modules/comment/slice/slice";
import type { IComment } from "@/modules/comment/types";
import type { SupportedLocale } from "@/types/common";

type TL = Partial<Record<SupportedLocale, string>>;

const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase() as SupportedLocale;
  return (two || "tr") as SupportedLocale;
};

export default function ReplyForm({
  comment,
  onClose,
}: {
  comment: IComment;
  onClose: () => void;
}) {
  const { t, i18n } = useI18nNamespace("comment", translations);
  const dispatch = useAppDispatch();
  const lang = useMemo<SupportedLocale>(
    () => getUILang(i18n?.language),
    [i18n?.language]
  );

  const [text, setText] = useState<string>(
    () => (comment.reply?.text?.[lang] ?? "") as string
  );
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const nextTL: TL = { ...(comment.reply?.text || {}), [lang]: text };
      await dispatch(
        replyToComment({
          id: comment._id!,
          text: nextTL as Record<SupportedLocale, string>,
        })
      ).unwrap();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const user = typeof comment.userId === "object" ? comment.userId : undefined;
  const name = user?.name || comment.name || "-";
  const email = user?.email || comment.email || "-";
  const contentTitle =
    comment.contentId && typeof comment.contentId === "object"
      ? (comment.contentId as any).title || "-"
      : "-";

  return (
    <Form onSubmit={onSubmit}>
      <Header>
        <div>
          <H3>{t("details.replyTitle", "Yanıt Ver")}</H3>
          <Meta>
            <b>{name}</b> · {email} · {comment.contentType} · {contentTitle}
          </Meta>
        </div>
        <LangTag>{lang.toUpperCase()}</LangTag>
      </Header>

      <Field>
        <Label>
          {t("reply", "Yanıt")} ({lang.toUpperCase()})
        </Label>
        <TextArea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("details.replyPlaceholder", "Yanıtınızı yazın...")}
        />
      </Field>

      <Actions>
        <Secondary type="button" onClick={onClose}>
          {t("cancel", "İptal")}
        </Secondary>
        <Primary type="submit" disabled={saving || !text.trim()}>
          {saving ? t("sending", "Gönderiliyor...") : t("sendReply", "Yanıtla")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* styled */
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;
const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
`;
const H3 = styled.h3`
  margin: 0 0 2px 0;
`;
const Meta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const LangTag = styled.span`
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;
const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;
const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;
const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: flex-end;
`;
const Primary = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} transparent;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;
const Secondary = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;
