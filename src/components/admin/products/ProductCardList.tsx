"use client";

import styled from "styled-components";
import { IProduct } from "@/types/product";
import ProductCard from "./ProductCard";

interface Props {
  products: IProduct[];
  onEdit: (product: IProduct) => void;
  onDelete: (id: string) => void;
}

export default function ProductCardList({ products, onEdit, onDelete }: Props) {
  if (products.length === 0) {
    return <EmptyMessage>Ürün bulunamadı.</EmptyMessage>;
  }

  return (
    <Grid>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Grid>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
`;

const EmptyMessage = styled.p`
  text-align: center;
  margin-top: 2rem;
  color: ${({ theme }) => theme.textAlt};
  font-style: italic;
`;
