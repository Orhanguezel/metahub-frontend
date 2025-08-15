"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams,useRouter } from "next/navigation";
import styled from "styled-components";
import { motion } from "framer-motion";
import { translations } from "@/modules/services";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import Link from "next/link";
import Image from "next/image";
import { Skeleton, ErrorMessage } from "@/shared";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearServicesMessages,
  fetchServicesBySlug,
  setSelectedServices,
} from "@/modules/services/slice/servicesSlice";
import type { IServices } from "@/modules/services";
import type { SupportedLocale } from "@/types/common";
import Modal from "@/modules/home/public/components/Modal"; // Modal path'ini kendi projene göre ayarla

export default function DetailSection() {
  const { i18n, t } = useI18nNamespace("services", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const router = useRouter();

  const dispatch = useAppDispatch();

  const {
    selected: services,
    services: allServices,
    loading,
    error,
  } = useAppSelector((state) => state.services);

  useEffect(() => {
    if (allServices && allServices.length > 0) {
      const found = allServices.find((item: IServices) => item.slug === slug);
      if (found) {
        dispatch(setSelectedServices(found));
      } else {
        dispatch(fetchServicesBySlug(slug));
      }
    } else {
      dispatch(fetchServicesBySlug(slug));
    }
    return () => {
      dispatch(clearServicesMessages());
    };
  }, [dispatch, allServices, slug]);

  // Görsel galerisi state
  const images = services?.images || [];
  const [mainIndex, setMainIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const totalImages = images.length;

  // Modalda sağ/sol/esc ile gezinme
  const goNext = useCallback(() => {
    setMainIndex((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const goPrev = useCallback(() => {
    setMainIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

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

  useEffect(() => {
    setMainIndex(0); // slug değişince resetle
  }, [slug]);

  if (loading) {
    return (
      <DetailContainer>
        <Skeleton />
      </DetailContainer>
    );
  }

  if (error || !services) {
    return (
      <DetailContainer>
        <ErrorMessage />
      </DetailContainer>
    );
  }

  const otherServices = allServices.filter((item: IServices) => item.slug !== slug);

  const mainImage = images[mainIndex];

  return (
    <DetailContainer
      initial={{ opacity: 0, y: 38 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ durationMinutes: 0.55 }}
    >
      {/* Başlık */}
      <MainTitle>
        {services.title?.[lang]}
      </MainTitle>

      {/* Görsel + thumbs */}
      {mainImage?.url && (
        <ImageSection>
          <MainImageFrame>
            <StyledMainImage
              src={mainImage.url}
              alt={services.title?.[lang] || "Untitled"}
              width={1100}
              height={470}
              priority
              style={{
                objectFit: "cover",
                width: "100%",
                height: "310px",
                cursor: "zoom-in",
              }}
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
              aria-label={t("detail.openImage", "Büyüt")}
            >
              <div style={{ textAlign: "center", padding: 0 }}>
                <Image
                  src={mainImage.url}
                  alt={(services.title?.[lang] || "") + "-big"}
                  width={1280}
                  height={720}
                  style={{
                    maxWidth: "94vw",
                    maxHeight: "80vh",
                    boxShadow: "0 6px 42px #2225",
                    background: "#111",
                    width: "auto",
                    height: "auto"
                  }}
                  sizes="(max-width: 800px) 90vw, 1280px"
                />
                <div style={{ marginTop: 10, color: "#666", fontSize: 16 }}>
                  {services.title?.[lang]}
                </div>
              </div>
            </Modal>
          )}

          {/* Thumbnails */}
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
                    alt={`${services.title?.[lang]} thumbnail ${i + 1}`}
                    width={118}
                    height={70}
                    $active={mainIndex === i}
                  />
                </ThumbFrame>
              ))}
            </Gallery>
          )}
        </ImageSection>
      )}

      {/* Özet */}
      {services.summary && services.summary[lang] && (
        <SummaryBlock>
          <div>{services.summary[lang]}</div>
        </SummaryBlock>
      )}

      {/* İçerik */}
      {services.content && services.content[lang] && (
        <ContentBlock>
          <div
            className="services-content"
            dangerouslySetInnerHTML={{ __html: services.content[lang] }}
          />
        </ContentBlock>
      )}

      {/* Diğer bilgiler */}

        <RandevuButton onClick={() => router.push(`/contactme`)}>
  {t("form.bookNow", "Get a Quote")}
</RandevuButton>



      {/* Diğer faaliyetler */}
      {otherServices?.length > 0 && (
        <OtherBlock>
          <h3>{t("page.other", "Diğer Hizmetlerimiz")}</h3>
          <OtherGrid>
            {otherServices.map((item: IServices, index: number) => (
              <OtherCard key={item._id}>
                <OtherImgWrap>
                  {item.images?.[0]?.url ? (
                    <Image
  src={item.images[0].url}
  alt={item.title?.[lang] || "Untitled"}
  width={60}
  height={40}
  {...(index === 0 ? { priority: true } : { loading: "lazy" })}
/>
                  ) : (
                    <OtherImgPlaceholder />
                  )}
                </OtherImgWrap>
                <OtherTitle>
                  <Link href={`/services/${item.slug}`}>
                    {item.title?.[lang] || "Untitled"}
                  </Link>
                </OtherTitle>
              </OtherCard>
            ))}
          </OtherGrid>
        </OtherBlock>
      )}
    </DetailContainer>
  );
}

// --------- STYLES -----------

const DetailContainer = styled(motion.section)`
  max-width: 940px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.sectionBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: 4.5rem;

  @media (max-width: 700px) {
    padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.sm};
  }
`;

const MainTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: 0.01em;
  margin-bottom: 1.4rem;
  text-align: center;
`;

const ImageSection = styled.div`
  margin-bottom: 2.1rem;
`;

const MainImageFrame = styled.div`
  width: 100%;
  max-width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: #e7edf3;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const StyledMainImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 22px;
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
  width: 118px;
  height: 70px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #eef5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.15s, border 0.17s;
  border: 2.3px solid #e1e8ef;

  ${({ $active, theme }) =>
    $active
      ? `border-color: ${theme.colors.primary}; box-shadow: 0 5px 18px 0 rgba(229,84,156,0.13);`
      : ""}
  &:hover, &:focus-visible {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 5px 18px 0 rgba(229,84,156,0.15);
    outline: none;
  }
`;

const StyledThumbImage = styled(Image)<{ $active?: boolean }>`
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  border-radius: 12px;
`;

const SummaryBlock = styled.div`
  background: ${({ theme }) => theme.colors.achievementBackground};
  border-left: 6px solid ${({ theme }) => theme.colors.primary};
  padding: 1.45rem 2.1rem 1.2rem 2rem;
  margin-bottom: 2.1rem;
  border-radius: 14px;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    margin-bottom: 0.7em;
  }
  div {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.fontSizes.base};
    line-height: 1.7;
  }
