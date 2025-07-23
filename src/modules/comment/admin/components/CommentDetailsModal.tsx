"use client";

import { useState } from "react";
import { IComment } from "@/modules/comment/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import { Modal } from "@/shared";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import { replyToComment } from "@/modules/comment/slice/commentSlice";
import { SupportedLocale, SUPPORTED_LOCALES } from "@/types/common";

interface Props {
  comment: IComment;
  lang: SupportedLocale;
  onClose: () => void;
}

export default function CommentDetailsModal({ comment, onClose }: Props) {
  const { t } = useI18nNamespace("comment", translations3);
  const dispatch = useAppDispatch();

  // --- Dinamik reply state: Mevcut tüm desteklenen diller için doldur ---
  const [reply, setReply] = useState<Record<SupportedLocale, string>>(
    () =>
      SUPPORTED_LOCALES.reduce((acc, lng) => {
        acc[lng] = comment.reply?.text?.[lng] || "";
        return acc;
      }, {} as Record<SupportedLocale, string>)
  );

  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      await dispatch(replyToComment({ id: comment._id!, text: reply })).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to reply:", err);
    } finally {
      setSending(false);
    }
  };

  // --- User ve Content Title tek dil (string) ---
  const user =
    comment.userId && typeof comment.userId === "object"
      ? comment.userId
      : undefined;
  const name = user?.name || comment.name || "-";
  const email = user?.email || comment.email || "-";
  const contentTitle =
    comment.contentId && typeof comment.contentId === "object"
      ? comment.contentId.title || "-"
      : "-";

  return (
    <Modal isOpen={!!comment} onClose={onClose}>
      <ContentWrapper>
        <h2>{t("details.title", "Yorum Detayları")}</h2>

        <Row>
          <strong>{t("name", "Ad")}</strong>: {name}
        </Row>
        <Row>
          <strong>{t("email", "E-posta")}</strong>: {email}
        </Row>
        <Row>
          <strong>{t("contentType", "İçerik Türü")}:</strong> {comment.contentType}
        </Row>
        <Row>
          <strong>{t("contentTitle", "İçerik Başlığı")}:</strong> {contentTitle}
        </Row>
        <Row>
          <strong>{t("status", "Durum")}:</strong>{" "}
          {comment.isPublished ? t("published", "Yayınlandı") : t("unpublished", "Yayınlanmadı")}
        </Row>
        <Row>
          <strong>{t("date")}:</strong>{" "}
          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "-"}
        </Row>

        <Divider />

        {/* --- YORUM BAŞLIĞI VE İÇERİĞİ TEK DİLDE --- */}
        <Row>
          <strong>{t("label", "Başlık")}:</strong>: {comment.label || "-"}
        </Row>
        <Row>
          <strong>{t("text", "İçerik")}:</strong>: {comment.text || "-"}
        </Row>

        <Divider />

        <h3>{t("details.replyTitle", "Yanıt Ver")}</h3>

        <form onSubmit={handleSubmit}>
          {SUPPORTED_LOCALES.map((lng) => (
            <ReplyField
              key={lng}
              placeholder={lng.toUpperCase()}
              value={reply[lng]}
              onChange={(e) =>
                setReply({ ...reply, [lng]: e.target.value })
              }
            />
          ))}
          <SubmitButton type="submit" disabled={sending}>
            {sending ? t("sending", "Gönderiliyor...") : t("sendReply", "Yanıtla")}
          </SubmitButton>
        </form>
      </ContentWrapper>
    </Modal>
  );
}

// ✅ Styled Components
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h2 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Row = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.base};

  strong {
    margin-right: 0.5rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: 1rem 0;
`;

const ReplyField = styled.textarea`
  width: 100%;
  min-height: 60px;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  font-size: ${({ theme }) => theme.fontSizes.base};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SubmitButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start;

  &:disabled {
    background: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;
