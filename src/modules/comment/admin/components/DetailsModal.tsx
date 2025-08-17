"use client";
import styled from "styled-components";
import { useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import { useAppDispatch } from "@/store/hooks";
import { replyToComment } from "@/modules/comment/slice/commentSlice";
import { SupportedLocale, SUPPORTED_LOCALES } from "@/types/common";
import type { IComment } from "@/modules/comment/types";

export default function DetailsModal({ comment, onClose }: { comment: IComment; onClose: () => void }) {
  const { t } = useI18nNamespace("testimonial", translations3);
  const dispatch = useAppDispatch();

  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState<Record<SupportedLocale, string>>(
    SUPPORTED_LOCALES.reduce((acc, lng) => {
      acc[lng] = comment.reply?.text?.[lng] || "";
      return acc;
    }, {} as Record<SupportedLocale, string>)
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await dispatch(replyToComment({ id: comment._id!, text: reply })).unwrap();
      onClose();
    } finally {
      setSending(false);
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
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseX onClick={onClose}>×</CloseX>
        <h2 style={{ marginTop: 0 }}>{t("details.title", "Yorum Detayları")}</h2>

        <p><b>{t("name", "Ad")}:</b> {name}</p>
        <p><b>{t("email", "E-posta")}:</b> {email}</p>
        <p><b>{t("contentType", "İçerik Türü")}:</b> {comment.contentType}</p>
        <p><b>{t("contentTitle", "İçerik Başlığı")}:</b> {contentTitle}</p>
        <p><b>{t("status", "Durum")}:</b> {comment.isPublished ? t("published", "Yayınlandı") : t("unpublished", "Yayınlanmadı")}</p>
        <p><b>{t("date", "Tarih")}:</b> {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "-"}</p>

        <Divider />

        <p><b>{t("label", "Başlık")}:</b> {comment.label || "-"}</p>
        <p><b>{t("text", "İçerik")}:</b><br />{comment.text || "-"}</p>

        <Divider />

        <h3 style={{ marginTop: 0 }}>{t("details.replyTitle", "Yanıt Ver")}</h3>
        <form onSubmit={onSubmit}>
          {SUPPORTED_LOCALES.map((lng) => (
            <div key={lng} style={{ marginBottom: 8 }}>
              <SmallLabel>{lng.toUpperCase()}</SmallLabel>
              <TextArea
                rows={3}
                value={reply[lng]}
                onChange={(e) => setReply({ ...reply, [lng]: e.target.value })}
              />
            </div>
          ))}
          <PrimaryBtn type="submit" disabled={sending}>
            {sending ? t("sending", "Gönderiliyor...") : t("sendReply", "Yanıtla")}
          </PrimaryBtn>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}

/* Modal styled (same admin pattern) */
const ModalOverlay = styled.div`
  position:fixed; inset:0; background:${({ theme }) => theme.colors.overlayBackground};
  z-index:${({ theme }) => theme.zIndex.modal}; display:flex; justify-content:center; align-items:flex-start;
`;
const ModalContent = styled.div`
  width:600px; background:${({ theme }) => theme.colors.cardBackground};
  border-radius:${({ theme }) => theme.radii.xl}; margin:${({ theme }) => theme.spacings.xl} 0 0 0;
  padding:${({ theme }) => theme.spacings.lg}; box-shadow:${({ theme }) => theme.shadows.lg};
  position:relative; display:flex; flex-direction:column; min-height:320px; font-size:${({ theme }) => theme.fontSizes.md};
  ${({ theme }) => theme.media.mobile}{ width:90vw; }
`;
const CloseX = styled.button`
  position:absolute; top:12px; right:18px; font-size:${({ theme }) => theme.fontSizes.large};
  background:none; border:none; color:${({ theme }) => theme.colors.textSecondary};
  cursor:pointer; &:hover{ color:${({ theme }) => theme.colors.darkGrey}; }
`;
const Divider = styled.hr`
  border:none; border-top:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  margin:${({ theme }) => theme.spacings.md} 0;
`;
const SmallLabel = styled.div`
  font-size:${({ theme }) => theme.fontSizes.xsmall};
  color:${({ theme }) => theme.colors.textSecondary};
  margin-bottom:4px;
`;
const TextArea = styled.textarea`
  width:100%; padding:10px 12px; border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background:${({ theme }) => theme.inputs.background}; color:${({ theme }) => theme.inputs.text};
`;
const PrimaryBtn = styled.button`
  margin-top:${({ theme }) => theme.spacings.sm};
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  border:${({ theme }) => theme.borders.thin} transparent;
  padding:8px 12px; border-radius:${({ theme }) => theme.radii.md}; cursor:pointer;
  &:disabled{ opacity:${({ theme }) => theme.opacity.disabled}; cursor:not-allowed; }
`;
