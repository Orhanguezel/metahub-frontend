"use client";

import React from "react";
import styled from "styled-components";
import { INews } from "@/modules/news/types/news";
import { useTranslation } from "react-i18next";
import {
  Skeleton,
 } from "@/shared";

interface Props {
  news: INews[] | undefined;
  lang: "tr" | "en" | "de";
  loading: boolean;
  error: string | null;
  onEdit?: (item: INews) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function NewsList({
  news,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { t } = useTranslation("adminNews");

  if (loading) {
    return (
      <SkeletonWrapper>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </SkeletonWrapper>
    );
  }

  if (error) return <ErrorText>❌ {error}</ErrorText>;
  if (!Array.isArray(news)) return null;
  if (news.length === 0)
    return <Empty>{t("news.empty", "No news available.")}</Empty>;

  return (
    <div>
      {news.map((item) => (
        <NewsCard key={item._id}>
          <h2>
            {typeof item.title === "object" ? item.title[lang] || "—" : "—"}
          </h2>
          <p>
            {typeof item.summary === "object" ? item.summary[lang] || "—" : "—"}
          </p>

          {Array.isArray(item.images) && item.images.length > 0 ? (
            <ImageGrid>
              {item.images.map((img, i) => (
                <img key={i} src={img.url} alt={`news-${i}`} />
              ))}
            </ImageGrid>
          ) : (
            <small>{t("news.no_images", "No images")}</small>
          )}

          <InfoLine>
            <strong>{t("news.author", "Author")}:</strong>{" "}
            {item.author || t("unknown", "Unknown")}
          </InfoLine>

          <InfoLine>
            <strong>{t("news.tags", "Tags")}:</strong>{" "}
            {item.tags?.join(", ") || t("none", "None")}
          </InfoLine>

          <InfoLine>
            <strong>{t("news.publish_status", "Published")}:</strong>{" "}
            {item.isPublished ? t("yes", "Yes") : t("no", "No")}
          </InfoLine>

          {(onEdit || onDelete || onTogglePublish) && (
            <ButtonGroup>
              {onEdit && (
                <ActionButton onClick={() => onEdit(item)}>
                  {t("edit", "Edit")}
                </ActionButton>
              )}
              {onDelete && (
                <DeleteButton onClick={() => onDelete(item._id)}>
                  {t("delete", "Delete")}
                </DeleteButton>
              )}
              {onTogglePublish && (
                <ToggleButton
                  onClick={() => onTogglePublish(item._id, item.isPublished)}
                >
                  {item.isPublished
                    ? t("news.unpublish", "Unpublish")
                    : t("news.publish", "Publish")}
                </ToggleButton>
              )}
            </ButtonGroup>
          )}
        </NewsCard>
      ))}
    </div>
  );
}

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NewsCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.colors.cardBackground};
`;

const ImageGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;

  img {
    width: 150px;
    border-radius: 4px;
  }
`;

const InfoLine = styled.p`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: bold;
`;

const ButtonGroup = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.4rem 0.75rem;
  background: ${({ theme }) => theme.colors.warning};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  padding: 0.4rem 0.75rem;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ToggleButton = styled.button`
  padding: 0.4rem 0.75rem;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;
