"use client";
import styled from "styled-components";
import Link from "next/link";
import translations from "@/modules/library/locales";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage, SeeAllBtn } from "@/shared";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import type { ILibrary } from "@/modules/library";

export default function LibrarySection() {
  const { i18n, t } = useI18nNamespace("library", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { library, loading, error } = useAppSelector((state) => state.library ?? {});

  if (loading) {
    return (
      <Section>
        <FullWidth><Skeleton /></FullWidth>
      </Section>
    );
  }
  if (error) {
    return (
      <Section>
        <FullWidth><ErrorMessage message={error} /></FullWidth>
      </Section>
    );
  }
  if (!Array.isArray(library) || library.length === 0) {
    return (
      <Section>
        <FullWidth>
          <MainTitle>{t("page.library.allLibrary", "Kütüphane")}</MainTitle>
          <Desc>{t("library.library.empty", "Kütüphane içeriği bulunamadı.")}</Desc>
        </FullWidth>
      </Section>
    );
  }

  const allLibrary = library || [];
  const firstLibrary = allLibrary[6];              // ✅ güvenli ilk kayıt
  const restLibraries = allLibrary.slice(2, 4);    // 2 küçük kart

  return (
    <Section>
      {/* --- 1. SATIR: YAZI SOLDA, RESİM SAĞDA --- */}
      <MainInfoRow>
        <MainTextCol>
          <MinorTitle>{t("page.library.minorTitle", "KÜTÜPHANE")}</MinorTitle>
          <StyledLink
            href={`/library/${firstLibrary.slug}`}
            aria-label={firstLibrary.title?.[lang] || "Untitled"}
          >
            {firstLibrary.title?.[lang] ||
              Object.values(firstLibrary.title || {})[0] ||
              t("page.library.title", "Kütüphane")}
          </StyledLink>
          <Desc>
            {firstLibrary.summary?.[lang] ||
              Object.values(firstLibrary.summary || {})[0] ||
              "—"}
          </Desc>
        </MainTextCol>

        <MainImageWrap as={Link} href={`/library/${firstLibrary.slug}`}>
          {firstLibrary?.images?.[0]?.url ? (
            <MainImage
              src={firstLibrary.images[0].url}
              alt={firstLibrary.title?.[lang] || "Kütüphane"}
              width={360}
              height={230}
              style={{ objectFit: "cover" }}
              priority
            />
          ) : (
            <ImgPlaceholder />
          )}
        </MainImageWrap>
      </MainInfoRow>

      {/* --- 2. SATIR: BUTON + KARTLAR --- */}
      <BottomRow>
        <SeeAllWrap>
          <SeeAllBtn href="/library">
            {t("page.library.all", "Tüm Kayıtları Gör")}
          </SeeAllBtn>
        </SeeAllWrap>

        <SmallCards>
          {restLibraries.map((item: ILibrary, idx: number) => (
            <SmallCard
              key={item._id}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: idx * 0.09 }}
              viewport={{ once: true }}
            >
              <SmallCardImageWrap as={Link} href={`/library/${item.slug}`}>
                {item.images?.[0]?.url ? (
                  <SmallCardImage
                    src={item.images[0].url}
                    alt={item.title?.[lang] || "Kütüphane"}
                    width={90}
                    height={90}
                  />
                ) : (
                  <ImgPlaceholderSmall />
                )}
              </SmallCardImageWrap>

              <SmallCardTitle as={Link} href={`/library/${item.slug}`}>
                {item.title?.[lang] || "Untitled"}
              </SmallCardTitle>
            </SmallCard>
          ))}
        </SmallCards>
      </BottomRow>
    </Section>
  );
}

/* ===================== STYLES ===================== */

const Section = styled.section`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 3.5vw 0 2vw 0;

  @media (max-width: 600px) {
    padding: 1.2rem 0 0.7rem 0;
  }
`;

const FullWidth = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2vw;
`;

const MainInfoRow = styled.div`
  max-width: 1280px;
  margin: 0 auto 2.3vw auto;
  display: flex;
  align-items: flex-start;
  gap: 2vw;
  padding: 0 2vw;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0.6rem;
    padding: 0 1rem;
    margin-bottom: 0;
  }
`;

const MainTextCol = styled.div`
  flex: 1 1 0;
  min-width: 0;               /* ✔ taşmayı önlemek için */
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const MainImageWrap = styled(Link)`
  min-width: 320px;
  max-width: 370px;
  width: 350px;
  height: 210px;
  margin-left: auto;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: 0 6px 32px 0 rgba(40,117,194,0.12);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 900px) {
    width: 100%;
    max-width: 420px;
    min-width: 0;
    margin: 0 auto;
    height: 170px;
  }
`;

const MainImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  min-height: 140px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.36;
`;

const MinorTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.6rem;

  @media (max-width: 600px) {
    text-align: center;
  }
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  /* ✔ mobilde daha küçük, sarma açık */
  font-size: clamp(1.4rem, 4.8vw + 0.2rem, 2.1rem);
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: -0.01em;
  line-height: 1.18;
  text-decoration: none;
  margin: 0 0 0.35rem 0;
  display: block;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  hyphens: auto;

  &:hover, &:focus-visible {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
  }
`;

const MainTitle = styled.h2`
  font-size: clamp(1.6rem, 5.2vw, 2.2rem);
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 0.25em 0;
  line-height: 1.18;
  letter-spacing: -0.01em;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.65;
  margin: 0 0 0.8rem 0;
  max-width: 100%;
  overflow-wrap: anywhere;      /* ✔ uzun kelimeleri kır */
  word-break: break-word;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2vw;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2vw;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 0 1rem;
  }
`;

const SeeAllWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 0 0 240px;
  min-width: 0;
  & > * { margin: 0 !important; }

  @media (max-width: 900px) {
    flex: 0 0 auto;
    width: auto;
    justify-content: center;
  }
`;

const SmallCards = styled.div`
  flex: 1 1 0;
  display: flex;
  gap: 0.6rem;
  width: 100%;
  justify-content: center;
  flex-wrap: nowrap;

  @media (max-width: 900px) { gap: 0.5rem; }
  @media (max-width: 600px) { gap: 0.4rem; }
`;

const SmallCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: 0 4px 18px 0 rgba(40,117,194,0.09);
  padding: 0.7rem 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  min-height: 120px;
  width: 48%;
  gap: 0.5rem;
  transition: box-shadow 0.17s, transform 0.13s;

  &:hover { box-shadow: 0 8px 28px 0 rgba(40,117,194,0.14); transform: translateY(-4px) scale(1.03); }

  @media (max-width: 900px) {
    max-width: 240px;
  }
  @media (max-width: 600px) {
    max-width: 170px;
    padding: 0.5rem 0.4rem;
  }
`;

const SmallCardImageWrap = styled(Link)`
  width: 80px;
  height: 54px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: 0 2px 14px 0 rgba(40,117,194,0.07);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 900px) { width: 70px; height: 50px; }
  @media (max-width: 600px) { width: 55px; height: 38px; }
`;

const SmallCardImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImgPlaceholderSmall = styled.div`
  width: 90px;
  height: 90px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.28;
  @media (max-width: 900px) { width: 70px; height: 70px; }
  @media (max-width: 600px) { width: 55px; height: 55px; }
`;

const SmallCardTitle = styled.h3`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: center;
  margin: 0;
  line-height: 1.3;
  max-width: 100%;
  overflow: hidden;
  display: -webkit-box;        /* ✔ 2 satırda kes */
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow-wrap: anywhere;
  word-break: break-word;
`;
