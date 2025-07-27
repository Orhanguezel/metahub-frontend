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


export default function ServicesSection() {
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
  justify-content: center;
  align-items: stretch;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  grid-template-rows: repeat(3, minmax(168px, 1fr));
  gap: 2.2rem 2.7rem;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: none;
    gap: 1.2rem 1.2rem;
    max-width: 99vw;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr; // Hala iki sütun!
    gap: 0.65rem 0.65rem;
    padding: 0 0.2rem;
  }
`;


const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: 2.1rem 1rem 1.25rem 1rem;
  min-height: 220px;
  transition: box-shadow 0.17s, border-color 0.17s, transform 0.16s;
  cursor: pointer;
  position: relative;
  will-change: transform;
  outline: none;

  &:hover, &:focus-visible {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-8px) scale(1.06);
    z-index: 1;
    text-decoration: none;
  }
`;


const CardImgBox = styled.div`
  width: 140px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.1rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: 0 4px 22px 0 rgba(40, 117, 194, 0.07);

  @media (max-width: 600px) {
    width: 100px;
    height: 78px;
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
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.43;
`;

const CardTitle = styled.h3`
  font-size: 1.15em;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-top: 0.6rem;
  text-align: center;
  letter-spacing: 0.01em;
  min-height: 2.2em;
  line-height: 1.14;
`;
