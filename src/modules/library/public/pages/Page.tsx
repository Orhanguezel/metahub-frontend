"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/library/locales/index";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { resolveClientLocale } from "@/lib/locale";
import { getMultiLang} from "@/types/common";
import type { ILibrary } from "@/modules/library/types";

export default function LibraryPage() {
  const { i18n, t } = useI18nNamespace("library", translations);
  const lang = resolveClientLocale(i18n);

  // i18n bundle'ı yükle (idempotent)
  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "library")) {
      i18n.addResourceBundle(lng, "library", resources, true, true);
    }
  });

  const { library, loading, error } = useAppSelector((state) => state.library);


  if (loading) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allLibrary", "Kütüphane")}</PageTitle>
        <LibraryGrid>{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</LibraryGrid>
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

  if (!library || library.length === 0) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allLibrary", "Kütüphane")}</PageTitle>
        <EmptyMsg>{t("page.noLibrary", "Herhangi bir içerik bulunamadı.")}</EmptyMsg>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.allLibrary", "Kütüphane")}</PageTitle>
      <LibraryGrid>
        {library.map((item: ILibrary, index: number) => (
          <LibraryCard
            key={item._id}
            as={motion.div}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.09, duration: 0.48 }}
            viewport={{ once: true }}
          >
            {/* Görsel */}
            <ImageWrapper>
              {Array.isArray(item.images) && item.images.length > 0 && item.images[0]?.url ? (
                <StyledLink
                  href={`/library/${item.slug}`}
                  aria-label={getMultiLang(item.title, lang)}
                >
                  <StyledImage
                    src={item.images[0].url}
                    alt={getMultiLang(item.title, lang)}
                    width={440}
                    height={210}
                    loading="lazy"
                  />
                </StyledLink>
              ) : (
                <ImgPlaceholder />
              )}
            </ImageWrapper>

            {/* İçerik */}
            <CardContent>
              <CardTitle as={Link} href={`/library/${item.slug}`}>
                {getMultiLang(item.title, lang)}
              </CardTitle>
              <CardSummary>{getMultiLang(item.summary, lang)}</CardSummary>

              {/* PDF dosyası varsa */}
              {item.files && item.files.length > 0 && (
                <FileSection>
                  <a
                    href={item.files[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={item.files[0].name}
                    onClick={(e) => e.stopPropagation()}
                  >
                    📄 {item.files[0].name || t("library.pdf_file", "PDF Dosyası")}
                  </a>
                </FileSection>
              )}

              <ReadMore href={`/library/${item.slug}`} tabIndex={0}>
                {t("readMore", "Devamını Oku →")}
              </ReadMore>
            </CardContent>
          </LibraryCard>
        ))}
      </LibraryGrid>
    </PageWrapper>
  );
}

/* ----- STYLES ----- */
const PageWrapper = styled.div`
  max-width: 1260px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md};
  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.xs};
  }
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  text-align: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.01em;
`;

const LibraryGrid = styled.div`
  display: grid;
  gap: 2.1rem 2rem;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  align-items: stretch;
  margin: 0 auto;
  @media (max-width: 800px) { gap: 1.3rem; }
`;

const LibraryCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1.4px solid ${({ theme }) => theme.colors.borderLight};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.17s, border 0.17s, transform 0.16s;
  cursor: pointer;
  min-height: 335px;

  &:hover, &:focus-visible {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-8px) scale(1.035);
    z-index: 1;
  }
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const StyledLink = styled(Link)`
  width: 100%;
  height: 100%;
  display: block;
`;

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 180px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.38;
`;

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.lg} ${({ theme }) => theme.spacings.md};
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const CardTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.title};
  margin-bottom: 0.13em;

  a {
    color: inherit;
    text-decoration: none;
    &:hover, &:focus {
      text-decoration: underline;
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const CardSummary = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.45em;
  line-height: 1.6;
`;

const FileSection = styled.div`
  margin: 0.8rem 0 0.2rem 0;
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    font-weight: 500;
    font-size: 1em;
    &:hover { opacity: 0.8; }
  }
`;

const ReadMore = styled(Link)`
  display: inline-block;
  margin-top: auto;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.base};
  padding: 0.32em 0.7em;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  text-decoration: none;
  letter-spacing: 0.01em;
  transition: background 0.19s, color 0.16s;
  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    text-decoration: none;
  }
`;

const EmptyMsg = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-size: 1.18em;
  margin: 2.4em 0 1.7em 0;
`;
