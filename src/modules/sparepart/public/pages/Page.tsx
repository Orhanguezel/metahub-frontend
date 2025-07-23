"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/sparepart";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "@/shared/AddToCartButton";
import type { SupportedLocale } from "@/types/common";
import type { ISparepart } from "@/modules/sparepart/types";

export default function SparepartPage() {
  const { i18n, t } = useI18nNamespace("sparepart", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { sparepart, loading, error } = useAppSelector((state) => state.sparepart);

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "sparepart")) {
      i18n.addResourceBundle(lng, "sparepart", resources, true, true);
    }
  });

  if (loading) {
    return (
      <PageWrapper>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <ErrorMessage message={error} />
      </PageWrapper>
    );
  }

  if (!sparepart || sparepart.length === 0) {
    return (
      <PageWrapper>
        <p>{t("page.noSparepart", "Ürün bulunamadı.")}</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.allSparepart", "Tüm Ürünler")}</PageTitle>
      <SparepartGrid>
        {sparepart.map((item: ISparepart, index: number) => {
          const detailHref = `/sparepart/${item.slug}`;
          return (
            <SparepartCard
              key={item._id}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              viewport={{ once: true }}
            >
              <Link href={detailHref} tabIndex={-1} style={{ display: "block" }}>
                <ImageGallery>
                  {item.images && item.images.length > 0 ? (
                    item.images.slice(0, 2).map((img, i) => (
                      <StyledImage
                        key={i}
                        src={img.url}
                        alt={item.name?.[lang] + `-img${i + 1}` || "Untitled"}
                        width={380}
                        height={190}
                        loading="lazy"
                        draggable={false}
                      />
                    ))
                  ) : (
                    <ImgPlaceholder>{t("page.noImage", "Görsel yok")}</ImgPlaceholder>
                  )}
                </ImageGallery>
              </Link>
              <CardContent>
                <CardTitle as={Link} href={detailHref}>
                  {item.name?.[lang] || "Untitled"}
                </CardTitle>
                <CardDesc>
                  {item.description?.[lang] || "No description available."}
                </CardDesc>
                <Meta>
                  <span>
                    <b>{t("page.category", "Kategori")}:</b>{" "}
                    {typeof item.category === "object"
                      ? item.category.name?.[lang] || "Untitled"
                      : "-"}
                  </span>
                  <span>
                    <b>{t("page.price", "Fiyat")}:</b> {item.price} €
                  </span>            
                </Meta>
                {/* Etiketler */}
                {item.tags && item.tags.length > 0 && (
                  <Tags>
                    {item.tags.map((tag, i) => (
                      <Tag key={i}>{tag}</Tag>
                    ))}
                  </Tags>
                )}
                <ReadMore href={detailHref}>
                  {t("page.readMore", "Detayları Gör →")}
                </ReadMore>
                <AddToCartButton productId={item._id} productType="Sparepart" disabled={item.stock < 1} />
              </CardContent>
            </SparepartCard>
          );
        })}
      </SparepartGrid>
    </PageWrapper>
  );
}

// --- Styled Components ---
const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.md};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const SparepartGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.lg};
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
`;

const SparepartCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

const ImageGallery = styled.div`
  width: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: row;
  gap: 2px;
  justify-content: flex-start;
  align-items: stretch;
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 190px;
  object-fit: cover;
  flex: 1;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 190px;
  background: ${({ theme }) => theme.colors.skeleton};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15em;
  opacity: 0.48;
`;

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacings.md};
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const CardTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: color 0.19s;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

const CardDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

const Meta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.37em;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.accent}22;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.13em 0.9em;
  font-size: 0.98em;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-weight: 500;
  letter-spacing: 0.01em;
  display: inline-block;
`;

const ReadMore = styled(Link)`
  margin-top: auto;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.17em 0.9em;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  transition: background 0.19s, color 0.16s;
  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    text-decoration: none;
  }
`;
