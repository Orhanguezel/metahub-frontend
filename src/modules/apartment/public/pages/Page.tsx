"use client";

import styled, { keyframes } from "styled-components";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/apartment";
import { Skeleton, ErrorMessage } from "@/shared";
import type { SupportedLocale } from "@/types/common";
import type { IApartment } from "@/modules/apartment/types";
import OpenInMaps from "@/modules/apartment/public/components/OpenInMaps";

// Haritayı SSR’siz yükle
const ApartmentMap = dynamic(
  () => import("@/modules/apartment/public/components/ApartmentMap"),
  { ssr: false, loading: () => <MapSkeleton>Harita yükleniyor…</MapSkeleton> }
);

// Minimal Neighborhood tipi (public listten gelebilecek alanlar)
type MinNeighborhood = {
  _id: string;
  name?: Record<string, string>;
  slug?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/* ---------- helpers ---------- */
const pickLang = (dict?: Record<string, string>, lang?: SupportedLocale): string => {
  if (!dict) return "";
  return (lang && dict[lang]) || dict.en || dict.tr || Object.values(dict)[0] || "";
};

export default function ApartmentPage() {
  const { i18n, t } = useI18nNamespace("apartment", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { apartment: list, loading, error } = useAppSelector((s) => s.apartment);
  const apartments = useMemo(() => list || [], [list]);

  // i18n bundle’larını ekle
  useEffect(() => {
    Object.entries(translations).forEach(([lng, res]) => {
      if (!i18n.hasResourceBundle(lng, "apartment")) {
        i18n.addResourceBundle(lng, "apartment", res, true, true);
      }
    });
  }, [i18n]);

  /* ---------- MAHALLE seti ---------- */
  const neighborhoods = useMemo<MinNeighborhood[]>(() => {
    const map = new Map<string, MinNeighborhood>();
    for (const apt of apartments) {
      const n = apt.place?.neighborhood;
      if (!n) continue;
      if (typeof n === "string") {
        if (!map.has(n)) map.set(n, { _id: n });
      } else if (n._id) {
        map.set(n._id, { _id: n._id, name: n.name || {}, slug: n.slug, isActive: (n as any).isActive });
      }
    }
    return Array.from(map.values());
  }, [apartments]);

  /* ---------- MAHALLE’ye göre grupla ---------- */
  const groupedByNeighborhood = useMemo(() => {
    const r: Record<string, IApartment[]> = {};
    for (const apt of apartments) {
      const n = apt.place?.neighborhood;
      const key = !n ? "none" : (typeof n === "string" ? n : n._id || "none");
      if (!r[key]) r[key] = [];
      r[key].push(apt);
    }
    return r;
  }, [apartments]);

  const noneGroup = groupedByNeighborhood["none"] || [];

  const sortedNeighborhoods = useMemo(
    () =>
      neighborhoods
        .filter((n) => (groupedByNeighborhood[n._id] || []).length > 0)
        .sort((a, b) => pickLang(a.name, lang).localeCompare(pickLang(b.name, lang))),
    [neighborhoods, groupedByNeighborhood, lang]
  );

  const totalCount = apartments.length;
  /* ---------- Sekmeler ---------- */
  const tabs = useMemo(
    () => [
      { key: "all", label: `${t("apartment.all_neighborhoods","Tüm Mahalleler")} (${totalCount})` },
      { key: "map", label: `${t("apartment.map","Harita")} (${totalCount})` },
      ...sortedNeighborhoods.map((n) => {
        const labelBase =
          pickLang(n.name, lang) || n.slug || t("apartment.unknown_neighborhood", "Mahalle (bilinmiyor)");
        const cnt = (groupedByNeighborhood[n._id] || []).length;
        return { key: n._id, label: `${labelBase} (${cnt})` };
      }),
      ...(noneGroup.length ? [{ key: "none", label: `${t("apartment.no_neighborhood","Mahallesiz")} (${noneGroup.length})` }] : []),
    ],
    [sortedNeighborhoods, noneGroup.length, groupedByNeighborhood, lang, t, totalCount]
  );

  const [activeTab, setActiveTab] = useState<string>("all");
  useEffect(() => {
    if (!tabs.some((tb) => tb.key === activeTab)) setActiveTab(tabs[0]?.key || "all");
  }, [tabs, activeTab]);

  /* ---------- Filtrelenmiş ---------- */
  const filtered = useMemo(() => {
    if (activeTab === "all" || activeTab === "map") return apartments;
    return groupedByNeighborhood[activeTab] || [];
  }, [activeTab, apartments, groupedByNeighborhood]);

  /* ---------- MAP toolbar (stil + heatmap) ---------- */
  const MAP_STYLES = {
    light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  } as const;
  const [mapStyleKey, setMapStyleKey] = useState<keyof typeof MAP_STYLES>("light");
  const [heatOn, setHeatOn] = useState(false);

  /* ---------- Modal state ---------- */
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<IApartment | null>(null);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const openModal = useCallback((item: IApartment) => {
    setSelected(item);
    setActiveImgIdx(0);
    setOpen(true);
  }, []);
  const closeModal = useCallback(() => setOpen(false), []);
  const onKeyDown = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); }, []);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  /* ---------- Render ---------- */
  if (loading) {
    return (
      <PageWrapper>
        <SkeletonGrid>{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}</SkeletonGrid>
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
  if (!apartments.length) {
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
          <TabButton key={tab.key} $active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} type="button">
            {tab.label}
          </TabButton>
        ))}
      </TabsWrapper>

      {activeTab === "map" ? (
        <>
          <MapToolbar>
            <label>
              <input type="checkbox" checked={heatOn} onChange={(e) => setHeatOn(e.target.checked)} /> Isı Haritası
            </label>
            <select value={mapStyleKey} onChange={(e) => setMapStyleKey(e.target.value as keyof typeof MAP_STYLES)}>
              <option value="light">Açık</option>
              <option value="dark">Koyu</option>
            </select>
          </MapToolbar>
          <MapWrap>
            <ApartmentMap height={560} mapStyleUrl={MAP_STYLES[mapStyleKey]} showHeatmap={heatOn} />
          </MapWrap>
        </>
      ) : (
        <LogoGrid>
          {filtered.length === 0 ? (
            <Empty>{t("apartment.empty_in_neighborhood", "Bu mahallede kayıt bulunamadı.")}</Empty>
          ) : (
            filtered
              .filter((item) => item.images?.[0]?.url)
              .map((item) => {
                const title = pickLang(item.title as any, lang) || item.slug || "";
                return (
                  <LogoCard
                    key={item._id}
                    onClick={() => openModal(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") openModal(item); }}
                    aria-label={title}
                    title={title}
                  >
                    <div className="logo-img-wrap">
                      <Image
                        src={item.images[0].url}
                        alt={title || "Logo"}
                        width={132}
                        height={88}
                        style={{ objectFit: "contain", width: "100%", height: "auto" }}
                        loading="lazy"
                      />
                    </div>
                    <CardTitle>{title}</CardTitle>
                  </LogoCard>
                );
              })
          )}
        </LogoGrid>
      )}

      {/* MODAL */}
      {open && selected && (
        <Overlay onClick={closeModal} aria-modal="true" role="dialog">
          <Dialog onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={closeModal} aria-label={t("close", "Kapat")}>×</CloseBtn>

            <Head>
              <h3>{pickLang(selected.title as any, lang) || t("page.noTitle", "Başlık yok")}</h3>
              {/* Mahalle etiketi */}
              {(() => {
                const n = selected.place?.neighborhood;
                const snap = selected.snapshots?.neighborhoodName;
                const nName =
                  (typeof n !== "string" ? pickLang(n?.name as any, lang) : "") ||
                  pickLang(snap as any, lang);
                return nName ? <Badge>{nName}</Badge> : null;
              })()}
            </Head>

            {/* GALERİ */}
            <Hero>
              {selected.images?.[activeImgIdx]?.url ? (
                <Image
                  src={selected.images[activeImgIdx].url}
                  alt={pickLang(selected.title as any, lang) || "Image"}
                  width={960}
                  height={540}
                  style={{ width: "100%", height: "auto", objectFit: "contain" }}
                  priority
                />
              ) : (
                <NoImage>{t("apartment.no_images", "Görsel yok")}</NoImage>
              )}
            </Hero>

            {selected.images && selected.images.length > 1 && (
              <Thumbs>
                {selected.images.map((img, idx) => (
                  <Thumb key={idx} $active={idx === activeImgIdx} onClick={() => setActiveImgIdx(idx)}>
                    <Image
                      src={img.thumbnail || img.url}
                      alt={`thumb-${idx}`}
                      width={96}
                      height={64}
                      style={{ objectFit: "contain", width: "100%", height: "auto" }}
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
                    <div dangerouslySetInnerHTML={{ __html: selected.content[lang]! }} />
                  </ContentBox>
                )}

                {selected.address && (
                  <AddressBox>
                    <h4>{t("page.address", "Adres")}</h4>
                    <p>
                      {selected.address.fullText ||
                        [
                          [selected.address.street, selected.address.number].filter(Boolean).join(" "),
                          [selected.address.zip, selected.address.city].filter(Boolean).join(" "),
                          selected.address.country,
                        ].filter(Boolean).join(", ")}
                    </p>
                  </AddressBox>
                )}
              </InfoRow>
            )}

            {/* Footer: Detay + Haritalarda Aç + Kapat */}
            <Footer>
              <DetailLink href={selected?.slug ? `/apartment/${selected.slug}` : "#"}>
                {t("page.gotoDetail", "Detaya Git")}
              </DetailLink>

              {(() => {
                const coords = selected.location?.coordinates || undefined; // [lng, lat]
                const lng = typeof coords?.[0] === "number" ? coords[0] : undefined;
                const lat = typeof coords?.[1] === "number" ? coords[1] : undefined;
                const address =
                  selected.address?.fullText ||
                  [
                    [selected.address?.street, selected.address?.number].filter(Boolean).join(" "),
                    [selected.address?.zip, selected.address?.city].filter(Boolean).join(" "),
                    selected.address?.country,
                  ].filter(Boolean).join(", ");
                return <OpenInMaps lat={lat} lng={lng} address={address} />;
              })()}

              <CloseGhost onClick={closeModal}>{t("close", "Kapat")}</CloseGhost>
            </Footer>
          </Dialog>
        </Overlay>
      )}
    </ModernSection>
  );
}

/* ---------------- styles ---------------- */

const ModernSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
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
  display: flex; flex-wrap: wrap; gap: .8rem 1.4rem; margin-bottom: 1.4rem; justify-content: center;
  animation: ${fadeIn} .7s cubic-bezier(0.37,0,0.63,1);
`;

const TabButton = styled.button<{ $active: boolean }>`
  position: relative; padding: .65rem 1.45rem; border: none; border-radius: 24px;
  background: ${({ $active, theme }) => $active ? `linear-gradient(100deg, ${theme.colors.achievementGradientStart}, ${theme.colors.achievementGradientEnd})` : theme.colors.background};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text)};
  font-weight: 700; font-size: 1.04rem; letter-spacing: .02em; cursor: pointer;
  box-shadow: ${({ $active, theme }) => $active ? `0 4px 22px 0 ${theme.colors.achievementGradientStart}29` : "0 2px 6px 0 rgba(40,40,50,0.05)"};
  border: 2px solid ${({ $active, theme }) => ($active ? theme.colors.achievementGradientStart : theme.colors.border)};
  transition: background .18s, color .18s, box-shadow .24s, transform .15s;
  outline: none; transform: ${({ $active }) => ($active ? "scale(1.08)" : "scale(1)")};
  &:hover,&:focus-visible{ background: ${({ theme }) => `linear-gradient(95deg, ${theme.colors.achievementGradientStart}, ${theme.colors.achievementGradientEnd})`}; color:#fff; box-shadow:0 7px 22px 0 ${({ theme }) => theme.colors.achievementGradientStart}36; transform:scale(1.12); }
`;

const MapToolbar = styled.div`
  display:flex;gap:12px;align-items:center;justify-content:flex-end;
  margin: -6px 0 8px 0; opacity: .9;
  select, input[type="checkbox"]{ cursor:pointer; }
`;

const MapWrap = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden; background: #fff; box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const MapSkeleton = styled.div`
  display: grid; place-items: center; height: 560px;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.textSecondary}; font-weight: 600;
