"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCommentsForContent } from "@/modules/comment/slice/commentSlice";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { motion } from "framer-motion";

interface Props {
  contentId: string;
  contentType:
    | "news"
    | "blog"
    | "activity"
    | "news"
    | "blog"
    | "radonarprod"
    | "customProduct"
    | "product"
    | "bike"
    | "articles"
    | "services"
    | "about"
    | "library"
    | "product"
    | "references"
    | "company"

}

export default function CommentList({ contentId, contentType }: Props) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("comments");
  const lang = (i18n.language as "tr" | "en" | "de") || "en";
  const { comments, loading } = useAppSelector((state) => state.comments);

  useEffect(() => {
    if (contentId && contentType) {
      dispatch(fetchCommentsForContent({ id: contentId, type: contentType }));
    }
  }, [dispatch, contentId, contentType]);

  const publishedComments = Array.isArray(comments)
    ? comments.filter((c) => c.isPublished)
    : [];

  if (loading) return <p>{t("loading")}</p>;
  if (publishedComments.length === 0) return <p>{t("noComments")}</p>;

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
            <Name>{c.name || "Anonymous"}</Name>
            {c.rating && <Stars>{"★".repeat(c.rating)}</Stars>}
          </Header>
          <Text>{c.label?.[lang] || t("noText")}</Text>
        </CommentCard>
      ))}
    </ListWrapper>
  );
}

// ✨ Styled Components
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

const Stars = styled.span`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 1.1rem;
`;

const Text = styled.p`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
  font-size: 0.95rem;
`;
