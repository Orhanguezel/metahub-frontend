"use client";

import styled from "styled-components";
import { IProduct } from "@/types/product";
import { getImageSrc } from "@/utils/getImageSrc";
import { useTranslation } from "react-i18next";

interface Props {
  product: IProduct;
  onEdit: (product: IProduct) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: Props) {
  const { t } = useTranslation("admin");

  return (
    <Card>
      <Image src={getImageSrc(product.image, "product")} alt={product.name} />
      <Content>
        <CardHeader>
          <h4>{product.name}</h4>
          <CardActions>
            <IconButton bg="primary" onClick={() => onEdit(product)}>✏️</IconButton>
            <IconButton bg="danger" onClick={() => onDelete(product._id)}>🗑️</IconButton>
          </CardActions>
        </CardHeader>

        <Category>
          {typeof product.category === "string"
            ? product.category
            : product.category?.name}
        </Category>

        <Price>{t("products.price")}: €{product.price}</Price>

        <Badges>
          <StockBadge low={product.stock < product.stockThreshold}>
            {t("products.stock")}: {product.stock}
          </StockBadge>
          <PublishBadge published={product.isPublished}>
            {product.isPublished
              ? t("products.published")
              : t("products.draft")}
          </PublishBadge>
        </Badges>

        {Array.isArray(product.tags) && product.tags.length > 0 && (
          <TagsWrapper>
            {product.tags.map((tag, i) => (
              <Tag key={i}>{tag}</Tag>
            ))}
          </TagsWrapper>
        )}
      </Content>
    </Card>
  );
}

const Card = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  max-width: 100%;
  width: 100%;
`;

const Image = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
`;

const Content = styled.div`
  padding: 1rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;

  h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    flex: 1;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const IconButton = styled.button<{ bg?: string }>`
  background: ${({ bg, theme }) => (bg ? theme[bg] : theme.primary)};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    opacity: 0.9;
  }
`;

const Category = styled.div`
  margin: 0.4rem 0 0.2rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textAlt};
`;

const Price = styled.div`
  font-size: 0.95rem;
  margin-bottom: 0.4rem;
`;

const Badges = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;
`;

const StockBadge = styled.span<{ low: boolean }>`
  background: ${({ low, theme }) => (low ? theme.danger : theme.success)};
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
`;

const PublishBadge = styled.span<{ published: boolean }>`
  background: ${({ published, theme }) =>
    published ? theme.success : theme.warning};
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
`;

const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.backgroundAlt};
  color: ${({ theme }) => theme.text};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
`;
