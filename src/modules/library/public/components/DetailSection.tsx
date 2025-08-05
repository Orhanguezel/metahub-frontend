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

  function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
      <Title>{library.title?.[lang] || "Untitled"}</Title>

      {/* Ana görsel ve thumbnails */}
      {mainImage?.url && (
        <ImageSection>
          <MainImageFrame>
            <StyledMainImage
              src={mainImage.url}
              alt={library.title?.[lang] || "Untitled"}
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
                  alt={library.title?.[lang] + "-big" || "Untitled"}
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
                  {library.title?.[lang] || "Untitled"}
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
                    alt={`${library.title?.[lang] || "Untitled"} thumbnail ${i + 1}`}
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
      {library.summary && (library.summary?.[lang] || library.summary?.en || library.summary?.tr) && (
        <SummaryBox>
          <ReactMarkdown>
            {formatText(library.summary?.[lang] || library.summary?.en || library.summary?.tr)}
          </ReactMarkdown>
        </SummaryBox>
      )}

      {library.content && (library.content?.[lang] || library.content?.en || library.content?.tr) && (
  <ContentBox>
    <ReactMarkdown>
      {formatText(library.content?.[lang] || library.content?.en || library.content?.tr)}
    </ReactMarkdown>
    {/* --- EK: Dökümanlar Alanı --- */}
    {Array.isArray(library.files) && library.files.length > 0 && (
      <FilesSection>
        <FilesTitle>{t("detail.documents", "İlgili Dökümanlar")}</FilesTitle>
        <FilesGrid>
          {library.files.map((file) => (
            <FileCard key={file.url}>
              <FileIconWrap>
                {file.type?.includes("pdf") ? (
                  <PdfIcon>📄</PdfIcon>
                ) : (
                  <FileIcon>📎</FileIcon>
                )}
              </FileIconWrap>
              <FileInfo>
                <FileName title={file.name}>{file.name}</FileName>
                <FileMeta>
                  {file.type || "Dosya"}
                  {file.size ? ` • ${formatFileSize(file.size)}` : ""}
                </FileMeta>
              </FileInfo>
              <DownloadBtn
  href={file.url}
  download={file.name}
  target="_blank"
  rel="noopener noreferrer"
>
  {t("detail.download", "İndir")}
</DownloadBtn>

            </FileCard>
          ))}
        </FilesGrid>
      </FilesSection>
    )}
  </ContentBox>
)}


      {/* Diğer içerikler */}
      {otherLibrary.length > 0 && (
        <OtherSection>
          <OtherTitle>{t("page.other", "Diğer Kütüphane  İçerikleri")}</OtherTitle>
          <OtherGrid>
            {otherLibrary.map((item: ILibrary) => (
              <OtherCard key={item._id} as={motion.div} whileHover={{ y: -6, scale: 1.025 }}>
                <OtherImgWrap>
                  {Array.isArray(item.images) && item.images[0]?.url ? (
                    <OtherImg
                      src={item.images[0].url}
                      alt={item.title?.[lang] || "Untitled"}
                      width={60}
                      height={40}
                    />
                  ) : (
                    <OtherImgPlaceholder />
                  )}
                </OtherImgWrap>
                <OtherTitleMini>
                  <Link href={`/library/${item.slug}`}>
                    {item.title?.[lang] || "Untitled"}
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
  background: ${({ theme }) => theme.colors.background};
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
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.md};
  border-radius: ${({ theme }) => theme.radii.xl};
  position: relative;
`;

const StyledMainImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain !important;
  object-position: center center;
  aspect-ratio: 16 / 9 !important;
  background: transparent;
  border-radius: ${({ theme }) => theme.radii.xl};
`;

const Gallery = styled.div`
  margin-top: ${({ theme }) => theme.spacings.md};
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
`;

const ThumbFrame = styled.button<{ $active?: boolean }>`
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: 0;
  outline: none;
  cursor: pointer;
  width: 168px;
  height: 96px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ $active, theme }) => $active ? theme.shadows.md : theme.shadows.xs};
  border-radius: ${({ theme }) => theme.radii.lg};
  transition:
    border ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
    outline: none;
  }
`;

const StyledThumbImage = styled(Image)<{ $active?: boolean }>`
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  aspect-ratio: 16 / 9 !important;
  background: transparent;
  border-radius: ${({ theme }) => theme.radii.lg};
  display: block;
`;

const SummaryBox = styled.div`
  background: ${({ theme }) => theme.cards.background};
  border-left: 5px solid ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.spacings.xl} ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const ContentBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacings.xl};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border-left: 6px solid ${({ theme }) => theme.colors.primary};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
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

const FilesSection = styled.div`
  margin-top: ${({ theme }) => theme.spacings.lg};
  padding: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.cards.background};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const FilesTitle = styled.h4`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const FilesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.md};
`;

const FileCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: ${({ theme }) => theme.spacings.sm} ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  min-width: 0;
`;

const FileIconWrap = styled.div`
  font-size: 2.1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const PdfIcon = styled.span`
  font-size: 2.1rem;
`;

const FileIcon = styled.span`
  font-size: 2.1rem;
`;

const FileInfo = styled.div`
  min-width: 0;
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 500;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 160px;
`;

const FileMeta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DownloadBtn = styled.a`
  margin-left: ${({ theme }) => theme.spacings.sm};
  padding: 6px 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  text-decoration: none;
  transition: background 0.18s;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: #fff;
  }
`;
