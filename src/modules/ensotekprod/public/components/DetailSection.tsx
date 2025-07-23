"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import { translations } from "@/modules/ensotekprod";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import type { SupportedLocale } from "@/types/common";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchEnsotekprodBySlug,
  setSelectedEnsotekprod,
  clearEnsotekprodMessages,
} from "@/modules/ensotekprod/slice/ensotekprodSlice";
import { clearCartMessages } from "@/modules/cart/slice/cartSlice";
import { Skeleton, ErrorMessage } from "@/shared";
import { CommentForm, CommentList } from "@/modules/comment";
import type { IEnsotekprod } from "@/modules/ensotekprod/types";
import { XCircle, CheckCircle } from "lucide-react";
import Modal from "@/modules/home/public/components/Modal";

export default function EnsotekprodDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { i18n, t } = useI18nNamespace("ensotekprod", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const dispatch = useAppDispatch();

  const {
    selected: ensotekprod,
    ensotekprod: allProducts,
    loading,
    error,
  } = useAppSelector((state) => state.ensotekprod);

  // Ana görsel ve modal
  const [mainPhoto, setMainPhoto] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  // Tüm görseller ve swipe işlemleri
  const images = ensotekprod?.images || [];
  const totalImages = images.length;

  const goNext = useCallback(() => {
    setMainPhoto((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const goPrev = useCallback(() => {
    setMainPhoto((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  // Modal açıkken keyboard swipe/esc
  const handleModalKey = useCallback(
    (e: KeyboardEvent) => {
      if (!openModal) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") setOpenModal(false);
    },
    [openModal, goNext, goPrev]
  );

  useEffect(() => {
    if (!openModal) return;
    window.addEventListener("keydown", handleModalKey);
    return () => window.removeEventListener("keydown", handleModalKey);
  }, [openModal, handleModalKey]);

  // Data fetch & cleanup
  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      const found = allProducts.find((item: IEnsotekprod) => item.slug === slug);
      if (found) {
        dispatch(setSelectedEnsotekprod(found));
      } else {
        dispatch(fetchEnsotekprodBySlug(slug));
      }
    } else {
      dispatch(fetchEnsotekprodBySlug(slug));
    }
    setMainPhoto(0);
    return () => {
      dispatch(clearEnsotekprodMessages());
      dispatch(clearCartMessages());
    };
  }, [dispatch, allProducts, slug]);

  if (loading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }
  if (error || !ensotekprod) {
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );
  }

  const otherProducts = allProducts
    ?.filter((item: IEnsotekprod) => item.slug !== slug)
    .slice(0, 2);

  // Teknik özellikler
  const TECHNICAL = [
    { label: t("page.material", "Malzeme"), value: ensotekprod.material, icon: "🔩" },
    { label: t("page.size", "Ebat/Ölçü"), value: ensotekprod.size, icon: "📏" },
    { label: t("page.weight", "Ağırlık"), value: ensotekprod.weightKg ? `${ensotekprod.weightKg} kg` : null, icon: "⚖️" },
    { label: t("page.powerW", "Motor Gücü"), value: ensotekprod.powerW ? `${ensotekprod.powerW} W` : null, icon: "🔌" },
    { label: t("page.voltageV", "Voltaj"), value: ensotekprod.voltageV ? `${ensotekprod.voltageV} V` : null, icon: "⚡" },
    { label: t("page.flowRateM3H", "Debi"), value: ensotekprod.flowRateM3H ? `${ensotekprod.flowRateM3H} m³/h` : null, icon: "💧" },
    { label: t("page.coolingCapacityKw", "Soğutma Kapasitesi"), value: ensotekprod.coolingCapacityKw ? `${ensotekprod.coolingCapacityKw} kW` : null, icon: "❄️" },
    { label: t("page.batteryRangeKm", "Batarya Menzili"), value: ensotekprod.batteryRangeKm ? `${ensotekprod.batteryRangeKm} km` : null, icon: "🔋" },
    { label: t("page.motorPowerW", "Motor Gücü (Elektrik)"), value: ensotekprod.motorPowerW ? `${ensotekprod.motorPowerW} W` : null, icon: "🚴" },
    { label: t("page.color", "Renkler"), value: ensotekprod.color?.length ? ensotekprod.color.join(", ") : null, icon: "🎨" },
  ];

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{ensotekprod.name[lang]}</Title>

      {/* ANA GÖRSEL VE THUMBNAIL */}
      {images.length > 0 && (
        <>
          <MainImageWrapper>
            <MainImage
              src={images[mainPhoto].url}
              alt={ensotekprod.name[lang] + `-img${mainPhoto + 1}`}
              onClick={() => setOpenModal(true)}
              tabIndex={0}
              role="button"
              aria-label={t("detail.openImage", "Büyüt")}
              style={{ cursor: "zoom-in" }}
            />
          </MainImageWrapper>
          {/* --- MODAL (ANA RESİM) --- */}
          {openModal && (
            <Modal
              isOpen={openModal}
              onClose={() => setOpenModal(false)}
              onNext={totalImages > 1 ? goNext : undefined}
              onPrev={totalImages > 1 ? goPrev : undefined}
            >
              <div style={{ textAlign: "center", padding: 0 }}>
                <Image
                  src={images[mainPhoto].url}
                  alt={ensotekprod.name[lang] + "-big"}
                  width={1024}
                  height={720}
                  style={{
                    maxWidth: "94vw",
                    maxHeight: "80vh",
                    borderRadius: 12,
                    boxShadow: "0 6px 42px #2225",
                    background: "#111",
                    width: "auto",
                    height: "auto",
                  }}
                  sizes="(max-width: 800px) 90vw, 800px"
                />
                <div style={{ marginTop: 10, color: "#666", fontSize: 16 }}>
                  {ensotekprod.name?.[lang]}
                </div>
              </div>
            </Modal>
          )}
          <Thumbnails>
            {images.map((img, idx) => (
              <ThumbWrapper
                key={idx}
                $active={mainPhoto === idx}
                onClick={() => setMainPhoto(idx)}
                tabIndex={0}
                aria-label={t("detail.thumb", `Küçük resim ${idx + 1}`)}
              >
                <Thumb src={img.url} alt={`thumb-${idx + 1}`} />
              </ThumbWrapper>
            ))}
          </Thumbnails>
        </>
      )}

      {/* KATEGORİ VE STOK */}
      <MetaInfo>
        <MetaItem>
          <b>{t("page.brand", "Marka")}:</b> {ensotekprod.brand}
        </MetaItem>
        <MetaItem>
          <b>{t("page.category", "Kategori")}:</b>{" "}
          {typeof ensotekprod.category === "object"
            ? ensotekprod.category.name[lang]
            : "-"}
        </MetaItem>
        <MetaItem>
          <b>{t("page.price", "Fiyat")}:</b> {ensotekprod.price} €
        </MetaItem>
        <MetaItem>
          <b>{t("page.stockStatus", "Stok Durumu")}:</b>
          {ensotekprod.stock > 0 ? (
            <StockBadge $inStock>
              <CheckCircle size={18} style={{ marginRight: 3, marginBottom: -2 }} />
              {t("page.inStock", "Stokta Var")}
            </StockBadge>
          ) : (
            <StockBadge $inStock={false}>
              <XCircle size={18} style={{ marginRight: 3, marginBottom: -2 }} />
              {t("page.outOfStock", "Stokta Yok")}
            </StockBadge>
          )}
        </MetaItem>
        <MetaItem>
          <b>{t("page.isElectric", "Elektrikli mi?")}:</b>{" "}
          {ensotekprod.isElectric ? t("yes", "Evet") : t("no", "Hayır")}
        </MetaItem>
        {ensotekprod.tags?.length ? (
          <MetaItem>
            <b>{t("page.tags", "Etiketler")}:</b>{" "}
            {ensotekprod.tags.map((tag, i) => (
              <Tag key={i}>#{tag}</Tag>
            ))}
          </MetaItem>
        ) : null}
      </MetaInfo>

      {/* TANIM VE TEKNİK ÖZELLİKLER */}
      <Description>
        <div dangerouslySetInnerHTML={{ __html: ensotekprod.description[lang] }} />
      </Description>

      <TechnicalBlock>
        <h3>{t("page.technicalDetails", "Teknik Özellikler")}</h3>
        <ul>
          {TECHNICAL.filter((row) => !!row.value).map((row, idx) => (
            <li key={idx}>
              <span style={{ fontWeight: "bold", marginRight: 4 }}>{row.icon}</span>
              <b>{row.label}:</b> <span>{row.value}</span>
            </li>
          ))}
        </ul>
      </TechnicalBlock>

      {/* Diğer içerikler */}
      {otherProducts?.length > 0 && (
        <OtherSection>
          <OtherTitle>{t("page.other", "Diğer Hakkımızda İçerikleri")}</OtherTitle>
          <OtherGrid>
            {otherProducts.map((item: IEnsotekprod) => (
              <OtherCard key={item._id} as={motion.div} whileHover={{ y: -6, scale: 1.025 }}>
                <OtherImgWrap>
                  {item.images?.[0]?.url ? (
                    <OtherImg
                      src={item.images[0].url}
                      alt={item.name?.[lang] || "Untitled"}
                      width={60}
                      height={40}
                    />
                  ) : (
                    <OtherImgPlaceholder />
                  )}
                </OtherImgWrap>
                <OtherTitleMini>
                  <Link href={`/ensotekprod/${item.slug}`}>
                    {item.name?.[lang] || "Untitled"}
                  </Link>
                </OtherTitleMini>
              </OtherCard>
            ))}
          </OtherGrid>
        </OtherSection>
      )}

      {/* YORUM BÖLÜMÜ */}
      <CommentForm contentId={ensotekprod._id} contentType="ensotekprod" />
      <CommentList contentId={ensotekprod._id} contentType="ensotekprod" />
    </Container>
  );
}

// Styled Components (değişmedi, kopyaladım)
const Container = styled(motion.section)`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const MainImageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const MainImage = styled.img`
  width: 420px;
  max-width: 98vw;
  height: 320px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  cursor: zoom-in;
  background: ${({ theme }) => theme.colors.backgroundAlt || "#1a1a1a"};
  @media (max-width: 600px) {
    width: 100%;
    height: 180px;
  }
`;

const Thumbnails = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  justify-content: center;
  flex-wrap: wrap;
`;

const ThumbWrapper = styled.div<{ $active: boolean }>`
  border: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : "transparent")};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ theme, $active }) => ($active ? theme.shadows.md : "none")};
  padding: 2px;
  cursor: pointer;
  opacity: ${({ $active }) => ($active ? 1 : 0.8)};
  transition: border 0.2s, box-shadow 0.2s, opacity 0.2s;
`;

const Thumb = styled.img`
  width: 72px;
  height: 52px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt || "#1a1a1a"};
  @media (max-width: 600px) {
    width: 48px;
    height: 36px;
  }
`;

const Description = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.7;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
`;

const TechnicalBlock = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt || "#f7f7fa"};
  margin: ${({ theme }) => theme.spacings.lg} 0 ${({ theme }) => theme.spacings.xl} 0;
  padding: 1.1rem 1.3rem 1.4rem 1.3rem;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.md};
    margin-bottom: 0.7rem;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }
  li {
    margin-bottom: 0.42em;
    display: flex;
    align-items: center;
    gap: 0.6em;
    font-size: ${({ theme }) => theme.fontSizes.base};
  }
`;

const MetaInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.tagBackground || "#eee"};
  color: ${({ theme }) => theme.colors.primary};
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  margin-right: 0.3em;
  margin-bottom: 0.15em;
`;

const StockBadge = styled.span<{ $inStock?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  margin-left: 8px;
  font-size: 0.97em;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 3px 14px 3px 9px;
  margin-top: 0.08em;
  background: ${({ $inStock, theme }) =>
    $inStock
      ? theme.colors.successBg || "#d1f5dd"
      : theme.colors.dangerBg || "#ffe3e3"};
  color: ${({ $inStock, theme }) =>
    $inStock
      ? theme.colors.success || "#28C76F"
      : theme.colors.danger || "#FF6B6B"};
  box-shadow: 0 2px 8px ${({ $inStock }) =>
    $inStock
      ? "rgba(40, 199, 111, 0.07)"
      : "rgba(255, 107, 107, 0.10)"};
  letter-spacing: 0.02em;
  transition: background 0.2s, color 0.2s;
  svg {
    margin-right: 3px;
    vertical-align: middle;
  }
`;

const OtherSection = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xxl};
  border-top: 1.5px solid ${({ theme }) => theme.colors.borderLight};
  padding-top: ${({ theme }) => theme.spacings.lg};
`;

const OtherTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const OtherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem 1.8rem;
  margin-top: 0.7rem;
`;

const OtherCard = styled(motion.div)`
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

const OtherImgWrap = styled.div`
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

const OtherImg = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.radii.md};
`;

const OtherImgPlaceholder = styled.div`
  width: 60px;
  height: 40px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.36;
  border-radius: ${({ theme }) => theme.radii.md};
`;

const OtherTitleMini = styled.div`
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