`;

const LogoGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem; align-items: stretch;
  @media (max-width: 900px){ gap: 1.3rem 1rem; }
  @media (max-width: 600px){ grid-template-columns: 1fr 1fr; gap: 1rem .8rem; }
  @media (max-width: 430px){ grid-template-columns: 1fr; gap: .9rem 0; }
`;

const LogoCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 22px; border: 1.8px solid ${({ theme }) => theme.colors.achievementGradientStart}19;
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .55rem;
  min-height: 150px; min-width: 150px; padding: 1.1rem .6rem; position: relative;
  transition: box-shadow .22s cubic-bezier(.4,.12,.42,1.15), transform .16s cubic-bezier(.36,.04,.56,1.07), border .15s, background .15s;
  will-change: transform, box-shadow; cursor: pointer;

  .logo-img-wrap{ width: 140px; height: 90px; display:flex; align-items:center; justify-content:center; margin-bottom:.1rem;
    @media (max-width: 600px){ width: 96px; height: 62px; }
    @media (max-width: 430px){ width: 82vw; height:auto; }
  }

  &:hover,&:focus-visible{
    box-shadow: 0 12px 32px 0 ${({ theme }) => theme.colors.achievementGradientStart}25;
    border-color: ${({ theme }) => theme.colors.achievementGradientEnd};
    background: ${({ theme }) => theme.colors.background};
    transform: scale(1.05) translateY(-3px);
    z-index: 2;
  }
