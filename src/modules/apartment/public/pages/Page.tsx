"use client";

import styled, { keyframes } from "styled-components";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/apartment";
import { Skeleton, ErrorMessage } from "@/shared";
import type { SupportedLocale } from "@/types/common";
import type { IApartment } from "@/modules/apartment/types";
import { fetchApartment } from "@/modules/apartment/slice/apartmentSlice";

// Haritayı SSR'siz lazy-load edelim (MapLibre requirement)
const ApartmentMap = dynamic(
  () => import("@/modules/apartment/public/components/ApartmentMap"),
  {
    ssr: false,
    loading: () => <MapSkeleton>Harita yükleniyor…</MapSkeleton>,
  }
);

// Minimum ApartmentCategory type'ı (public listten gelen gömülü alanlar)
type MinApartmentCategory = {
  _id: string;
  name: Record<string, string>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function ApartmentPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("apartment", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const apartmentState = useAppSelector((s) => s.apartment);
  const apartment = useMemo(
    () => apartmentState.apartment || [],
    [apartmentState.apartment]
  );
  const loading = apartmentState.loading;
  const error = apartmentState.error;

  // i18n bundle'larını bir kere ekle
  useEffect(() => {
    Object.entries(translations).forEach(([lng, resources]) => {
      if (!i18n.hasResourceBundle(lng, "apartment")) {
        i18n.addResourceBundle(lng, "apartment", resources, true, true);
      }
    });
  }, [i18n]);

  // İlk yüklemede public listeyi getir
  useEffect(() => {
    dispatch(fetchApartment({ isPublished: true }));
  }, [dispatch]);

  // Kategorileri referanslardan topla (uniq)
  const categories = useMemo<MinApartmentCategory[]>(() => {
    const map = new Map<string, MinApartmentCategory>();
    apartment.forEach((apt) => {
      const cat = apt.category;
      if (!cat) return;
      if (typeof cat === "string") {
        if (!map.has(cat)) map.set(cat, { _id: cat, name: {} });
      } else if (cat._id) {
        map.set(cat._id, {
          _id: cat._id,
          name: cat.name || {},
          isActive: (cat as any).isActive,
          createdAt: (cat as any).createdAt,
          updatedAt: (cat as any).updatedAt,
        });
      }
    });
    return Array.from(map.values());
  }, [apartment]);

  // Kategorilere göre grupla
  const grouped = useMemo(() => {
    const result: Record<string, IApartment[]> = {};
    apartment.forEach((apt) => {
      const catId =
        typeof apt.category === "string"
          ? apt.category
          : apt.category?._id || "none";
      if (!result[catId]) result[catId] = [];
      result[catId].push(apt);
    });
    return result;
  }, [apartment]);

  const noCategory = grouped["none"] || [];
  const sortedCategories = useMemo(
    () =>
      categories
        .filter((cat) => (grouped[cat._id] || []).length)
        .sort((a, b) => {
          const an =
            a.name?.[lang] ||
            a.name?.en ||
            Object.values(a.name || {})[0] ||
            "";
          const bn =
            b.name?.[lang] ||
            b.name?.en ||
            Object.values(b.name || {})[0] ||
            "";
          return an.localeCompare(bn);
        }),
    [categories, grouped, lang]
  );

  // Sekmeler: Tümü + HARİTA + kategoriler + Kategorisiz
  const tabs = useMemo(
    () => [
      { key: "all", label: t("apartment.all_categories", "Tüm Kategoriler") },
      { key: "map", label: t("apartment.map", "Harita") },
      ...sortedCategories.map((cat) => ({
        key: cat._id,
        label:
          cat.name?.[lang] ||
          cat.name?.en ||
          (Object.values(cat.name || {})[0] as string) ||
          "Untitled",
      })),
      ...(noCategory.length
        ? [{ key: "none", label: t("apartment.no_category", "Kategorisiz") }]
        : []),
    ],
    [sortedCategories, noCategory.length, lang, t]
  );

  // Başlangıç sekmesi
  const [activeTab, setActiveTab] = useState<string>("all");
  useEffect(() => {
    if (!tabs.some((tb) => tb.key === activeTab)) {
      setActiveTab(tabs[0]?.key || "all");
    }
  }, [tabs, activeTab]);

  // Filtrelenmiş liste
  const filtered = useMemo(() => {
    if (activeTab === "all") return apartment;
    if (activeTab === "map") return apartment; // Harita tüm kaydı gösterecek
    return grouped[activeTab] || [];
  }, [activeTab, apartment, grouped]);

  // --- MODAL STATE ---
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<IApartment | null>(null);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const openModal = useCallback((item: IApartment) => {
    setSelected(item);
    setActiveImgIdx(0);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => setOpen(false), []);
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  // --- Render ---
  if (loading) {
    return (
      <PageWrapper>
        <SkeletonGrid>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </SkeletonGrid>
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

  if (!apartment.length) {
    return (
      <PageWrapper>
        <Empty>{t("page.noApartment", "Kayıt yok.")}</Empty>
      </PageWrapper>
    );
  }

  return (
    <ModernSection>
      <TabsWrapper>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            $active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsWrapper>

      {activeTab === "map" ? (
        <MapWrap>
          {/* Harita — tüm apartmanlar nokta olarak (koordinatı olanlar) */}
          <ApartmentMap height={560} />
        </MapWrap>
      ) : (
        <LogoGrid>
          {filtered.length === 0 ? (
            <Empty>
              {t(
                "apartment.empty_in_category",
                "Bu kategoride apartman bulunamadı."
              )}
            </Empty>
          ) : (
            filtered
              .filter((item) => item.images?.[0]?.url)
              .map((item) => (
                <LogoCard
                  key={item._id}
                  onClick={() => openModal(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") openModal(item);
                  }}
                >
                  <div className="logo-img-wrap">
                    <Image
                      src={item.images[0].url}
                      alt={item.title?.[lang] || "Logo"}
                      width={132}
                      height={88}
                      style={{
                        objectFit: "contain",
                        width: "100%",
                        height: "auto",
                      }}
                      loading="lazy"
                    />
                  </div>
                </LogoCard>
              ))
          )}
        </LogoGrid>
      )}

      {/* MODAL */}
      {open && selected && (
        <Overlay onClick={closeModal} aria-modal="true" role="dialog">
          <Dialog onClick={(e) => e.stopPropagation()}>
            <CloseBtn
              onClick={closeModal}
              aria-label={t("close", "Kapat")}
            >
              ×
            </CloseBtn>

            <Head>
              <h3>
                {selected.title?.[lang] ||
                  selected.title?.en ||
                  Object.values(selected.title || {})[0] ||
                  t("page.noTitle", "Başlık yok")}
              </h3>
              {/* kategori etiketi */}
              {typeof selected.category !== "string" &&
                selected.category?.name && (
                  <Badge>
                    {selected.category.name?.[lang] ||
                      selected.category.name?.en ||
                      Object.values(selected.category.name || {})[0]}
                  </Badge>
                )}
            </Head>

            {/* GÖRSEL GALERİ */}
            <Hero>
              {selected.images?.[activeImgIdx]?.url ? (
                <Image
                  src={selected.images[activeImgIdx].url}
                  alt={selected.title?.[lang] || "Image"}
                  width={960}
                  height={540}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                  priority
                />
              ) : (
                <NoImage>{t("apartment.no_images", "Görsel yok")}</NoImage>
              )}
            </Hero>

            {selected.images && selected.images.length > 1 && (
              <Thumbs>
                {selected.images.map((img, idx) => (
                  <Thumb
                    key={idx}
                    $active={idx === activeImgIdx}
                    onClick={() => setActiveImgIdx(idx)}
                  >
                    <Image
                      src={img.thumbnail || img.url}
                      alt={`thumb-${idx}`}
                      width={96}
                      height={64}
                      style={{
                        objectFit: "contain",
                        width: "100%",
                        height: "auto",
                      }}
                    />
                  </Thumb>
                ))}
              </Thumbs>
            )}

            {/* İÇERİK + ADRES */}
            {(selected.content?.[lang] || selected.address) && (
              <InfoRow>
                {selected.content?.[lang] && (
                  <ContentBox>
                    <h4>{t("page.detail", "Detay")}</h4>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selected.content[lang],
                      }}
                    />
                  </ContentBox>
                )}

                {selected.address && (
                  <AddressBox>
                    <h4>{t("page.address", "Adres")}</h4>
                    <p>
                      {selected.address.fullText ||
                        [
                          [
                            selected.address.street,
                            selected.address.number,
                          ]
                            .filter(Boolean)
                            .join(" "),
                          [
                            selected.address.zip,
                            selected.address.city,
                          ]
                            .filter(Boolean)
                            .join(" "),
                          selected.address.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                    </p>
                  </AddressBox>
                )}
              </InfoRow>
            )}

            <Footer>
              <Link href={`/apartment/${selected.slug}`} passHref>
                <DetailLink>
                  {t("page.gotoDetail", "Detaya Git")}
                </DetailLink>
              </Link>
              <CloseGhost onClick={closeModal}>
                {t("close", "Kapat")}
              </CloseGhost>
            </Footer>
          </Dialog>
        </Overlay>
      )}
    </ModernSection>
  );
}

// --- Styles ---

const ModernSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.sm};
  background: ${({ theme }) => theme.colors.achievementBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  @media (max-width: 900px) { padding: ${({ theme }) => theme.spacings.xl} ${({ theme }) => theme.spacings.xs}; }
  @media (max-width: 600px) { padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.xs}; border-radius: ${({ theme }) => theme.radii.lg}; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-14px);}
  to { opacity: 1; transform: translateY(0);}
`;

const TabsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem 1.4rem;
  margin-bottom: 2.0rem;
  justify-content: center;
  animation: ${fadeIn} 0.7s cubic-bezier(0.37, 0, 0.63, 1);
`;

const TabButton = styled.button<{ $active: boolean }>`
  position: relative;
  padding: 0.65rem 1.45rem;
  border: none;
  border-radius: 24px;
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(100deg, ${theme.colors.achievementGradientStart}, ${theme.colors.achievementGradientEnd})`
      : theme.colors.background};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text)};
  font-weight: 700;
  font-size: 1.04rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: ${({ $active, theme }) =>
    $active ? `0 4px 22px 0 ${theme.colors.achievementGradientStart}29` : "0 2px 6px 0 rgba(40,40,50,0.05)"};
  border: 2px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.achievementGradientStart : theme.colors.border};
  transition: background 0.18s, color 0.18s, box-shadow 0.24s, transform 0.15s;
  outline: none;
  transform: ${({ $active }) => ($active ? "scale(1.08)" : "scale(1)")};
  &:hover,
  &:focus-visible {
    background: ${({ theme }) =>
      `linear-gradient(95deg, ${theme.colors.achievementGradientStart}, ${theme.colors.achievementGradientEnd})`};
    color: #fff;
    box-shadow: 0 7px 22px 0 ${({ theme }) => theme.colors.achievementGradientStart}36;
    transform: scale(1.12);
  }
