import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/ensotekprod";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import type { IEnsotekprod } from "@/modules/ensotekprod/types";
import type { ISparepart } from "@/modules/sparepart/types";

export default function EnsotekprodPage() {
  const { i18n, t } = useI18nNamespace("ensotekprod", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { ensotekprod, loading, error } = useAppSelector((state) => state.ensotekprod);

  // --- Yedek Parçaları Al ---
  const { sparepart: spareparts } = useAppSelector((s) => s.sparepart);

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "ensotekprod")) {
      i18n.addResourceBundle(lng, "ensotekprod", resources, true, true);
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

  if (!ensotekprod || ensotekprod.length === 0) {
    return (
      <PageWrapper>
        <p>{t("page.noEnsotekprod", "Ürün bulunamadı.")}</p>
      </PageWrapper>
    );
  }

  // Kule Malzemeleri filtresi — burada tüm spareparts gösteriliyor, gerekirse filtre ekleyebilirsin
  const towerParts = spareparts?.length ? spareparts : [];

  return (
    <PageWrapper>
      <PageTitle>{t("page.allEnsotekprod", "Tüm Ürünler")}</PageTitle>
      <EnsotekprodGrid>
        {ensotekprod.map((item: IEnsotekprod, index: number) => (
          <EnsotekprodCard
            key={item._id}
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            viewport={{ once: true }}
          >
            <Link href={`/ensotekprod/${item.slug}`}>
              <ImageGallery tabIndex={0} role="link">
                {item.images && item.images.length > 0 ? (
                  item.images.slice(0, 2).map((img, i) => (
                    <Image
                      key={i}
                      src={img.url}
                      alt={item.name?.[lang] || "Product Image"}
                      width={380}
                      height={190}
                      style={{
                        objectFit: "cover",
                      }}
                      loading="lazy"
                    />
                  ))
                ) : (
                  <ImgPlaceholder>{t("page.noImage", "Görsel yok")}</ImgPlaceholder>
                )}
              </ImageGallery>
            </Link>
            <CardContent>
              <Link href={`/ensotekprod/${item.slug}`}>
                <CardTitle tabIndex={0} role="link">
                  {item.name?.[lang] || "Untitled"}
                </CardTitle>
              </Link>
              <CardDesc>
                {item.description?.[lang] || "No description available."}
              </CardDesc>
              <Meta>
                <span>
                  <b>{t("page.category", "Kategori")}:</b>{" "}
                  {typeof item.category === "object"
                    ? item.category.name?.[lang] || "-"
                    : "-"}
                </span>
              </Meta>
              {item.tags && item.tags.length > 0 && (
                <Tags>
                  {item.tags.map((tag, i) => (
                    <Tag key={i}>{tag}</Tag>
                  ))}
                </Tags>
              )}
              <ReadMore href={`/ensotekprod/${item.slug}`}>
                {t("page.readMore", "Detayları Gör →")}
              </ReadMore>
            </CardContent>
          </EnsotekprodCard>
        ))}
      </EnsotekprodGrid>

      {/* ----------- KULE MALZEMELERİ BLOĞU ------------- */}
      {towerParts.length > 0 && (
        <TowerSection>
          <TowerTitle>{t("page.towerParts", "Kule Malzemeleri")}</TowerTitle>
          <TowerGrid>
            {towerParts.map((item: ISparepart) => (
              <TowerCard
                key={item._id}
                as={motion.div}
                whileHover={{ y: -6, scale: 1.025 }}
                tabIndex={0}
              >
                <TowerImgWrap>
                  {item.images?.[0]?.url ? (
                    <TowerImg
                      src={item.images[0].url}
                      alt={item.name?.[lang] || "Untitled"}
                      width={60}
                      height={40}
                    />
                  ) : (
                    <TowerImgPlaceholder />
                  )}
                </TowerImgWrap>
                <TowerTitleMini>
                  <Link href={`/sparepart/${item.slug}`}>
                    {item.name?.[lang] || "Untitled"}
                  </Link>
                </TowerTitleMini>
              </TowerCard>
            ))}
          </TowerGrid>
        </TowerSection>
      )}
    </PageWrapper>
  );
}

// --- Styled Components --- (KULE BLOĞU için ekler)
const TowerSection = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xxl};
  border-top: 1.5px solid ${({ theme }) => theme.colors.borderLight};
  padding-top: ${({ theme }) => theme.spacings.lg};
`;

const TowerTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const TowerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem 1.8rem;
  margin-top: 0.7rem;
`;

const TowerCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  border: 1.3px solid ${({ theme }) => theme.colors.borderLight};
  padding: 1.1rem 1.2rem 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  transition: box-shadow 0.18s, border 0.18s, transform 0.16s;
  cursor: pointer;
  min-height: 72px;

  &:hover, &:focus-visible {
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-5px) scale(1.035);
    z-index: 2;
  }
`;

const TowerImgWrap = styled.div`
  flex-shrink: 0;
  width: 60px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TowerImg = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.md};
`;

const TowerImgPlaceholder = styled.div`
  width: 60px;
  height: 40px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.36;
  border-radius: ${({ theme }) => theme.radii.md};
`;

const TowerTitleMini = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.primary};

  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

// --- Eski komponentleri aynen koruyabilirsin (EnsotekprodGrid, EnsotekprodCard, ...)



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

const EnsotekprodGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.lg};
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
`;

const EnsotekprodCard = styled(motion.div)`
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
  cursor: pointer;
  transition: box-shadow 0.18s;
  &:hover, &:focus-visible {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
    opacity: 0.92;
  }
`;

const CardTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  text-decoration: none;
  &:hover, &:focus-visible {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
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
