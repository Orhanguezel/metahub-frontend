"use client";

import React from "react";
import styled from "styled-components";
import { Iradonarprod } from "@/modules/product/types/radonarprod";
import { useTranslation } from "react-i18next";
import {Skeleton} from "@/shared";

interface Props {
  product: Iradonarprod[] | undefined;
  lang: "tr" | "en" | "de";
  loading: boolean;
  error: string | null;
  onEdit?: (item: Iradonarprod) => void;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, isPublished: boolean) => void;
}

export default function ProductList({
  product,
  lang,
  loading,
  error,
  onEdit,
  onDelete,
  onTogglePublish,
}: Props) {
  const { t } = useTranslation("product");

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
  if (!Array.isArray(product)) return null;
  if (product.length === 0)
    return <Empty>{t("admin.product.empty", "No product available.")}</Empty>;

  return (
    <div>
      {product.map((item) => (
        <ProductCard key={item._id}>
          <h2>{item.name?.[lang] || "—"}</h2>
          <p>{item.description?.[lang] || "—"}</p>

          {Array.isArray(item.images) && item.images.length > 0 ? (
            <ImageGrid>
              {item.images.map((img, i) => (
                <img key={i} src={img.url} alt={`product-${i}`} />
              ))}
            </ImageGrid>
          ) : (
            <small>{t("admin.product.no_images", "No images")}</small>
          )}

          <InfoLine>
            <strong>{t("admin.product.brand", "Brand")}:</strong> {item.brand}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.product.price", "Price")}:</strong> €{item.price}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.product.stock", "Stock")}:</strong> {item.stock}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.product.tags", "Tags")}:</strong>{" "}
            {item.tags?.join(", ") || t("none", "None")}
          </InfoLine>

          <InfoLine>
            <strong>{t("admin.product.publish_status", "Published")}:</strong>{" "}
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
                    ? t("admin.product.unpublish", "Unpublish")
                    : t("admin.product.publish", "Publish")}
                </ToggleButton>
              )}
            </ButtonGroup>
          )}
        </ProductCard>
      ))}
    </div>
  );
}

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProductCard = styled.div`
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