`;

const CardTitle = styled.div`
  text-align: center; font-size: .95rem; font-weight: 600;
  color: ${({ theme }) => theme.colors.text}; line-height: 1.25; word-break: break-word;
`;

const SkeletonGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 2.3rem 2.2rem;
`;

const Empty = styled.p`
  text-align: center; color: ${({ theme }) => theme.colors.textSecondary}; font-size: 1.13em; margin: 2.5rem 0 1.5rem;
`;

const PageWrapper = styled.div`
  padding: 2rem; background: ${({ theme }) => theme.colors.contentBackground};
  border-radius: ${({ theme }) => theme.radii.md}; box-shadow: ${({ theme }) => theme.shadows.sm};
  max-width: 1200px; margin: 0 auto;
`;

/* Modal */
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(10,15,25,.55); backdrop-filter: blur(2px);
  z-index: 1000; display: grid; place-items: center; padding: 1rem;
`;
const Dialog = styled.div`
  position: relative; width: min(900px, 96vw); max-height: 90vh; overflow: auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg}; padding: 1.25rem 1rem 1rem;
`;
const CloseBtn = styled.button`
  position: absolute; right: .5rem; top: .4rem; border: none; background: transparent;
  color: ${({ theme }) => theme.colors.text}; font-size: 1.8rem; line-height: 1; cursor: pointer;
