"use client";

import { useEffect, useMemo } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  MdPerson,
  MdStar,
  MdStarBorder,
  MdAdminPanelSettings,
} from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCommentsForContent } from "@/modules/comment/slice/slice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/comment/locales";
import type { CommentContentType } from "@/modules/comment/types";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";

type Props = { contentId: string; contentType: CommentContentType };

const getUILang = (lng?: string): SupportedLocale =>
  (lng || "").slice(0, 2).toLowerCase() as SupportedLocale;

const pickLocalized = (
  reply: { text?: Partial<Record<SupportedLocale, string>> } | undefined,
  pref: SupportedLocale
) => {
  const txt = reply?.text?.[pref];
  if (txt && txt.trim()) return txt;
  for (const lng of SUPPORTED_LOCALES) {
    const t = reply?.text?.[lng];
    if (t && t.trim()) return t;
  }
  return null;
};

export default function CommentList({ contentId, contentType }: Props) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useI18nNamespace("comment", translations);
  const { comments, loading } = useAppSelector((s) => s.comments);

  useEffect(() => {
    if (contentId && contentType) {
      dispatch(fetchCommentsForContent({ id: contentId, type: contentType }));
    }
  }, [dispatch, contentId, contentType]);

  const uiLang = useMemo<SupportedLocale>(
    () => getUILang(i18n?.language),
    [i18n?.language]
  );

  const published = Array.isArray(comments)
    ? comments.filter((c) => c.isPublished)
    : [];
  if (!loading && published.length === 0) return null;

  return (
    <ListWrap>
      {published.map((c, i) => {
        const name =
          typeof c.userId === "object" && "name" in (c.userId as any)
            ? (c.userId as any).name
            : c.name || t("anonymous", "Misafir");

        // ✅ admin yanıtını aktif dil + fallback ile al
        const replyText = pickLocalized(c.reply, uiLang);
        const replyDate =
          typeof c.reply?.createdAt === "string"
            ? new Date(c.reply.createdAt)
            : undefined;

        return (
          <Card
            key={c._id}
            as={motion.div}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <CardHeader>
              <PersonIcon>
                <MdPerson size={22} />
              </PersonIcon>
              <HdrTexts>
                <Name>{name}</Name>
                {typeof c.createdAt === "string" && (
                  <Meta>{new Date(c.createdAt).toLocaleString()}</Meta>
                )}
              </HdrTexts>
            </CardHeader>

            {/* Rating (güvenli) */}
            {typeof c.rating === "number" && c.rating > 0 && (
              <StarsRow aria-label={t("rating", "Değerlendirme")}>
                {[1, 2, 3, 4, 5].map((n) =>
                  (c.rating as number) >= n ? (
                    <MdStar key={n} size={18} />
                  ) : (
                    <MdStarBorder key={n} size={18} />
                  )
                )}
                <RatingValue>{c.rating}/5</RatingValue>
              </StarsRow>
            )}

            {c.label && <Label>{c.label}</Label>}
            <Text>{c.text}</Text>

            {/* ✅ Admin Yanıtı (kullanıcıya görünen) */}
            {replyText && (
              <ReplyBlock
                role="note"
                aria-label={t("details.adminReply", "Yönetici Yanıtı")}
              >
                <ReplyHeader>
                  <ReplyIcon>
                    <MdAdminPanelSettings size={18} />
                  </ReplyIcon>
                  <ReplyTitle>
                    {t("details.adminReply", "Yönetici Yanıtı")}
                  </ReplyTitle>
                  {replyDate && (
                    <ReplyMeta>· {replyDate.toLocaleString()}</ReplyMeta>
                  )}
                </ReplyHeader>
                <ReplyText>{replyText}</ReplyText>
              </ReplyBlock>
            )}
          </Card>
        );
      })}
    </ListWrap>
  );
}

/* styled */
const ListWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
  margin-top: ${({ theme }) => theme.spacings.md};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
  max-width: 640px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

const PersonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.primary};
`;

const HdrTexts = styled.div`
  display: flex;
  flex-direction: column;
`;
const Name = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.title};
`;
const Meta = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Label = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
  margin: 4px 0;
`;
const Text = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.65;
`;

const StarsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 2px 0 6px 0;
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
const RatingValue = styled.span`
  margin-left: 4px;
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* ---- Admin Reply ---- */
const ReplyBlock = styled.section`
  margin-top: ${({ theme }) => theme.spacings.sm};
  padding: ${({ theme }) => theme.spacings.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.borderHighlight};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const ReplyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const ReplyIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
`;
const ReplyTitle = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;
const ReplyMeta = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const ReplyText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;
