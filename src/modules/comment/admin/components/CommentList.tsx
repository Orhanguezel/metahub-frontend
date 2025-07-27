"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCommentsForContent } from "@/modules/comment/slice/commentSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import styled from "styled-components";
import { motion } from "framer-motion";
import { MdPerson } from "react-icons/md";
import type { CommentContentType } from "@/modules/comment/types";

interface Props {
  contentId: string;
  contentType: CommentContentType;
}

export default function CommentList({ contentId, contentType }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("testimonial", translations3);
  const { comments, loading } = useAppSelector((state) => state.comments);

  useEffect(() => {
    if (contentId && contentType) {
      dispatch(fetchCommentsForContent({ id: contentId, type: contentType }));
    }
  }, [dispatch, contentId, contentType]);

  const publishedComments = Array.isArray(comments)
    ? comments.filter((c) => c.isPublished)
    : [];

  // --- Yorum yoksa hiçbir şey gösterme (isteğine göre) ---
  if (!loading && publishedComments.length === 0) return null;

  return (
    <ListWrapper>
      {publishedComments.map((c, index) => (
        <CommentCard
          key={c._id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <CardHeader>
            <PersonIcon>
              <MdPerson size={28} />
            </PersonIcon>
            <Name>
              {typeof c.userId === "object" && "name" in c.userId
                ? c.userId.name
                : c.name || t("anonymous", "Misafir")}
            </Name>
          </CardHeader>
          {c.label && <Label>{c.label}</Label>}
          <Text>{c.text}</Text>
        </CommentCard>
      ))}
    </ListWrapper>
  );
}

// --- Styled Components ---
const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
  margin-top: 2.2rem;
`;

const CommentCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 2px 12px rgba(40, 117, 194, 0.08);
  padding: 1.35rem 1.35rem 1.05rem 1.35rem;
  max-width: 530px;
  margin-left: 0;
  ${({ theme }) => theme.media.small} {
    max-width: 100vw;
    padding: 1rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.45rem;
`;

const PersonIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 50%;
  width: 38px;
  height: 38px;
  justify-content: center;
  font-size: 1.6rem;
`;

const Name = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.primaryDark};
  letter-spacing: 0.03em;
`;

const Label = styled.div`
  font-weight: 500;
  font-size: 1.04rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 0.35rem;
`;

const Text = styled.p`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.65;
  margin: 0;
`;