`;

const MapWrap = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  background: #fff;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const MapSkeleton = styled.div`
  display: grid;
  place-items: center;
  height: 560px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
`;

const LogoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2.0rem 2.0rem;
  align-items: stretch;
  @media (max-width: 900px) { gap: 1.3rem 1rem; }
  @media (max-width: 600px) { grid-template-columns: 1fr 1fr; gap: 1rem 0.8rem; }
  @media (max-width: 430px) { grid-template-columns: 1fr; gap: 0.9rem 0; }
`;

const LogoCard = styled.div`
  background: linear-gradient(110deg, #fafdff 60%, #e7f5ff 100%);
  border-radius: 22px;
  border: 1.8px solid ${({ theme }) => theme.colors.achievementGradientStart}19;
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  min-width: 150px;
  padding: 1.1rem 0.3rem;
  position: relative;
  transition:
    box-shadow 0.22s cubic-bezier(0.4, 0.12, 0.42, 1.15),
    transform 0.16s cubic-bezier(0.36,0.04,0.56,1.07),
    border 0.15s,
    background 0.15s;
  will-change: transform, box-shadow;
  cursor: pointer;

  .logo-img-wrap {
    width: 140px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    @media (max-width: 600px) { width: 96px; height: 62px; }
    @media (max-width: 430px) { width: 82vw; height: auto; }
  }

  &:hover,
  &:focus-visible {
    box-shadow: 0 12px 32px 0 ${({ theme }) => theme.colors.achievementGradientStart}25;
    border-color: ${({ theme }) => theme.colors.achievementGradientEnd};
    background: linear-gradient(110deg, #f1fbff 45%, #d1f1fd 100%);
    transform: scale(1.05) translateY(-3px);
    z-index: 2;
  }
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2.3rem 2.2rem;
`;

