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

  const { library, loading, error } = useAppSelector((state) => state.library);

  if (loading) {
    return (
      <Section>
        <FullWidth>
          <Skeleton />
        </FullWidth>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <FullWidth>
          <ErrorMessage message={error} />
        </FullWidth>
      </Section>
    );
  }

  if (!Array.isArray(library) || library.length < 3) {
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
  const firstLibrary = allLibrary[6];
  const restLibraries = allLibrary.slice(1, 3); // 2 küçük kart

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

// --- STYLES ---

const Section = styled.section`
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 3.5vw 0 2vw 0;
  width: 100%;

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
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 2vw;
  padding: 0 2vw;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0;
    padding: 0;
    margin-bottom: 0;
  }
  @media (max-width: 600px) {
  align-items: center;
    gap: 0;
    padding: 0;
    margin-bottom: 0 !important;
  }
`;


const MainTextCol = styled.div`
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;

  @media (max-width: 900px) {
    gap: 0.2rem;
    padding: 0;
    margin: 0;
  }
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
    width: 98vw;
    max-width: 420px;
    min-width: 170px;
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
  margin-bottom: 0.8rem;

  @media (max-width: 600px) {
    margin-bottom: 0.4rem;
    text-align: center;
    width: 100%;
    display: block;
    justify-content: center;
    align-items: center;
  }
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(2.2rem, 3.3vw, 2.7rem);
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: -0.01em;
  line-height: 1.13;
  text-decoration: none;
  margin: 0 0 0.20em 0;
  display: inline-block;
  transition: color 0.2s;
  &:hover, &:focus-visible {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
  }
`;

const MainTitle = styled.h2`
  font-size: clamp(2.2rem, 3.3vw, 2.7rem);
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 0.25em 0;
  line-height: 1.13;
  letter-spacing: -0.01em;
  font-family: ${({ theme }) => theme.fonts.heading};
  text-decoration: none;
  transition: color 0.2s;

  @media (max-width: 600px) {
    text-align: center;
    width: 100%;
    display: block;
    align-items: center;
  }
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.7;
  margin-bottom: 0.8rem;
  @media (max-width: 600px) {
    margin-bottom: 0.4rem;
    text-align: center;
    width: 100%;
    display: block;
    justify-content: center;
    align-items: center;
  }
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 2vw;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2vw;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0;
    padding: 0;
    margin: 0;
  }
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0;
    padding: 0;
    margin: 0 !important;
  }
`;

const SeeAllWrap = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex: 0 0 240px;
  min-width: 0;
  max-width: 100%;
  margin: 0;
  padding: 0;

  @media (max-width: 900px) {
    justify-content: center;
    margin: 0;
    padding: 0;
  }
`;

const SmallCards = styled.div`
  flex: 1 1 0;
  display: flex;
  gap: 0.2rem;
  width: 100%;
  margin: 0;
  padding: 0;

  @media (max-width: 900px) {
    flex-direction: row;
    gap: 0.2rem;
    justify-content: center;
    margin-top: 0 !important;
    padding: 0;
  }
  @media (max-width: 600px) {
    flex-direction: row;
    gap: 0;
    justify-content: center;
    margin-top: 0 !important; /* SeeAllWrap ile arasında boşluk bırakma */
    padding: 0;
  }
`;

const SmallCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: 0 4px 18px 0 rgba(40,117,194,0.09);
  padding: 1rem 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  min-height: 120px;
  width: 48%;   // Mobilde iki kart yan yana tam sığsın
  gap: 0.7rem;
  transition: box-shadow 0.17s, transform 0.13s;
  &:hover { box-shadow: 0 8px 28px 0 rgba(40,117,194,0.14); transform: translateY(-4px) scale(1.03); }

  @media (max-width: 900px) {
    width: 48%;
    min-width: 0;
    max-width: 240px;
    padding: 0.7rem 0.4rem;
    gap: 0;
  }
  @media (max-width: 600px) {
    width: 48%;
    min-width: 0;
    max-width: 170px;
    padding: 0.4rem 0.2rem;
    gap: 0;
  }
`;


const SmallCardImageWrap = styled(Link)`
  width: 80px;
  height: 54px;
  object-fit: cover;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: 0 2px 14px 0 rgba(40,117,194,0.07);
  transition: box-shadow 0.17s, transform 0.15s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover, &:focus-visible {
    box-shadow: 0 7px 32px 0 rgba(40,117,194,0.14);
    transform: scale(1.055);
    outline: none;
  }
  @media (max-width: 900px) {
    width: 70px;
    height: 50px;
  }
  @media (max-width: 600px) {
    width: 55px;
    height: 38px;
    padding: 0;
    margin: 0 auto;
  }
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
  @media (max-width: 900px) {
    width: 70px;
    height: 70px;
  }
  @media (max-width: 600px) {
    width: 55px;
    height: 55px;
    padding: 0;
    margin: 0 auto;
  }
`;

const SmallCardTitle = styled.h3`
  font-size: 1.13rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: center;
  margin: 0;
  line-height: 1.32;
`;