`;
const Head = styled.div`
  display: flex; align-items: center; gap: .6rem; margin-bottom: .6rem;
  h3{ margin: 0; font-size: 1.25rem; color: ${({ theme }) => theme.colors.primary}; }
`;
const Badge = styled.span`
  display: inline-flex; align-items: center; padding: .25rem .6rem; border-radius: 9999px;
  background: ${({ theme }) => theme.colors.primaryTransparent}; color: ${({ theme }) => theme.colors.primary};
  font-size: .85rem; border: 1px solid ${({ theme }) => theme.colors.primary};
`;
const Hero = styled.div`
  border-radius: ${({ theme }) => theme.radii.md}; border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff; display: grid; place-items: center; padding: .5rem;
`;
const NoImage = styled.div` padding: 3rem 1rem; color: ${({ theme }) => theme.colors.textSecondary}; `;
const Thumbs = styled.div` display: flex; gap: .5rem; margin-top: .6rem; flex-wrap: wrap; `;
const Thumb = styled.button<{ $active?: boolean }>`
  border: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: #fff; border-radius: ${({ theme }) => theme.radii.sm}; padding: .15rem; cursor: pointer;
`;
const InfoRow = styled.div`
  display: grid; grid-template-columns: 1.2fr .8fr; gap: 1rem; margin-top: 1rem;
  @media (max-width: 800px){ grid-template-columns: 1fr; }
`;
const ContentBox = styled.div`
  background: ${({ theme }) => theme.colors.background}; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm}; padding: .75rem;
  h4{ margin: 0 0 .5rem 0; color: ${({ theme }) => theme.colors.text}; }
  p, div{ color: ${({ theme }) => theme.colors.textSecondary}; }
`;
const AddressBox = styled(ContentBox)``;
const Footer = styled.div` margin-top: .9rem; display: flex; gap: .6rem; justify-content: flex-end; flex-wrap: wrap; `;
const DetailLink = styled(Link)`
  display: inline-block; background: ${({ theme }) => theme.colors.primary}; color: #fff;
  padding: .55rem 1.1rem; border-radius: ${({ theme }) => theme.radii.sm}; text-decoration: none; font-weight: 600;
  &:hover{ opacity: .9; }
`;
const CloseGhost = styled.button`
  background: ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.text};
  padding: .55rem 1rem; border-radius: ${({ theme }) => theme.radii.sm}; border: none; font-weight: 500; cursor: pointer;
`;
