"use client";

import styled from "styled-components";
import Link from "next/link";
import { translations } from "@/modules/services";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, SeeAllBtn } from "@/shared";
import type { IServices } from "@/modules/services/types";
import type { SupportedLocale } from "@/types/common";


export default function ServiceSection() {
  const { i18n, t } = useI18nNamespace("services", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { services, loading } = useAppSelector((state) => state.services);

  const allActivities = services || [];
  const firstServices = allActivities[0];
  const restActivities = allActivities.slice(0, 6); // Max 6 tane gösterir

  return (
    <Section>
      <Container>
        <Left>
          <MinorTitle>
            {t("page.services.minorTitle", "Hizmetlerimiz")}
          </MinorTitle>
          <MainTitle>
            {t("page.services.title", "Hizmet Alanlarımız")}
          </MainTitle>
          <Desc>
            {firstServices
              ? firstServices.summary?.[lang] || "-"
              : t(
                  "page.services.desc",
                  ""
                )}
          </Desc>

          {/* --- EK: Ana faaliyet görseli, summary'nin hemen altında --- */}
          {firstServices?.images?.[0]?.url && (
            <FirstServicesImageWrap as={Link} href={`/services/${firstServices.slug}`}>
              <FirstServicesImage
                src={firstServices.images[0].url}
                alt={firstServices.title?.[lang] || "Faaliyet"}
                width={430}
                height={185}
                style={{ objectFit: "cover" }}
              />
            </FirstServicesImageWrap>
          )}

          <SeeAllBtn href="/services">
            {t("page.services.all", "Tüm Hizmetler")}
          </SeeAllBtn>
        </Left>
        <Right>
          {loading ? (
            <CardGrid>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </CardGrid>
          ) : (
            <CardGrid>
              {restActivities.map((item: IServices, idx: number) => (
                <CardLink
                  href={`/services/${item.slug}`}
                  key={item._id}
                  as={motion.a}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ durationMinutes: 0.39, delay: idx * 0.07 }}
                  viewport={{ once: true }}
                >
                  <CardImgBox>
                    {item.images?.[0]?.url ? (
                      <CardImg
                        src={item.images[0].url}
                        alt={item.title?.[lang] || "Untitled"}
                        loading="lazy"
                      />
                    ) : (
                      <CardImgPlaceholder />
                    )}
                  </CardImgBox>
                  <CardTitle>{item.title?.[lang] || "Untitled"}</CardTitle>
                </CardLink>
              ))}
            </CardGrid>
          )}
        </Right>
      </Container>
    </Section>
  );
}

// ... diğer styled-components aynı şekilde devam ...

// --- EK: Ana faaliyet görseli için özel wrap ve stil ---
const FirstServicesImageWrap = styled(Link)`
  width: 100%;
  max-width: 410px;
  min-height: 140px;
  max-height: 220px;
  margin: 1.3rem 0 1.2rem 0;
  display: block;
  overflow: hidden;
  box-shadow: 0 8px 30px 0 rgba(40,117,194,0.12);
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  @media (max-width: 600px) {
    min-width: 140px;
    min-height: 80px;
    height: auto;
    margin: 1rem auto 0.9rem auto;
    max-width: 100%;
  }
`;

const FirstServicesImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;




// --- STYLES ---

const Section = styled.section`
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
`;

// 1) Container: mobilde çocukları ortala
const Container = styled.div`
  display: flex;
  align-items: flex-start;          /* desktop */
  gap: 3rem;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacings.lg};

  @media (max-width: 1023px) {
    flex-direction: column;
    gap: 2.5rem;
    padding: 0 ${({ theme }) => theme.spacings.sm};
    align-items: center;            /* 🔑 mobilde sol yapışmayı çözer */
  }
`;


const Left = styled.div`
  flex: 1.12 1 300px;
  max-width: 440px;
  @media (max-width: 1023px) {
    max-width: 100%;
    text-align: center;
    margin: 0 auto;
  }
`;

const MinorTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  letter-spacing: 0.02em;
  margin-bottom: 1.2rem;
  text-transform: uppercase;
`;

const MainTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacings.md};
  line-height: 1.17;
`;

const Desc = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2.3rem;
  line-height: 1.67;
`;



const Right = styled.div`
  flex: 2.8 1 500px;
  width: 100%;
  display: block;
`;


const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacings.md} ${({ theme }) => theme.spacings.lg};
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  justify-items: stretch;
  align-items: stretch;

  /* ≤1024px: 2 sütun */
  ${({ theme }) => theme.media.medium} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 680px;
    gap: ${({ theme }) => theme.spacings.md};
  }

  /* ≤768px: 2 sütun + yanlarda nefes */
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 680px;                      /* ortalamayı görünür kılar */
    padding-inline: ${({ theme }) => theme.spacings.sm};
    gap: ${({ theme }) => theme.spacings.sm};
  }

  /* ≤375px: tek sütun, tam satır ve ortalı */
  ${({ theme }) => `
    @media (max-width: ${theme.breakpoints.mobileM}) {
      grid-template-columns: minmax(0, 1fr);
      max-width: 520px;
      padding-inline: ${theme.spacings.sm};
      gap: ${theme.spacings.sm};
      justify-items: stretch;
    }
  `}
`;



const CardLink = styled(Link)`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 0;
  min-height: 240px;
  overflow: hidden;
  transition: box-shadow 0.18s, transform 0.18s;
  cursor: pointer;

  ${({ theme }) => theme.media.medium} { min-height: 200px; }
  ${({ theme }) => theme.media.mobile} { min-height: 150px; }

  /* ≤375px güvene alma */
  ${({ theme }) => `
    @media (max-width: ${theme.breakpoints.mobileM}) {
      width: 100%;
      margin-inline: auto;
    }
  `}

  &:hover,
  &:focus-visible {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-6px) scale(1.035);
    z-index: 2;
  }
`;




const CardImgBox = styled.div`
  width: 100%;
  height: 160px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  ${({ theme }) => theme.media.medium} {
    height: 120px;
  }

  ${({ theme }) => theme.media.mobile} {
    height: 96px;
  }

  ${({ theme }) => theme.media.xsmall} {
    height: 84px;
  }
`;


const CardImg = styled.img`
  width: 95%;
  height: 90%;
  object-fit: contain;
  transition: transform 0.19s cubic-bezier(0.5, 0.27, 0.41, 1.14);
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  &:hover { transform: scale(1.10) rotate(-2deg); }
`;

const CardImgPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.43;
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-align: center;
  padding: 0.5rem 0 0.3rem 0;    // Eskisine göre daha az
  line-height: 1.18;
  min-height: 1.9em;             // Eskiden 2.4em idi, artık daha kısa
  letter-spacing: 0.01em;

  @media (max-width: 700px) {
    font-size: ${({ theme }) => theme.fontSizes.md};
    padding: 0.36rem 0 0.17rem 0;
    min-height: 1.4em;
  }
`;

