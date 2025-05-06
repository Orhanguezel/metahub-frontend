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
  padding: ${({ theme }) => theme.spacing["2xl"]} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.light};
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform ${({ theme }) => theme.transition.fast};

  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductImage = styled(Image)`
  border-radius: ${({ theme }) => theme.radii.sm};
  object-fit: cover;
  width: 100%;
  height: auto;
  max-height: 200px;
`;

const Name = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin: ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text};
`;

const Price = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  transition: background ${({ theme }) => theme.transition.fast}, transform 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primaryTransparent};
    outline-offset: 2px;
  }
`;

const SeeAll = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transition.fast};

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
