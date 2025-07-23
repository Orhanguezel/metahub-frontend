"use client";

import { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import translations from "@/modules/library/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import Link from "next/link";
import Image from "next/image";
import { Skeleton, ErrorMessage } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearLibraryMessages,
  fetchLibraryBySlug,
  setSelectedLibrary,
} from "@/modules/library/slice/librarySlice";
import type { ILibrary } from "@/modules/library";
import { SupportedLocale } from "@/types/common";
import Modal from "@/modules/home/public/components/Modal";

// Çoklu dil fallback için güvenli fonksiyon
const getMultiLang = (obj: Record<string, string> | undefined, lang: SupportedLocale) =>
  obj?.[lang] || obj?.en || obj?.tr || Object.values(obj || {})[0] || "—";

export default function LibraryDetailSection() {
  const { i18n, t } = useI18nNamespace("library", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { slug } = useParams() as { slug: string };
  const dispatch = useAppDispatch();

  Object.entries(translations).forEach(([locale, resources]) => {
    if (!i18n.hasResourceBundle(locale, "library")) {
      i18n.addResourceBundle(locale, "library", resources, true, true);
    }
  });

  const {
    selected: library,
    library: allLibrary,
    loading,
    error,
  } = useAppSelector((state) => state.library);

  // Görsel state'leri
  const images = Array.isArray(library?.images) ? library.images : [];
  const totalImages = images.length;
  const [mainIndex, setMainIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  const goNext = useCallback(() => {
    setMainIndex((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const goPrev = useCallback(() => {
    setMainIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  // Modal açıkken klavye navigasyonu
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

  // Slug'dan seçili içeriği bul
  useEffect(() => {
    if (Array.isArray(allLibrary) && allLibrary.length > 0) {
      const found = allLibrary.find((item: ILibrary) => item.slug === slug);
      if (found) {
        dispatch(setSelectedLibrary(found));
      } else {
        dispatch(fetchLibraryBySlug(slug));
      }
    } else {
      dispatch(fetchLibraryBySlug(slug));
    }
    setMainIndex(0); // Farklı içeriğe geçtiğinde ana görsel sıfırla
    return () => {
      dispatch(clearLibraryMessages());
    };
  }, [dispatch, allLibrary, slug]);

  if (loading) {
    return (
      <Container>
        <Skeleton />
      </Container>
    );
  }

  if (error || !library) {
    return (
      <Container>
        <ErrorMessage message={error ?? t("library.error", "İçerik bulunamadı")} />
      </Container>
    );
  }

  function formatText(txt: string | undefined) {
    if (!txt) return "";
    return txt.replace(/\\n/g, '\n');
  }

  // Mevcut slug harici diğer içerikler
  const otherLibrary = Array.isArray(allLibrary)
    ? allLibrary.filter((item: ILibrary) => item.slug !== slug)
    : [];

  const mainImage = images[mainIndex];

  return (
    <Container
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.57 }}
    >
      {/* Başlık */}
      <Title>{getMultiLang(library.title, lang)}</Title>

      {/* Ana görsel ve thumbnails */}
      {mainImage?.url && (
        <ImageSection>
          <MainImageFrame>
            <StyledMainImage
              src={mainImage.url}
              alt={getMultiLang(library.title, lang)}
              width={900}
              height={420}
              priority
              style={{ cursor: "zoom-in" }}
              onClick={() => setOpenModal(true)}
              tabIndex={0}
              role="button"
              aria-label={t("detail.openImage", "Büyüt")}
            />
          </MainImageFrame>
          {/* Modal */}
          {openModal && (
            <Modal
              isOpen={openModal}
              onClose={() => setOpenModal(false)}
              onNext={totalImages > 1 ? goNext : undefined}
              onPrev={totalImages > 1 ? goPrev : undefined}
            >
              <div style={{ textAlign: "center", padding: 0 }}>
                <Image
                  src={mainImage.url}
                  alt={getMultiLang(library.title, lang) + "-big"}
                  width={1280}
                  height={720}
                  style={{
                    maxWidth: "94vw",
                    maxHeight: "80vh",
                    borderRadius: 12,
                    boxShadow: "0 6px 42px #2225",
                    background: "#111",
                    width: "auto",
                    height: "auto"
                  }}
                  sizes="(max-width: 800px) 90vw, 1280px"
                />
                <div style={{ marginTop: 10, color: "#666", fontSize: 16 }}>
                  {getMultiLang(library.title, lang)}
                </div>
              </div>
            </Modal>
          )}
          {/* Thumbnail Galeri */}
          {images.length > 1 && (
            <Gallery>
              {images.map((img, i) => (
                <ThumbFrame
                  key={img.url + i}
                  $active={mainIndex === i}
                  onClick={() => setMainIndex(i)}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setMainIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                >
                  <StyledThumbImage
                    src={img.url}
                    alt={`${getMultiLang(library.title, lang)} thumbnail ${i + 1}`}
                    width={168}
                    height={96}
                    $active={mainIndex === i}
                  />
                </ThumbFrame>
              ))}
            </Gallery>
          )}
        </ImageSection>
      )}

      {/* Özet */}
      {library.summary && getMultiLang(library.summary, lang) && (
        <SummaryBox>
          <ReactMarkdown>
            {formatText(getMultiLang(library.summary, lang))}
          </ReactMarkdown>
        </SummaryBox>
      )}

      {/* Ana içerik */}
      {library.content && getMultiLang(library.content, lang) && (
        <ContentBox>
          <ReactMarkdown>
            {formatText(getMultiLang(library.content, lang))}
          </ReactMarkdown>
        </ContentBox>
      )}

      {/* Diğer içerikler */}
      {otherLibrary.length > 0 && (
        <OtherSection>
          <OtherTitle>{t("page.other", "Diğer Hakkımızda İçerikleri")}</OtherTitle>
          <OtherGrid>
            {otherLibrary.map((item: ILibrary) => (
              <OtherCard key={item._id} as={motion.div} whileHover={{ y: -6, scale: 1.025 }}>
                <OtherImgWrap>
                  {Array.isArray(item.images) && item.images[0]?.url ? (
                    <OtherImg
                      src={item.images[0].url}
                      alt={getMultiLang(item.title, lang)}
                      width={60}
                      height={40}
                    />
                  ) : (
                    <OtherImgPlaceholder />
                  )}
                </OtherImgWrap>
                <OtherTitleMini>
                  <Link href={`/library/${item.slug}`}>
                    {getMultiLang(item.title, lang)}
                  </Link>
                </OtherTitleMini>
              </OtherCard>
            ))}
          </OtherGrid>
        </OtherSection>
      )}
    </Container>
  );
}

// --- Styled Components (Thumbnail Gallery + Modal destekli) ---

const Container = styled(motion.section)`
  max-width: 950px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md};
  @media (max-width: 650px) {
    padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.xs};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  text-align: center;
  letter-spacing: 0.01em;
`;

const ImageSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.xl};
`;

const MainImageFrame = styled.div`
  width: 100%;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #e7edf3;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const StyledMainImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Gallery = styled.div`
  margin-top: 1.15rem;
  display: flex;
  gap: 1.05rem;
  flex-wrap: wrap;
`;

const ThumbFrame = styled.button<{ $active?: boolean }>`
  border: none;
  background: none;
  padding: 0;
  outline: none;
  cursor: pointer;
  width: 168px;
  height: 96px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #eef5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.15s, border 0.17s;
  border: 2.3px solid #e1e8ef;

  &:hover, &:focus-visible {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 5px 18px 0 rgba(40,117,194,0.13);
    outline: none;
  }
`;

const StyledThumbImage = styled(Image)<{ $active?: boolean }>`
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
`;

const SummaryBox = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-left: 5px solid ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.spacings.xl} ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const ContentBox = styled.div`
  background: ${({ theme }) => theme.colors.contentBackground};
  padding: ${({ theme }) => theme.spacings.xl};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border-left: 6px solid ${({ theme }) => theme.colors.primary};
  line-height: 1.73;
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: 0.01em;

  h3 {
    margin-bottom: ${({ theme }) => theme.spacings.md};
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
  p, div {
    margin-bottom: ${({ theme }) => theme.spacings.sm};
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
