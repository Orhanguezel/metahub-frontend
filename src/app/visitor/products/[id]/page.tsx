"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "@/lib/api";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const Wrapper = styled.section`
  padding: 4rem 2rem;
  max-width: 800px;
  margin: 0 auto;
  color: ${({ theme }) => theme.text};
`;

const Img = styled.img`
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Name = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
`;

const Price = styled.p`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const Category = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary || "#999"};
  margin-bottom: 2rem;
`;

const Description = styled.p`
  font-size: 1rem;
  line-height: 1.6;
`;

const Button = styled.button`
  margin-top: 2rem;
  padding: 10px 20px;
  background: ${({ theme }) => theme.primary || "#27ae60"};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.primaryDark || "#219150"};
  }
`;

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      axios
        .get(`/products/${id}`)
        .then((res) => setProduct(res.data))
        .catch((err) => console.error("Ürün detay alınamadı", err));
    }
  }, [id]);

  if (!product) return <p style={{ padding: "2rem" }}>Yükleniyor...</p>;

  return (
    <Wrapper>
      <Img src={product.image} alt={product.name} />
      <Name>{product.name}</Name>
      <Price>{product.price} €</Price>
      <Category>{product.category}</Category>
      <Description>
        {product.description ||
          t("products.noDescription", "Ürün açıklaması bulunmamaktadır.")}
      </Description>
      <Button>{t("products.addToCart", "Sepete Ekle")}</Button>
    </Wrapper>
  );
}
