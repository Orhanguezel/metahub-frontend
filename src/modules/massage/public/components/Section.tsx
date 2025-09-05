"use client";

import styled from "styled-components";
import Link from "next/link";
import { translations } from "@/modules/massage";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, SeeAllBtn } from "@/shared";
import type { IMassage } from "@/modules/massage/types";
import type { SupportedLocale } from "@/types/common";


export default function MassageSection() {
  const { i18n, t } = useI18nNamespace("massage", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { massage, loading } = useAppSelector((state) => state.massage?? {});

  const allActivities = massage || [];
  const firstMassage = allActivities[0];
  const restActivities = allActivities.slice(0, 6); // Max 6 tane gösterir

  return (
    <Section>
      <Container>
        <Left>
          <MinorTitle>
            {t("page.massage.minorTitle", "Hizmetlerimiz")}
          </MinorTitle>
          <MainTitle>
            {t("page.massage.title", "Hizmet Alanlarımız")}
          </MainTitle>
          <Desc>
            {firstMassage
              ? firstMassage.summary?.[lang] || "-"
              : t(
                  "page.massage.desc",
                  ""
                )}
          </Desc>

          {/* --- EK: Ana faaliyet görseli, summary'nin hemen altında --- */}
          {firstMassage?.images?.[0]?.url && (
            <FirstMassageImageWrap as={Link} href={`/massage/${firstMassage.slug}`}>
              <FirstMassageImage
                src={firstMassage.images[0].url}
                alt={firstMassage.title?.[lang] || "Faaliyet"}
                width={430}
                height={185}
                style={{ objectFit: "cover" }}
              />
            </FirstMassageImageWrap>
          )}

          <SeeAllBtn href="/massage">
            {t("page.massage.all", "Tüm Hizmetler")}
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
              {restActivities.map((item: IMassage, idx: number) => (
                <CardLink
                  href={`/massage/${item.slug}`}
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

// --- EK: Ana faaliyet görseli için özel wrap ve stil ---
const FirstMassageImageWrap = styled(Link)`
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

const FirstMassageImage = styled.img`
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

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 3rem;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacings.lg};

  @media (max-width: 1023px) {
    flex-direction: column;
    gap: 2.5rem;
    padding: 0 ${({ theme }) => theme.spacings.sm};
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
  display: flex;
  justify-content: center;   /* grid’i ortala */
  align-items: stretch;
  width: 100%;
`;

const CardGrid = styled.div`
  display: grid;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;

  /* 3 sütun (desktop) */
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.4rem 1.7rem;
  justify-content: center;  /* kalan boşlukta ortala */
  justify-items: stretch;   /* kartlar kolon genişliğini doldursun */
  align-items: stretch;

  @media (max-width: 1100px) {
    /* 2 sütun (tablet) */
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.1rem;
    max-width: 650px;
  }

  @media (max-width: 700px) {
    /* 2 sütun (mobil çoğu cihaz) */
    grid-template-columns: repeat(2, minmax(140px, 1fr));
    gap: 0.8rem;
    max-width: 560px;
    margin: 0 auto;

    /* Son eleman tek kalırsa tüm satırı kapla */
    & > *:last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 380px) {
    /* Çok dar ekran: tek sütun, doğal olarak tam satır */
    grid-template-columns: 1fr;
    gap: 0.6rem;
    max-width: 100%;
  }
`;



const CardLink = styled(Link)`
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
  min-height: 250px;
  overflow: hidden;
  transition: box-shadow 0.18s, transform 0.18s;
  cursor: pointer;
  width: 100%;  /* grid kolonu tam doldur */

  @media (max-width: 700px) {
    min-height: 148px;
  }
  @media (max-width: 380px) {
    min-height: 122px;
  }

  &:hover, &:focus-visible {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-6px) scale(1.035);
    z-index: 2;
  }
`;


const CardImgBox = styled.div`
  width: 100%;
  /* sabit yükseklik yerine daha akışkan görünüm istersen aspect-ratio kullanabilirsin */
  height: 160px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 1100px) { height: 120px; }
  @media (max-width: 700px) { height: 100px; }
  @media (max-width: 380px) { height: 86px; }
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