const Empty = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.13em;
  margin: 2.5rem 0 1.5rem 0;
`;

const PageWrapper = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.contentBackground};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  max-width: 1200px;
  margin: 0 auto;
`;

/* -------- Modal styles -------- */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 25, 0.55);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
`;

const Dialog = styled.div`
  position: relative;
  width: min(900px, 96vw);
  max-height: 90vh;
  overflow: auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 1.25rem 1rem 1rem 1rem;
`;

const CloseBtn = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 0.4rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: .6rem;
  margin-bottom: .6rem;
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: .25rem .6rem;
  border-radius: 9999px;
  background: ${({ theme }) => theme.colors.primaryTransparent};
  color: ${({ theme }) => theme.colors.primary};
  font-size: .85rem;
  border: 1px solid ${({ theme }) => theme.colors.primary};
`;

const Hero = styled.div`
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  display: grid;
  place-items: center;
  padding: .5rem;
`;

const NoImage = styled.div`
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Thumbs = styled.div`
  display: flex;
  gap: .5rem;
  margin-top: .6rem;
  flex-wrap: wrap;
`;

const Thumb = styled.button<{ $active?: boolean }>`
  border: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: .15rem;
  cursor: pointer;
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 1rem;
  margin-top: 1rem;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const ContentBox = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: .75rem;
  h4 { margin: 0 0 .5rem 0; color: ${({ theme }) => theme.colors.text}; }
  p, div { color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const AddressBox = styled(ContentBox)``;

const Footer = styled.div`
  margin-top: .9rem;
  display: flex;
  gap: .6rem;
  justify-content: flex-end;
`;

const DetailLink = styled.a`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: .55rem 1.1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  text-decoration: none;
  font-weight: 600;
  &:hover { opacity: .9; }
`;

const CloseGhost = styled.button`
  background: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: .55rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: none;
  font-weight: 500;
  cursor: pointer;
`;
