"use client";

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/shared";
import type { IAbout } from "@/modules/about/types/about";

interface Props {
  about: IAbout[];
  lang: "tr" | "en" | "de";
  loading: boolean;
  error: string | null;
  onEdit?: (item: IAbout) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isActive: boolean) => void;
}

export default function AboutList({
  about,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { t } = useTranslation("about");

  if (loading) {
    return (
      <SkeletonWrapper>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} />
        ))}
      </SkeletonWrapper>
    );
  }

  if (error) return <ErrorText>❌ {error}</ErrorText>;
  if (!about || about.length === 0) {
    return <Empty>{t("admin.empty", "No about content found.")}</Empty>;
  }

  return (
    <ListWrapper>
      {about.map((item) => (
        <Card key={item._id}>
          <h2>{item.title?.[lang] || "—"}</h2>
          <p>{item.shortDescription?.[lang]?.slice(0, 150) || "—"}</p>

          {item.images?.[0]?.url ? (
            <ImageWrapper>
              <img
                src={item.images[0].url}
                alt={`about-${item._id}`}
                loading="lazy"
              />
            </ImageWrapper>
          ) : (
            <small>{t("admin.no_image", "No image available")}</small>
          )}

          <InfoLine>
            <strong>{t("admin.category", "Category")}:</strong>{" "}
            {item.category?.[lang] || item.category?.en || "-"}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.tags", "Tags")}:</strong>{" "}
            {item.tags?.join(", ") || "-"}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.status", "Active")}:</strong>{" "}
            {item.isActive ? t("active", "Active") : t("inactive", "Inactive")}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.publish_status", "Published")}:</strong>{" "}
            {item.isPublished ? t("yes", "Yes") : t("no", "No")}
          </InfoLine>

          {(onEdit || onDelete || onTogglePublish) && (
            <ButtonGroup>
              {onEdit && (
                <WarningButton onClick={() => onEdit(item)}>
                  {t("admin.edit", "Edit")}
                </WarningButton>
              )}
              {onDelete && (
                <DangerButton onClick={() => onDelete(item._id)}>
                  {t("admin.delete", "Delete")}
                </DangerButton>
              )}
              {onTogglePublish && (
                <SuccessButton
                  onClick={() => onTogglePublish(item._id, item.isPublished)}
                >
                  {item.isPublished
                    ? t("admin.unpublish", "Unpublish")
                    : t("admin.publish", "Publish")}
                </SuccessButton>
              )}
            </ButtonGroup>
          )}
        </Card>
      ))}
    </ListWrapper>
  );
}

// 💅 Styled Components

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const ImageWrapper = styled.div`
  margin-top: 0.5rem;
  img {
    width: 160px;
    height: auto;
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;

const InfoLine = styled.p`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-weight: bold;
  text-align: center;
`;

const ButtonGroup = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const BaseButton = styled.button`
  padding: 0.45rem 0.8rem;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
`;

const WarningButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.warning};
`;

const DangerButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.danger};
`;

const SuccessButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.success};
`;
