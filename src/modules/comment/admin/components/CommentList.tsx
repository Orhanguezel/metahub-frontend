"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCommentsForContent } from "@/modules/comment/slice/commentSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import styled from "styled-components";
import { motion } from "framer-motion";
import type { CommentContentType } from "@/modules/comment/types"; // ✅

interface Props {
  contentId: string;
  contentType: CommentContentType; // ✅
}

export default function CommentList({ contentId, contentType }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("comment", translations3);

  const { comments, loading } = useAppSelector((state) => state.comments);

  useEffect(() => {
    if (contentId && contentType) {
      dispatch(fetchCommentsForContent({ id: contentId, type: contentType }));
    }
  }, [dispatch, contentId, contentType]);

  // Sadece yayınlanmış yorumlar (backend'den zaten filtreli gelir)
  const publishedComments = Array.isArray(comments)
    ? comments.filter((c) => c.isPublished)
    : [];

  if (loading) return <p>{t("loading", "Yükleniyor...")}</p>;
  if (!publishedComments.length) return <p>{t("noComments", "Henüz yorum yok.")}</p>;

  return (
    <ListWrapper>
      {publishedComments.map((c, index) => (
        <CommentCard
          key={c._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Header>
            <Name>{typeof c.userId === "object" && "name" in c.userId ? c.userId.name : c.name || "Anonymous"}</Name>
            {/* <Stars>{"★".repeat(5)}</Stars> */}
          </Header>
          {/* Eğer başlık varsa göster */}
          {c.label && <Label>{c.label}</Label>}
          <Text>{c.text || t("noText", "Yorum yok.")}</Text>
        </CommentCard>
      ))}
    </ListWrapper>
  );
}

// --- Styled Components ---
const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 2rem;
`;

const CommentCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 10px;
  border: 1px solid #eaeaea;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Name = styled.span`
  font-weight: 600;
  font-size: 1rem;
`;

const Label = styled.div`
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.4rem;
`;

const Text = styled.p`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
  font-size: 0.95rem;
`;
