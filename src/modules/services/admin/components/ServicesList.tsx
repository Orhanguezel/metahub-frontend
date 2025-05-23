"use client";

import React from "react";
import styled from "styled-components";
import { IServices } from "@/modules/services/types/services";
import { useTranslation } from "react-i18next";
import {Skeleton} from "@/shared";

interface Props {
  services: IServices[] | undefined;
  lang: "tr" | "en" | "de";
  loading: boolean;
  error: string | null;
  onEdit?: (item: IServices) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function ServicesList({
  services,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { t } = useTranslation("services");

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
  if (!Array.isArray(services)) return null;
  if (services.length === 0)
    return <Empty>{t("admin.services.empty", "No Services available.")}</Empty>;

  return (
    <ListWrapper>
      {services.map((item) => (
        <Card key={item._id}>
          <h2>{item.title?.[lang] || "—"}</h2>
          <p>{item.summary?.[lang] || "—"}</p>

          {item.images?.length > 0 ? (
            <ImageGrid>
              {item.images.map((img, i) => (
                <img key={i} src={img.url} alt={`Service-${i}`} />
              ))}
            </ImageGrid>
          ) : (
            <small>{t("services.no_images", "No images")}</small>
          )}

          <InfoLine>
            <strong>{t("admin.services.tags", "Tags")}:</strong>{" "}
            {item.tags?.join(", ") || t("none", "None")}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.services.publish_status", "Published")}:</strong>{" "}
            {item.isPublished ? t("yes", "Yes") : t("no", "No")}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.services.price", "Price")}:</strong>{" "}
            {item.price ? `€${item.price}` : t("none")}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.services.duration", "Duration")}:</strong>{" "}
            {item.durationMinutes || t("none")} min
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
                    ? t("admin.services.unpublish", "Unpublish")
                    : t("admin.services.publish", "Publish")}
                </SuccessButton>
              )}
            </ButtonGroup>
          )}
        </Card>
      ))}
    </ListWrapper>
  );
}

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
`;

const ImageGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
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
`;

const ButtonGroup = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

// 🧱 Common base button
const BaseButton = styled.button`
  padding: 0.45rem 0.8rem;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
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
