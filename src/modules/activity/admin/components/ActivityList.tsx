"use client";

import React from "react";
import styled from "styled-components";
import { IActivity } from "@/modules/activity/types/activity";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/shared";

interface Props {
  activities?: IActivity[];
  lang: "tr" | "en" | "de";
  loading: boolean;
  error: string | null;
  onEdit?: (item: IActivity) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function ActivityList({
  activities,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { t } = useTranslation("adminActivity");

  const hasActions = !!onEdit || !!onDelete || !!onTogglePublish;

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
  if (!activities || activities.length === 0) {
    return <Empty>{t("activity.empty", "No Activity available.")}</Empty>;
  }

  return (
    <ListWrapper>
      {activities.map((item) => (
        <Card key={item._id}>
          <h2>{item.title?.[lang] || "—"}</h2>
          <p>{item.summary?.[lang] || "—"}</p>

          {item.images?.length > 0 ? (
            <ImageGrid>
              {item.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`Activity-${i}`}
                  loading="lazy"
                />
              ))}
            </ImageGrid>
          ) : (
            <small>{t("activity.no_images", "No images")}</small>
          )}

          <InfoLine>
            <strong>{t("activity.tags", "Tags")}:</strong>{" "}
            {item.tags?.join(", ") || t("none", "None")}
          </InfoLine>

          <InfoLine>
            <strong>{t("activity.publish_status", "Published")}:</strong>{" "}
            {item.isPublished ? t("yes", "Yes") : t("no", "No")}
          </InfoLine>

          {hasActions && (
            <ButtonGroup>
              {onEdit && (
                <WarningButton onClick={() => onEdit(item)}>
                  {t("edit", "Edit")}
                </WarningButton>
              )}
              {onDelete && (
                <DangerButton onClick={() => onDelete(item._id)}>
                  {t("delete", "Delete")}
                </DangerButton>
              )}
              {onTogglePublish && (
                <SuccessButton
                  onClick={() => onTogglePublish(item._id, item.isPublished)}
                >
                  {item.isPublished
                    ? t("activity.unpublish", "Unpublish")
                    : t("activity.publish", "Publish")}
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

const ImageGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;

  img {
    width: 140px;
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
