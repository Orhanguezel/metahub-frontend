"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/about/locales";
import Image from "next/image";
import { Skeleton, ErrorMessage } from "@/shared";
import type { SupportedLocale } from "@/types/common";
import Masonry from "react-masonry-css";
import Modal from "@/modules/home/public/components/Modal"; // ✅

export default function AboutDetailPage() {
  const { id } = useParams() as { id: string };
  const { i18n, t } = useI18nNamespace("about", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { about, loading, error } = useAppSelector((s) => s.about);
  const item = about?.find((a) => a._id === id);

  // --- Galeri modal state ---
  const [openModal, setOpenModal] = useState(false);
  const [modalIdx, setModalIdx] = useState(0);

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "about")) {
      i18n.addResourceBundle(lng, "about", resources, true, true);
    }
  });

  if (loading) {
    return (
      <PageWrapper>
        <Skeleton />
      </PageWrapper>
    );
  }

  if (error || !item) {
    return (
      <PageWrapper>
        <ErrorMessage message={error || t("page.noAbout", "İçerik bulunamadı")} />
      </PageWrapper>
    );
  }

  // İlk görsel kapak, kalanlar galeri
  const [coverImg, ...galleryImgs] = item.images ?? [];
  const totalImages = galleryImgs.length;

  // Modal ileri/geri
  const goNext = () => setModalIdx((idx) => (idx + 1) % totalImages);
  const goPrev = () => setModalIdx((idx) => (idx - 1 + totalImages) % totalImages);

  return (
    <PageWrapper>
      {/* HERO BÖLÜMÜ */}
      <HeroSection>
        {coverImg && (
          <HeroImage>
            <Image
              src={coverImg.url}
              alt={item.title?.[lang] || "about"}
              fill
              priority
              style={{ objectFit: "cover" }}
            />
          </HeroImage>
        )}
        <HeroText>
          <Title>{item.title?.[lang] || item.title?.tr || item.title?.en || "—"}</Title>
          <Summary>{item.summary?.[lang] || item.summary?.tr || item.summary?.en || "—"}</Summary>
        </HeroText>
      </HeroSection>

      {/* TAM İÇERİK */}
      <Content
        dangerouslySetInnerHTML={{
          __html: item.content?.[lang] || item.content?.tr || item.content?.en || "—",
        }}
      />

      {/* GALERİ - DİĞER TÜM GÖRSELLER */}
      {galleryImgs.length > 0 && (
        <GallerySection>
          <MasonryGallery
            breakpointCols={{ default: 3, 1024: 2, 640: 1 }}
            className="masonry-grid"
            columnClassName="masonry-column"
          >
            {galleryImgs.map((img, i) => (
              <ImgWrap key={img._id || i} onClick={() => { setModalIdx(i); setOpenModal(true); }}>
                <StyledImage
                  src={img.url}
                  alt={`about-img-${i + 1}`}
                  width={600}
                  height={400}
                  loading="lazy"
                  style={{ cursor: "pointer" }}
                />
              </ImgWrap>
            ))}
          </MasonryGallery>

          {/* Modal büyük görsel */}
          {openModal && galleryImgs[modalIdx] && (
            <Modal
              isOpen={openModal}
              onClose={() => setOpenModal(false)}
              onNext={totalImages > 1 ? goNext : undefined}
              onPrev={totalImages > 1 ? goPrev : undefined}
            >
              <ModalImageWrap>
                <Image
                  src={galleryImgs[modalIdx].url}
                  alt={`about-modal-img-${modalIdx + 1}`}
                  width={1100}
                  height={700}
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "80vh",
                    objectFit: "contain",
                    borderRadius: "16px",
                  }}
                />
              </ModalImageWrap>
            </Modal>
          )}
        </GallerySection>
      )}
    </PageWrapper>
  );
}

// --- STYLES ---
const PageWrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md};
`;

const HeroSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2.4rem;
  margin-bottom: 2.6rem;

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    gap: 1.6rem;
  }
`;

const HeroImage = styled.div`
  flex: 1 1 360px;
  max-width: 340px;
  aspect-ratio: 16 / 12;
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  position: relative;
  min-width: 260px;
  min-height: 210px;
  background: ${({ theme }) => theme.colors.backgroundAlt};

  ${({ theme }) => theme.media.small} {
    width: 100%;
    max-width: 100%;
    min-width: unset;
  }
`;

const HeroText = styled.div`
  flex: 2 1 480px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  ${({ theme }) => theme.media.small} {
    align-items: center;
    text-align: center;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-family: ${({ theme }) => theme.fonts.heading};
  margin-bottom: 0.4rem;
`;

const Summary = styled.p`
  font-size: 1.18rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  max-width: 650px;
  margin: 0;
`;

const Content = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.85;
  max-width: 880px;
  margin: 0 auto 3.5rem auto;
  padding: 0 1.2rem;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  & img {
    max-width: 100%;
    border-radius: ${({ theme }) => theme.radii.md};
    margin: 1.6rem 0;
  }
`;

const GallerySection = styled.div`
  margin: 3.2rem auto 0 auto;
`;

const MasonryGallery = styled(Masonry)`
  display: flex;
  margin-left: -1.2rem;

  .masonry-column {
    padding-left: 1.2rem;
    background-clip: padding-box;
  }

  & .masonry-column > div {
    margin-bottom: 1.2rem;
  }
`;

const ImgWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  cursor: pointer;
  transition: box-shadow 0.18s;
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.xl};
    filter: brightness(0.98);
  }
`;

const StyledImage = styled(Image)`
  object-fit: cover;
  width: 100%;
  height: 100%;
`;

const ModalImageWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 320px;
  min-height: 180px;
  width: 100%;
  height: 100%;
  max-width: 95vw;
  max-height: 80vh;
  background: transparent;
`;

