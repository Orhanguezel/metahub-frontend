"use client";

import styled from "styled-components";
import Link from "next/link";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/sparepart";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import type { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage, AddToCartButton } from "@/shared";
import type { ISparepart } from "@/modules/sparepart/types";

export default function SparepartSection() {
  const { i18n, t } = useI18nNamespace("sparepart", translations);
      const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  Object.entries(translations).forEach(([lang, resources]) => {
  if (!i18n.hasResourceBundle(lang, "sparepart")) {
    i18n.addResourceBundle(lang, "sparepart", resources, true, true);
  }
});

  // Store’dan sadece tüketici (stateless)
  const { sparepart, loading, error } = useAppSelector((state) => state.sparepart);

  // Son 3 ürünü göster
  const latestSparepart = sparepart?.slice(0, 3) || [];

  if (loading) {
    return (
      <Section>
        <Title>
          <IconTitle>🚲</IconTitle>
          {t("page.sparepart.title", "Bisikletler")}
        </Title>
        <Grid>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </Grid>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Title>
          <IconTitle>🚲</IconTitle>
          {t("page.sparepart.title", "Bisikletler")}
        </Title>
        <ErrorMessage message={error} />
      </Section>
    );
  }

  if (!sparepart || sparepart.length === 0) {
    return (
      <Section>
        <Title>
          <IconTitle>🚲</IconTitle>
          {t("page.sparepart.title", "Bisikletler")}
        </Title>
        <p>{t("page.noSparepart", "Henüz ürün yok.")}</p>
      </Section>
    );
  }

  return (
    <Section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Title>
        <IconTitle>🚲</IconTitle>
        {t("page.sparepart.title", "Bisikletler")}
      </Title>
      <Grid>
        {latestSparepart.map((item: ISparepart, index: number) => (
          <CardWrapper key={item._id}>
            <CardLink href={`/sparepart/${item.slug}`} passHref>
              <Card
                as={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Content>
                  <SparepartTitle>{item.name?.[lang] || "-"}</SparepartTitle>
                  <Excerpt>{item.description?.[lang] || "-"}</Excerpt>
                </Content>
                {item.images?.[0]?.url && (
                  <StyledImage
                    src={item.images[0].url}
                    alt={item.name?.[lang] || "Sparepart Image"}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                  />
                )}
              </Card>
            </CardLink>
            <AddToCartButton productId={item._id} productType="Sparepart" disabled={item.stock < 1}>
              <ShoppingCart
                size={20}
                style={{ marginRight: 8, marginBottom: -3 }}
              />
              <span>
                {item.stock < 1
                  ? t("cart:outOfStock", "Stok Yok")
                  : t(`cart:add`, "Sepete Ekle")}
              </span>
            </AddToCartButton>
          </CardWrapper>
        ))}
      </Grid>
      <SeeAll href="/sparepart">{t("page.sparepart.all", "Tümünü Gör")}</SeeAll>
    </Section>
  );
}

// 💅 Styled Components
const Section = styled(motion.section)`
  padding: ${({ theme }) => theme.spacings.xxl}
    ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const IconTitle = styled.span`
  font-size: 1.6em;
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.xl};
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacings.md};
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: none;
  }
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacings["xl"]};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 400px;
  transition: box-shadow 0.2s, transform 0.15s;
  cursor: pointer;
  &:hover {
    transform: translateY(-4px) scale(1.025);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`;

const Content = styled.div`
  text-align: left;
  width: 100%;
`;

const SparepartTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Excerpt = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const StyledImage = styled(motion.img)`
  width: 220px;
  height: 160px;
  border-radius: ${({ theme }) => theme.radii.md};
  object-fit: cover;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 0.3s;
  margin-top: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  &:hover {
    transform: scale(1.03);
  }
  @media (max-width: 767px) {
    width: 100%;
    height: 160px;
  }
`;

const SeeAll = styled(Link)`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: color ${({ theme }) => theme.transition.fast};
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;
