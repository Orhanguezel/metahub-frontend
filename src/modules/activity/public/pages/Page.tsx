"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/activity/locales/index";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import type { IActivity } from "@/modules/activity/types";

export default function ActivityPage() {
  const { i18n, t } = useI18nNamespace("activity", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { activity, loading, error } = useAppSelector((state) => state.activity);

  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "activity")) {
      i18n.addResourceBundle(lng, "activity", resources, true, true);
    }
  });

  const getMultiLang = (obj?: Record<string, string>) =>
    obj?.[lang] || obj?.["tr"] || obj?.["en"] || Object.values(obj || {})[0] || "—";

  if (loading) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allActivity", "Tüm Faaliyetlerimiz")}</PageTitle>
        <ActivityGrid>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </ActivityGrid>
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

  if (!activity || activity.length === 0) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allActivity", "Tüm Faaliyetlerimiz")}</PageTitle>
        <EmptyMsg>{t("page.noActivity", "Herhangi bir faaliyet bulunamadı.")}</EmptyMsg>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.allActivity", "Tüm Faaliyetlerimiz")}</PageTitle>
      <ActivityGrid>
        {activity.map((item: IActivity, index: number) => (
          <ActivityCard
            key={item._id}
            as={motion.div}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.44 }}
            viewport={{ once: true }}
          >
            <Link href={`/activity/${item.slug}`} tabIndex={-1} passHref legacyBehavior>
              <ImageWrapper as="a">
                {item.images?.[0]?.url ? (
                  <Image
                    src={item.images[0].url}
                    alt={getMultiLang(item.title)}
                    width={520}
                    height={290}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "210px",
                    }}
                    loading="lazy"
                  />
                ) : (
                  <ImgPlaceholder />
                )}
              </ImageWrapper>
            </Link>
            <CardContent>
              <CardTitle as={Link} href={`/activity/${item.slug}`}>
                {getMultiLang(item.title)}
              </CardTitle>
              <CardSummary>
                {getMultiLang(item.summary)}
              </CardSummary>
              <Meta>
                <span>
                  {t("tags", "Etiketler")}: <i>{item.tags?.join(", ") || "-"}</i>
                </span>
              </Meta>
              <ReadMore href={`/activity/${item.slug}`}>
                {t("readMore", "Devamını Oku →")}
              </ReadMore>
            </CardContent>
          </ActivityCard>
        ))}
      </ActivityGrid>
    </PageWrapper>
  );
}

// --- STYLES ---

const PageWrapper = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxxl} ${({ theme }) => theme.spacings.md} 3.5rem;
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  letter-spacing: 0.01em;
`;

const EmptyMsg = styled.div`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 3.5rem 0 2.7rem 0;
`;

const ActivityGrid = styled.div`
  display: grid;
  gap: 2.2rem 2.2rem;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  align-items: stretch;
  margin-bottom: 2.5rem;
`;

const ActivityCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1.7px solid ${({ theme }) => theme.colors.borderLight};
  min-height: 370px;
  position: relative;
  transition: box-shadow 0.17s, border-color 0.18s, transform 0.16s;
  cursor: pointer;

  &:hover, &:focus-visible {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-7px) scale(1.018);
    z-index: 1;
  }
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 210px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 600px) {
    height: 160px;
  }
`;

const ImgPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.skeleton};
  opacity: 0.44;
`;

const CardContent = styled.div`
  padding: 1.4rem 1.3rem 1.3rem 1.3rem;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
`;

const CardTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.7rem;
  line-height: 1.18;
  letter-spacing: 0.01em;
  text-decoration: none;
  cursor: pointer;

  &:hover, &:focus-visible {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const CardSummary = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 1.35rem;
  line-height: 1.62;
  min-height: 3em;
`;

const Meta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem 2.1rem;
  margin-bottom: 0.7rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.25em;
  }
`;

const ReadMore = styled(Link)`
  align-self: flex-start;
  margin-top: auto;
  display: inline-block;
  font-size: 1.04em;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: 0.46em 1.45em;
  border-radius: 18px;
  border: 1.4px solid ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  transition: background 0.17s, color 0.18s, border-color 0.16s;

  &:hover, &:focus-visible {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border-color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
`;
