"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/about/locales";
import Image from "next/image";
import { Skeleton, ErrorMessage } from "@/shared";
import type { SupportedLocale } from "@/types/common";
import Masonry from "react-masonry-css";
import Modal from "@/modules/home/public/components/Modal";
import type { IAbout } from "../..";

/* ===================== PAGE ===================== */

export default function AboutUsPage() {
  const { i18n, t } = useI18nNamespace("about", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { about, loading, error } = useAppSelector((s) => s.about);

  // SSR hydration için resources ekle
  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "about")) {
      i18n.addResourceBundle(lng, "about", resources, true, true);
    }
  });

  // 👇 TFunction → (k: string, d?: string) => string sarmalayıcı
  const tSimple = (k: string, d?: string) => t(k, { defaultValue: d });

  if (loading) {
    return (
      <PageWrapper>
        <Skeleton />
        <Skeleton />
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

  if (!Array.isArray(about) || about.length === 0) {
    return (
      <PageWrapper>
        <ErrorMessage message={tSimple("page.noAbout", "İçerik bulunamadı")} />
      </PageWrapper>
    );
  }

  // Hepsini alt alta göster — önce 'order' sonra tarihe göre
  const items: IAbout[] = [...about].sort((a, b) => {
    const ao = (a as any).order ?? 9999;
    const bo = (b as any).order ?? 9999;
    if (ao !== bo) return ao - bo;
    const ad = new Date((a as any).publishedAt || (a as any).createdAt).getTime();
    const bd = new Date((b as any).publishedAt || (b as any).createdAt).getTime();
    return bd - ad;
  });

  return (
    <PageWrapper>
      {items.map((it) => (
        <AboutBlock
          key={String(it._id || it.slug)}
          item={it}
          lang={lang}
          t={tSimple}   // 👈 burada sarmalayıcıyı gönderiyoruz
        />
      ))}
    </PageWrapper>
  );
}

/* =============== SINGLE BLOCK (one item) =============== */

function AboutBlock({
  item,
  lang,
  t,
}: {
  item: IAbout;
  lang: SupportedLocale;
  t: (k: string, d?: string) => string; // beklenen imza
}) {
  const [openModal, setOpenModal] = useState(false);
  const [modalIdx, setModalIdx] = useState(0);

  const [coverImg, ...galleryImgs] = item.images ?? [];
  const totalImages = galleryImgs.length;

  const goNext = () => setModalIdx((idx) => (idx + 1) % totalImages);
  const goPrev = () => setModalIdx((idx) => (idx - 1 + totalImages) % totalImages);

  // İçerik – ilk paragrafı ayır
  const contentHtml = item.content?.[lang] || item.content?.tr || item.content?.en || "—";
  let intro = "";
  let restContent = "";
  if (contentHtml.startsWith("<p>")) {
    const match = contentHtml.match(/<p>(.*?)<\/p>([\s\S]*)/i);
    if (match) {
      intro = match[1];
      restContent = match[2].trim();
    } else {
      intro = contentHtml;
    }
  } else if (contentHtml.includes("\n")) {
    const [first, ...rest] = contentHtml.split("\n");
    intro = first;
    restContent = rest.join("\n");
  } else {
    intro = contentHtml;
  }

  return (
    <BlockWrapper>
      {/* HERO */}
      <HeroModern>
        <BlurBg />
        <ProfileCol>
          <ProfilePic>
            <Image
              src={coverImg?.url || "/img/profile.png"}
              alt={item.title?.[lang] || "about"}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </ProfilePic>
        </ProfileCol>
        <InfoCol>
          <HeroTitle>{item.title?.[lang] || item.title?.tr || item.title?.en || "—"}</HeroTitle>
          <HeroSummary>{item.summary?.[lang] || item.summary?.tr || item.summary?.en || "—"}</HeroSummary>
        </InfoCol>
      </HeroModern>

      {/* ÖZGEÇMİŞ */}
      <CvCard>
        <CvText>
          <span className="intro">{intro}</span>
          {restContent && (
            <span className="rest" dangerouslySetInnerHTML={{ __html: restContent }} />
          )}
        </CvText>
      </CvCard>

      {/* GALERİ */}
      {galleryImgs.length > 0 && (
        <GallerySection>
          <GalleryTitle>{t("about.gallery", "Galeri")}</GalleryTitle>
          <MasonryGallery
            breakpointCols={{ default: 3, 1024: 2, 640: 1 }}
            className="masonry-grid"
            columnClassName="masonry-column"
          >
            {galleryImgs.map((img, i) => (
              <ImgWrap
                key={String((img as any)._id) || i}
                onClick={() => { setModalIdx(i); setOpenModal(true); }}
              >
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
    </BlockWrapper>
  );
}

/* ===================== STYLES (aynı) ===================== */

const PageWrapper = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.xxl};
  position: relative;
`;

const BlockWrapper = styled.article`
  margin-bottom: ${({ theme }) => theme.spacings.xxxl};
`;

const HeroModern = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacings.xxl};
  position: relative;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  padding: ${({ theme }) => theme.spacings.xl} ${({ theme }) => theme.spacings.xl};
  margin-bottom: ${({ theme }) => theme.spacings.xxl};
  overflow: hidden;
  min-height: 240px;

  ${({ theme }) => theme.media.small} {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacings.lg};
    padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const BlurBg = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 70% 42%,
    ${({ theme }) => theme.colors.primaryTransparent} 0%,
    ${({ theme }) => theme.colors.background} 100%
  );
  filter: blur(1.2px) brightness(1.06);
  z-index: 0;
  pointer-events: none;
`;

const ProfileCol = styled.div`
  flex: 0 0 180px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.media.small} {
    width: 120px;
    margin-bottom: 10px;
  }
`;

const ProfilePic = styled.div`
  width: 170px;
  height: 170px;
  min-width: 120px;
  min-height: 120px;
  border-radius: ${({ theme }) => theme.radii.circle};
  overflow: hidden;
  box-shadow: 0 6px 48px ${({ theme }) => theme.colors.primaryTransparent}, 0 2px 24px #1f417c38;
  border: 4px solid ${({ theme }) => theme.colors.primaryTransparent};
  position: relative;
  background: ${({ theme }) => theme.colors.background};
  transition: box-shadow 0.22s;
  &:hover {
    box-shadow: 0 12px 64px ${({ theme }) => theme.colors.primaryHover}, 0 2px 32px #18d7ff30;
  }
  ${({ theme }) => theme.media.small} {
    width: 320px;
    height: 320px;
    min-width: 300px;
    min-height: 300px;
  }
`;

const InfoCol = styled.div`
  flex: 1 1 240px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.small} {
    align-items: center;
    text-align: center;
    padding: 0;
  }
`;

const HeroTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.title};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin-bottom: 0.12em;
  letter-spacing: -0.012em;
`;

const HeroSummary = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  line-height: ${({ theme }) => theme.lineHeights.loose};
  max-width: 580px;
  margin: 0;
  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.md};
    max-width: 97vw;
  }
`;

const CvCard = styled.div`
  margin: 0 auto ${({ theme }) => theme.spacings.xxl} auto;
  max-width: 980px;
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.xl};
  display: flex;
  align-items: center;
  position: relative;
  animation: fadeInUp 0.8s cubic-bezier(.28,.72,.46,1.06);

  ${({ theme }) => theme.media.small} {
    padding: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.sm};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const CvText = styled.div`
  width: 100%;
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  line-height: ${({ theme }) => theme.lineHeights.loose};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: 0.01em;
  animation: fadeIn 1.2s cubic-bezier(.2,.67,.41,1.13);

  ${({ theme }) => theme.media.small} {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }

  .intro {
    display: block;
    margin-bottom: 16px;
    font-size: 1.13em;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.title};
    background: none !important;
    -webkit-text-fill-color: currentColor;
    letter-spacing: 0.014em;
  }

  .rest {
    color: ${({ theme }) => theme.colors.text};
    display: block;
  }

  .rest :where(p, li, ul, ol, blockquote, h1, h2, h3, h4, h5, h6) {
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 ${({ theme }) => theme.spacings.sm};
  }

  .rest a {
    color: ${({ theme }) => theme.colors.link};
    text-decoration: underline;
  }

  .rest strong, .rest b {
    color: ${({ theme }) => theme.colors.textAlt};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  }
`;

const GallerySection = styled.section`
  margin: ${({ theme }) => theme.spacings.xxl} auto 0 auto;
  padding-bottom: ${({ theme }) => theme.spacings.lg};
`;

const GalleryTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.015em;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.primaryLight} 15%, ${({ theme }) => theme.colors.primary} 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  background: linear-gradient(120deg, ${({ theme }) => theme.colors.backgroundAlt} 30%, ${({ theme }) => theme.colors.cardBackground} 100%);
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  cursor: pointer;
  transition: box-shadow 0.18s, transform 0.18s, filter 0.18s;
  &:hover {
    box-shadow: 0 15px 54px ${({ theme }) => theme.colors.primaryTransparent}, 0 2px 26px ${({ theme }) => theme.colors.primaryHover};
    filter: brightness(1.05) blur(0.25px);
    transform: scale(1.025);
  }
`;

const StyledImage = styled(Image)`
  object-fit: cover;
  width: 100%;
  height: 100%;
  transition: filter 0.18s;
  ${ImgWrap}:hover & {
    filter: blur(0.6px) brightness(1.08) saturate(1.12);
  }
`;

const ModalImageWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 320px;
  min-height: 180px;
  width: 100%;
  height: 100%;
  max-width: 96vw;
  max-height: 80vh;
  background: transparent;
  border-radius: ${({ theme }) => theme.radii.lg};
`;

/* Keyframes (sayfada bir kez ekle) */
const fadeIn = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(24px);}
  to { opacity: 1; transform: none;}
}
`;
const fadeInUp = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(38px);}
  to { opacity: 1; transform: none;}
}
`;
if (typeof window !== "undefined" && !document.getElementById("about-theme-animations")) {
  const style = document.createElement("style");
  style.id = "about-theme-animations";
  style.innerHTML = fadeIn + fadeInUp;
  document.head.appendChild(style);
}
