"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCommentsForContent } from "@/modules/comment/slice/slice";
import { CommentForm } from "@/modules/comment";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations3 from "@/modules/comment/locales";

type Props = {
  /** menuitem _id (string) */
  itemId: string;
  /** Başlık (opsiyonel) */
  title?: string;
};

export default function MenuItemComments({ itemId, title }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("testimonial", translations3);

  const comments = useAppSelector((s) => s.comments?.comments ?? []);
  const loading = useAppSelector((s) => s.comments?.loading ?? false);

  useEffect(() => {
    if (!itemId) return;
    dispatch(fetchCommentsForContent({ type: "menuitem", id: itemId }));
  }, [dispatch, itemId]);

  return (
    <Wrap>
      <Header>
        <h3>{title || t("comments", "Yorumlar")}</h3>
        <span className="meta">
          {loading
            ? t("loading", "Yükleniyor...")
            : t("count", "{{count}} yorum").replace(
                "{{count}}",
                String(comments.length || 0)
              )}
        </span>
      </Header>

      <List>
        {comments.map((c: any) => (
          <Card key={c._id || Math.random()}>
            <Top>
              <strong>{c?.name || "Anonymous"}</strong>
              {c?.createdAt ? (
                <small>{new Date(c.createdAt).toLocaleString()}</small>
              ) : null}
            </Top>

            {typeof c?.rating === "number" && (
              <Rating aria-label="rating">
                {Array.from({ length: 5 }).map((_, i) =>
                  i < (c.rating || 0) ? "★" : "☆"
                )}
              </Rating>
            )}

            <p>{c?.text || c?.comment || ""}</p>
          </Card>
        ))}

        {!loading && comments.length === 0 && (
          <Empty>{t("noComments", "Bu ürün için henüz yorum yok.")}</Empty>
        )}
      </List>

      {/* ✍️ Yorum yazma formu (reCAPTCHA + submit sonrası liste kendini yeniler) */}
      <CommentForm contentId={itemId} contentType="menuitem" />
    </Wrap>
  );
}

/* ---------- styled ---------- */

const Wrap = styled.section`
  margin-top: ${({ theme }) => theme.spacings.xl};
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  h3 {
    margin: 0;
  }
  .meta {
    opacity: 0.75;
  }
`;

const List = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Card = styled.div`
  padding: ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  p {
    margin: 6px 0 0 0;
    white-space: pre-wrap;
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  strong {
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  }
  small {
    opacity: 0.7;
  }
`;

const Rating = styled.div`
  margin: 4px 0 2px 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
