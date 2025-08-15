"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/services/locales/index";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { SupportedLocale } from "@/types/common";
import type { IServices } from "@/modules/services/types";

export default function Page() {
  const { i18n, t } = useI18nNamespace("services", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { services, loading, error } = useAppSelector((state) => state.services);

  // Register translations (multi-language)
  Object.entries(translations).forEach(([lng, resources]) => {
    if (!i18n.hasResourceBundle(lng, "services")) {
      i18n.addResourceBundle(lng, "services", resources, true, true);
    }
  });

  if (loading) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allServices", "All Our Services")}</PageTitle>
        <ServicesGrid>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </ServicesGrid>
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

  if (!services || services.length === 0) {
    return (
      <PageWrapper>
        <PageTitle>{t("page.allServices", "All Our Services")}</PageTitle>
        <EmptyMsg>{t("page.noServices", "No services found.")}</EmptyMsg>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>{t("page.allServices", "All Our Services")}</PageTitle>
      <ServicesGrid>
        {services.map((item: IServices, index: number) => (
          <ServicesCard
            key={item._id}
            as={motion.div}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.44 }}
            viewport={{ once: true }}
          >
            <Link href={`/services/${item.slug}`} tabIndex={-1}>
              <ImageWrapper>
                {item.images?.[0]?.url ? (
                  <Image
                    src={item.images[0].url}
                    alt={item.title[lang] || Object.values(item.title)[0] || `services-${index}`}
                    width={520}
                    height={290}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "210px",
                    }}
                  />
                ) : (
                  <ImgPlaceholder />
                )}
              </ImageWrapper>
            </Link>
            <CardContent>
              <CardTitle as={Link} href={`/services/${item.slug}`}>
                {item.title[lang] || Object.values(item.title)[0] || "—"}
              </CardTitle>
              <CardSummary>
                {item.summary[lang] || Object.values(item.summary)[0] || "—"}
              </CardSummary>
              <Meta>
                <span>
                  {t("tags", "Tags")}: <i>{item.tags?.join(", ") || "-"}</i>
                </span>
              </Meta>
              <ReadMore href={`/services/${item.slug}`}>
                {t("readMore", "Read More →")}
              </ReadMore>
              <BookNowButton href="/contactme">
                {t("form.bookNow", "Get a Quote")}
              </BookNowButton>
            </CardContent>
          </ServicesCard>
        ))}
      </ServicesGrid>
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

const ServicesGrid = styled.div`
  display: grid;
  gap: 2.2rem 2.2rem;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  align-items: stretch;
  margin-bottom: 2.5rem;
`;

const ServicesCard = styled(motion.div)`
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

const BookNowButton = styled(Link)`
  align-self: flex-start;
  margin-top: 0.8rem;
  display: inline-block;
  font-size: 1.02em;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: 0.42em 1.35em;
  border-radius: 16px;
  border: 1.3px dashed ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  transition: all 0.2s ease-in-out;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.accent};
    color: #fff;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;
