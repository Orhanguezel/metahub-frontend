"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/cartSlice";
import { useEffect, useState } from "react";

const Section = styled(motion.section)`
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.backgroundAlt || "#f8f8fc"};
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.cardBackground || "#fff"};
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProductImage = styled(Image)`
  border-radius: 8px;
`;

const Name = styled.h4`
  font-size: 1rem;
  margin: 0.5rem 0;
`;

const Price = styled.p`
  font-weight: bold;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.primary || "rebeccapurple"};
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.primaryDark || "indigo"};
  }
`;

const SeeAll = styled(Link)`
  display: inline-block;
  margin-top: 2rem;
  color: ${({ theme }) => theme.primary || "rebeccapurple"};
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const products = [
  {
    _id: "1",
    name: "Lavanta Yağı",
    price: 29.99,
    image: "/products/lavanta.jpg",
  },
  {
    _id: "2",
    name: "Detoks Çayı",
    price: 14.99,
    image: "/products/detoks.jpg",
  },
  {
    _id: "3",
    name: "Magnezyum Spreyi",
    price: 19.99,
    image: "/products/magnezyum.jpg",
  },
];

export default function ProductsSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleAddToCart = (product: any) => {
    dispatch(addToCart(product));
  };

  return (
    <Section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Title>🛍️ {t("home.products.title", "Öne Çıkan Ürünler")}</Title>
      <Grid>
        {products.map((product, index) => (
          <Card
            key={product._id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              width={200}
              height={150}
            />
            <Name>{product.name}</Name>
            <Price>{product.price.toFixed(2)} €</Price>
            <Button onClick={() => handleAddToCart(product)}>
              {t("home.products.addToCart", "Sepete Ekle")}
            </Button>
          </Card>
        ))}
      </Grid>
      <SeeAll href="/visitor/products">
        {t("home.products.all", "Tüm Ürünleri Gör →")}
      </SeeAll>
    </Section>
  );
}
