"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import { translations } from "@/modules/sparepart";
import translations2 from "@/modules/cart/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { getMultiLang, type SupportedLocale } from "@/types/common";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSparepartBySlug,
  setSelectedSparepart,
  clearSparepartMessages,
} from "@/modules/sparepart/slice/sparepartSlice";
import { clearCartMessages } from "@/modules/cart/slice/cartSlice";
import { Skeleton, ErrorMessage, AddToCartButton } from "@/shared";
import { CommentForm, CommentList } from "@/modules/comment";
import { ShoppingCart } from "lucide-react";
import type { ISparepart } from "@/modules/sparepart/types";
import { XCircle, CheckCircle } from "lucide-react";

const Lightbox = dynamic(() => import("react-image-lightbox"), { ssr: false });


export default function SparepartDetailSection() {
  const { slug } = useParams() as { slug: string };
  const { i18n, t } = useI18nNamespace("sparepart", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { t: tCart } = useI18nNamespace("cart", translations2);
  const dispatch = useAppDispatch();

  const {
    selected: sparepart,
    sparepart: allProducts,
    loading,
    error,
  } = useAppSelector((state) => state.sparepart);

  const [mainPhoto, setMainPhoto] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      const found = allProducts.find((item: ISparepart) => item.slug === slug);
      if (found) {
        dispatch(setSelectedSparepart(found));
      } else {
        dispatch(fetchSparepartBySlug(slug));
      }
    } else {
      dispatch(fetchSparepartBySlug(slug));
    }
    return () => {
      dispatch(clearSparepartMessages());
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
  if (error || !sparepart) {
    return (
      <Container>
        <ErrorMessage />
      </Container>
    );
  }

  const otherProducts = allProducts
    ?.filter((item: ISparepart) => item.slug !== slug)
    .slice(0, 2);

  // Teknik özellikleri ve opsiyonelleri tek yerde topluyoruz:
  const TECHNICAL = [
    {
      label: t("page.material", "Malzeme"),
      value: sparepart.material,
      icon: "🔩",
    },
    {
      label: t("page.size", "Ebat/Ölçü"),
      value: sparepart.size,
      icon: "📏",
    },
    {
      label: t("page.weight", "Ağırlık"),
      value: sparepart.weightKg ? `${sparepart.weightKg} kg` : null,
      icon: "⚖️",
    },
    {
      label: t("page.powerW", "Motor Gücü"),
      value: sparepart.powerW ? `${sparepart.powerW} W` : null,
      icon: "🔌",
    },
    {
      label: t("page.voltageV", "Voltaj"),
      value: sparepart.voltageV ? `${sparepart.voltageV} V` : null,
      icon: "⚡",
    },
    {
      label: t("page.flowRateM3H", "Debi"),
      value: sparepart.flowRateM3H ? `${sparepart.flowRateM3H} m³/h` : null,
      icon: "💧",
    },
    {
      label: t("page.coolingCapacityKw", "Soğutma Kapasitesi"),
      value: sparepart.coolingCapacityKw ? `${sparepart.coolingCapacityKw} kW` : null,
      icon: "❄️",
    },
    {
      label: t("page.batteryRangeKm", "Batarya Menzili"),
      value: sparepart.batteryRangeKm ? `${sparepart.batteryRangeKm} km` : null,
      icon: "🔋",
    },
    {
      label: t("page.motorPowerW", "Motor Gücü (Elektrik)"),
      value: sparepart.motorPowerW ? `${sparepart.motorPowerW} W` : null,
      icon: "🚴",
    },
    {
      label: t("page.color", "Renkler"),
      value: sparepart.color?.length ? sparepart.color.join(", ") : null,
      icon: "🎨",
    },
  ];

  return (
    <Container
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title>{sparepart.name?.[lang]}</Title>

      {/* GÖRSELLER */}
      {sparepart.images?.length > 0 && (
        <>
          <MainImageWrapper>
            <MainImage
              src={sparepart.images[mainPhoto].url}
              alt={`sparepart-img${mainPhoto + 1}`}
              onClick={() => setIsOpen(true)}
              tabIndex={0}
              role="button"
              aria-label={t("detail.openImage", "Büyüt")}
            />
          </MainImageWrapper>
          <Thumbnails>
            {sparepart.images.map((img, idx) => (
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
    <b>{t("page.brand", "Marka")}:</b> {sparepart.brand}
  </MetaItem>
  <MetaItem>
    <b>{t("page.category", "Kategori")}:</b>{" "}
    {typeof sparepart.category === "object"
      ? getMultiLang(sparepart.category.name, lang)
      : "-"}
  </MetaItem>
  <MetaItem>
    <b>{t("page.price", "Fiyat")}:</b> {sparepart.price} €
  </MetaItem>
  {/* STOK DURUMU */}
  <MetaItem>
  <b>{t("page.stockStatus", "Stok Durumu")}:</b>
  {sparepart.stock > 0 ? (
    <StockBadge $inStock>
      <CheckCircle size={18} style={{marginRight: 3, marginBottom: -2}} />
      {t("page.inStock", "Stokta Var")}
    </StockBadge>
  ) : (
    <StockBadge $inStock={false}>
      <XCircle size={18} style={{marginRight: 3, marginBottom: -2}} />
      {t("page.outOfStock", "Stokta Yok")}
    </StockBadge>
  )}
</MetaItem>

  <MetaItem>
    <b>{t("page.isElectric", "Elektrikli mi?")}:</b>{" "}
    {sparepart.isElectric ? t("yes", "Evet") : t("no", "Hayır")}
  </MetaItem>
  {sparepart.tags?.length ? (
    <MetaItem>
      <b>{t("page.tags", "Etiketler")}:</b>{" "}
      {sparepart.tags.map((tag, i) => (
        <Tag key={i}>#{tag}</Tag>
      ))}
    </MetaItem>
  ) : null}
</MetaInfo>

      {/* TANIM VE TEKNİK ÖZELLİKLER */}
      <Description>
        <div dangerouslySetInnerHTML={{ __html: getMultiLang(sparepart.description, lang) }} />
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

      {/* SEPET BUTONU */}
      <AddToCartButton
  productId={sparepart._id}
  productType="Sparepart"        // <-- BURASI ÖNEMLİ
  disabled={sparepart.stock < 1}
>
  <ShoppingCart size={22} style={{ marginRight: 8, marginBottom: -3 }} />
  <span>
    {sparepart.stock < 1
      ? tCart("outOfStock", "Stok Yok")
      : tCart("add", "Sepete Ekle")}
  </span>
</AddToCartButton>


      {/* DİĞER ÜRÜNLER */}
      {otherProducts?.length > 0 && (
        <OtherProduct>
          <h3>{t("page.other", "Diğer Ürünler")}</h3>
          <ProductList>
            {otherProducts.map((item: ISparepart) => (
              <ProductItem key={item._id}>
                <Link href={`/sparepart/${item.slug}`}>{getMultiLang(item.name, lang)}</Link>
              </ProductItem>
            ))}
          </ProductList>
        </OtherProduct>
      )}

      {/* YORUM BÖLÜMÜ */}
      <CommentForm contentId={sparepart._id} contentType="sparepart" />
      <CommentList contentId={sparepart._id} contentType="sparepart" />

      {/* Lightbox modal */}
      {isOpen && sparepart.images?.length > 0 && (
        <Lightbox
          mainSrc={sparepart.images[mainPhoto].url}
          nextSrc={sparepart.images[(mainPhoto + 1) % sparepart.images.length].url}
          prevSrc={
            sparepart.images[
              (mainPhoto + sparepart.images.length - 1) % sparepart.images.length
            ].url
          }
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setMainPhoto(
              (mainPhoto + sparepart.images.length - 1) % sparepart.images.length
            )
          }
          onMoveNextRequest={() =>
            setMainPhoto((mainPhoto + 1) % sparepart.images.length)
          }
          imageCaption={getMultiLang(sparepart.name, lang)}
        />
      )}
    </Container>
  );
}

// --- STYLED COMPONENTS ---
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

const OtherProduct = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xxl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacings.lg};
`;

const ProductList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const ProductItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.base};
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
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


