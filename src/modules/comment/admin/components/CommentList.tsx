"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { MdPerson } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCommentsForContent } from "@/modules/comment/slice/commentSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";
import type { CommentContentType } from "@/modules/comment/types";

type Props = { contentId: string; contentType: CommentContentType };

export default function CommentList({ contentId, contentType }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("testimonial", translations3);
  const { comments, loading } = useAppSelector((s) => s.comments);

  useEffect(() => {
    if (contentId && contentType) {
      dispatch(fetchCommentsForContent({ id: contentId, type: contentType }));
    }
  }, [dispatch, contentId, contentType]);

  const published = Array.isArray(comments) ? comments.filter((c) => c.isPublished) : [];
  if (!loading && published.length === 0) return null;

  return (
    <ListWrap>
      {published.map((c, i) => (
        <Card key={c._id} as={motion.div} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <CardHeader>
            <PersonIcon><MdPerson size={22} /></PersonIcon>
            <Name>
              {typeof c.userId === "object" && "name" in c.userId ? (c.userId as any).name : c.name || t("anonymous", "Misafir")}
            </Name>
          </CardHeader>
          {c.label && <Label>{c.label}</Label>}
          <Text>{c.text}</Text>
        </Card>
      ))}
    </ListWrap>
  );
}

/* styled */
const ListWrap = styled.div`display:flex; flex-direction:column; gap:${({ theme }) => theme.spacings.md}; margin-top:${({ theme }) => theme.spacings.md};`;
const Card = styled.div`
  background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius:${({ theme }) => theme.radii.lg};
  box-shadow:${({ theme }) => theme.cards.shadow};
  padding:${({ theme }) => theme.spacings.md};
  max-width:640px;
`;
const CardHeader = styled.div`display:flex; align-items:center; gap:${({ theme }) => theme.spacings.xs}; margin-bottom:${({ theme }) => theme.spacings.xs};`;
const PersonIcon = styled.span`
  display:flex; align-items:center; justify-content:center;
  width:34px; height:34px; border-radius:50%;
  background:${({ theme }) => theme.colors.inputBackground};
  color:${({ theme }) => theme.colors.primary};
`;
const Name = styled.span`font-weight:${({ theme }) => theme.fontWeights.semiBold}; color:${({ theme }) => theme.colors.title};`;
const Label = styled.div`font-weight:${({ theme }) => theme.fontWeights.medium}; color:${({ theme }) => theme.colors.secondary}; margin-bottom:2px;`;
const Text = styled.p`margin:0; color:${({ theme }) => theme.colors.text}; line-height:1.65;`;
