"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/api";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Wrapper = styled(motion.section)`
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.backgroundAlt || "#f9f9f9"};
`;

const Heading = styled.h1`
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.cardBackground || "#fff"};
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Img = styled.img`
  width: 100%;
  max-height: 160px;
  object-fit: contain;
  border-radius: 6px;
  margin-bottom: 1rem;
`;

const Title = styled.h4`
  font-size: 1.1rem;
  text-align: center;
`;

const Price = styled.p`
  font-weight: bold;
  margin: 0.5rem 0;
`;

const Category = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary || "#999"};
`;

const Button = styled.button`
  margin-top: 1rem;
  padding: 8px 14px;
  background: ${({ theme }) => theme.primary || "#27ae60"};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.primaryDark || "#219150"};
  }
`;

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    axios
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Ürünler alınamadı", err));
  }, []);

  return (
    <Wrapper
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Heading>🛍️ {t("products.all", "Tüm Ürünler")}</Heading>
      <Grid>
        {products.map((p: any, i) => (
          <Card
            key={p._id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Img src={p.image} alt={p.name} />
            <Title>{p.name}</Title>
            <Price>{p.price} €</Price>
            <Category>{p.category}</Category>
            <Button>{t("products.addToCart", "Sepete Ekle")}</Button>
          </Card>
        ))}
      </Grid>
    </Wrapper>
  );
}