`;

const ContentBlock = styled.div`
  background: ${({ theme }) => theme.colors.contentBackground};
  border-left: 6px solid ${({ theme }) => theme.colors.accent};
  padding: 2.1rem 2.3rem 2rem 2.3rem;
  margin-bottom: 2.6rem;
  border-radius: 18px;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  h3 {
    color: ${({ theme }) => theme.colors.accent};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    margin-bottom: 0.7em;
  }
  .services-content {
    font-size: ${({ theme }) => theme.fontSizes.base};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.7;
    p { margin-bottom: 0.9em; }
    ul, ol { margin-bottom: 0.9em; }
    li { margin-left: 1.2em; }
  }
`;

const OtherBlock = styled.div`
  margin-top: 3.2rem;
  border-top: 1.5px solid ${({ theme }) => theme.colors.border};
  padding-top: 2.2rem;
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    margin-bottom: 1.2rem;
    text-align: left;
  }
`;

const OtherGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem 2.3rem;
`;

const OtherCard = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 14px;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  padding: 0.65rem 1.2rem;
  min-width: 170px;
  gap: 0.6rem;
  border: 1.2px solid ${({ theme }) => theme.colors.borderLight};
  transition: box-shadow 0.17s, border-color 0.14s;

  &:hover, &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const OtherImgWrap = styled.div`
  width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: 10px;
  overflow: hidden;
`;

const OtherImgPlaceholder = styled.div`
  width: 60px;
  height: 40px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.34;
`;

const OtherTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &:hover, &:focus-visible {
      text-decoration: underline;
      color: ${({ theme }) => theme.colors.accent};
    }
  }
`;


const RandevuButton = styled.a`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: 0.8rem 2.1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 1.05rem;
  transition: background 0.2s ease;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover, &:focus-visible {
    background-color: ${({ theme }) => theme.colors.accent};
    text-decoration: none;
    cursor: pointer;
    outline: none;
  }
`;

