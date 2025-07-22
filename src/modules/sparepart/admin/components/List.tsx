"use client";

import React from "react";
import styled from "styled-components";
import { ISparepart } from "@/modules/sparepart/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/sparepart";
import { Skeleton } from "@/shared";
import type { SupportedLocale } from "@/types/common";
import Image from "next/image";

interface Props {
  sparepart: ISparepart[] | undefined;
  lang: SupportedLocale;
  loading: boolean;
  error: string | null;
  onEdit?: (item: ISparepart) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function SparepartList({
  sparepart,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { i18n, t } = useI18nNamespace("sparepart", translations);
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
  if (!Array.isArray(sparepart)) return null;
  if (sparepart.length === 0)
    return <Empty>{t("admin.sparepart.empty", "No sparepart available.")}</Empty>;

  // Eğer dilde veri yoksa "en" fallback
  const getLabel = (obj?: Partial<Record<SupportedLocale, string>>) =>
    obj?.[lang] || obj?.en || "—";

  return (
    <div>
      {sparepart.map((item) => (
        <SparepartCard key={item._id}>
          <h2>{getLabel(item.name)}</h2>
          <p>{getLabel(item.description)}</p>

          {Array.isArray(item.images) && item.images.length > 0 ? (
            <ImageGrid>
              {item.images.map((img, i) => (
                <Image key={i} src={img.url} alt={`sparepart-${i}`} width={150} height={100} />
              ))}
            </ImageGrid>
          ) : (
            <small>{t("admin.sparepart.no_images", "No images")}</small>
          )}

          <InfoLine>
            <strong>{t("admin.sparepart.brand", "Brand")}:</strong> {item.brand}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.sparepart.price", "Price")}:</strong> €{item.price}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.sparepart.stock", "Stock")}:</strong> {item.stock}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.sparepart.tags", "Tags")}:</strong>{" "}
            {item.tags?.join(", ") || t("none", "None")}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.sparepart.publish_status", "Published")}:</strong>{" "}
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
                    ? t("admin.sparepart.unpublish", "Unpublish")
                    : t("admin.sparepart.publish", "Publish")}
                </ToggleButton>
              )}
            </ButtonGroup>
          )}
        </SparepartCard>
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

const SparepartCard = styled.div`
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
