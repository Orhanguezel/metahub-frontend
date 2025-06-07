"use client";

import styled from "styled-components";
import { IArticles } from "@/modules/articles/types/article";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/shared";

interface Props {
  articles: IArticles[] | undefined;
  lang: "tr" | "en" | "de";
  loading: boolean;
  error: string | null;
  onEdit?: (item: IArticles) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function ArticlesList({
  articles,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { t } = useTranslation("adminArticles");

  if (loading) {
    return (
      <SkeletonWrapper>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </SkeletonWrapper>
    );
  }

  if (error) return <ErrorText>❌ {error}</ErrorText>;
  if (!Array.isArray(articles)) return null;
  if (articles.length === 0)
    return <Empty>{t("articles.empty", "No articles available.")}</Empty>;

  return (
    <div>
      {articles.map((item) => (
        <ArticlesCard key={item._id}>
          <h2>{item.title?.[lang] || "—"}</h2>
          <p>{item.summary?.[lang] || "—"}</p>

          {item.images?.length > 0 ? (
            <ImageGrid>
              {item.images.map((img, i) => (
                <img key={i} src={img.url} alt={`article-${i}`} />
              ))}
            </ImageGrid>
          ) : (
            <small>{t("articles.no_images", "No images")}</small>
          )}

          <InfoLine>
            <strong>{t("articles.author", "Author")}:</strong>{" "}
            {item.author || t("unknown", "Unknown")}
          </InfoLine>

          <InfoLine>
            <strong>{t("articles.tags", "Tags")}:</strong>{" "}
            {item.tags?.join(", ") || t("none", "None")}
          </InfoLine>

          <InfoLine>
            <strong>{t("articles.publish_status", "Published")}:</strong>{" "}
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
                    ? t("articles.unpublish", "Unpublish")
                    : t("articles.publish", "Publish")}
                </ToggleButton>
              )}
            </ButtonGroup>
          )}
        </ArticlesCard>
      ))}
    </div>
  );
}

// 💅 Styles
const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ArticlesCard = styled.div`
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
