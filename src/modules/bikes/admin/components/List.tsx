"use client";

import React from "react";
import styled from "styled-components";
import { IBikes } from "@/modules/bikes/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { Skeleton } from "@/shared";
import type { SupportedLocale } from "@/types/common";
import Image from "next/image";

interface Props {
  bikes: IBikes[] | undefined;
  lang: SupportedLocale;
  loading: boolean;
  error: string | null;
  onEdit?: (item: IBikes) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function BikesList({
  bikes,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { i18n, t } = useI18nNamespace("bikes", translations);
    const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

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
  if (!Array.isArray(bikes)) return null;
  if (bikes.length === 0)
    return <Empty>{t("admin.bike.empty", "No bike available.")}</Empty>;

  // Eğer dilde veri yoksa "en" fallback
  const getLabel = (obj?: Partial<Record<SupportedLocale, string>>) =>
    obj?.[lang] || obj?.en || "—";

  return (
    <div>
      {bikes.map((item) => (
        <BikeCard key={item._id}>
          <h2>{getLabel(item.name)}</h2>
          <p>{getLabel(item.description)}</p>

          {Array.isArray(item.images) && item.images.length > 0 ? (
            <ImageGrid>
              {item.images.map((img, i) => (
                <Image key={i} src={img.url} alt={`bike-${i}`} width={150} height={100} />
              ))}
            </ImageGrid>
          ) : (
            <small>{t("admin.bike.no_images", "No images")}</small>
          )}

          <InfoLine>
            <strong>{t("admin.bike.brand", "Brand")}:</strong> {item.brand}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.bike.price", "Price")}:</strong> €{item.price}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.bike.stock", "Stock")}:</strong> {item.stock}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.bike.tags", "Tags")}:</strong>{" "}
            {item.tags?.join(", ") || t("none", "None")}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.bike.publish_status", "Published")}:</strong>{" "}
            {item.isPublished ? t("yes", "Yes") : t("no", "No")}
          </InfoLine>

          {(onEdit || onDelete || onTogglePublish) && (
            <ButtonGroup>
              {onEdit && (
                <ActionButton onClick={() => onEdit(item)}>
                  {t("admin.edit", "Edit")}
                </ActionButton>
              )}
              {onDelete && (
                <DeleteButton onClick={() => onDelete(item._id)}>
                  {t("admin.delete", "Delete")}
                </DeleteButton>
              )}
              {onTogglePublish && (
                <ToggleButton
                  onClick={() => onTogglePublish(item._id, item.isPublished)}
                >
                  {item.isPublished
                    ? t("admin.bike.unpublish", "Unpublish")
                    : t("admin.bike.publish", "Publish")}
                </ToggleButton>
              )}
            </ButtonGroup>
          )}
        </BikeCard>
      ))}
    </div>
  );
}

// --- Styled Components ---

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BikeCard = styled.div`
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
