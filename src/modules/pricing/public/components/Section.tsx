"use client";

import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/pricing/locales";
import { useAppSelector } from "@/store/hooks";
import { Skeleton, ErrorMessage, SeeAllBtn } from "@/shared";
import type { SupportedLocale } from "@/types/common";
import { motion } from "framer-motion";
import { useState } from "react";

export default function PricingSection() {
  const { i18n, t } = useI18nNamespace("pricing", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { pricing, loading, error } = useAppSelector((state) => state.pricing ?? []);

  const [loadingBtnId, setLoadingBtnId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Para birimini sadece sembol olarak al
  const getCurrencySymbol = (currency: string) =>
    t(`pricing.currency.${currency}`, getCurrencySymbolFallback(currency));

  // Fallback sembol (eğer çeviri dosyasında yoksa)
  function getCurrencySymbolFallback(currency: string) {
    switch (currency) {
      case "EUR": return "€";
      case "USD": return "$";
      case "TRY": return "₺";
      case "PLN": return "zł";
      case "GBP": return "£";
      default: return currency;
    }
  }

  // Periyot çevirisi
  const getPeriodLabel = (period: string) => {
    if (period === "once") return t("pricing.once", "one-time");
    if (period === "monthly") return t("pricing.monthly", "monthly");
    if (period === "yearly") return t("pricing.yearly", "yearly");
    return period;
  };

  const handleAddToCart = (plan: any) => {
    setLoadingBtnId(String(plan._id || ""));
    setTimeout(() => {
      alert(
        t("pricing.addedToCart", "Sepete eklendi!") +
        "\n" +
        (plan.title?.[lang] || plan.title?.en || "-")
      );
      setLoadingBtnId(null);
    }, 600);
  };

  const handleGetOffer = (plan: any) => {
    setLoadingBtnId(String(plan._id || ""));
    setTimeout(() => {
      alert(
        t("pricing.orderSent", "Talebiniz alınmıştır!") +
        "\n\n" +
        (plan.title?.[lang] || plan.title?.en || "-") +
        " - " +
        plan.price +
        " " +
        getCurrencySymbol(plan.currency)
      );
      setLoadingBtnId(null);
    }, 800);
  };

  if (loading) {
    return (
      <Section>
        <PricingGrid>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </PricingGrid>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <PricingGrid>
          <ErrorMessage message={error} />
        </PricingGrid>
      </Section>
    );
  }

  if (!Array.isArray(pricing) || pricing.length === 0) {
    return (
      <Section>
        <PricingGrid>
          <MainTitle>{t("page.pricing.title", "Pricing Plans")}</MainTitle>
          <Desc>{t("page.pricing.noPricing", "No pricing plans available.")}</Desc>
        </PricingGrid>
      </Section>
    );
  }

  return (
    <Section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.66 }}
      viewport={{ once: true }}
    >
      <SectionHead>
        <MinorTitle>{t("page.pricing.minorTitle", "PRICING")}</MinorTitle>
        <MainTitle>{t("page.pricing.title", "Pricing Plans")}</MainTitle>
        <Desc>{t("page.pricing.desc", "")}</Desc>
      </SectionHead>
      <PricingGrid>
        {pricing.map((plan) => {
          const desc = plan.description?.[lang] || plan.description?.en || "—";
          const features = Array.isArray(plan.features?.[lang]) ? plan.features[lang] : [];
          const id = String(plan._id || "");
          const isExpanded = expandedId === id;
          const shortDesc = desc.length > 80 ? desc.slice(0, 80) + "…" : desc;
          const shortFeatures = features.slice(0, 2);
          const hasOverflow = desc.length > 80 || features.length > 2;

          return (
            <PricingCard
              key={id}
              as={motion.div}
              layout
              aria-expanded={isExpanded}
              $expanded={isExpanded}
            >
              <CardHeader>
                <CardTitle>
                  {plan.title?.[lang] || plan.title?.en || t("page.pricing.untitled", "Untitled")}
                </CardTitle>
                {plan.isPopular && (
                  <PopularBadge>
                    {t("pricing.popular", "Popular")}
                  </PopularBadge>
                )}
              </CardHeader>
              <CardPrice>
                <span>
                  {plan.price} {getCurrencySymbol(plan.currency)}
                </span>
                <Period>
                  {getPeriodLabel(plan.period)}
                </Period>
              </CardPrice>
              <DescFeatureBox $expanded={isExpanded}>
                <Desc>
                  {isExpanded ? desc : shortDesc}
                </Desc>
                <FeaturesList>
                  {(isExpanded ? features : shortFeatures).map((feature, idx) => (
                    <li key={idx}>
                      <span>✓</span> {feature}
                    </li>
                  ))}
                  {!features.length && (
                    <NoFeatures>
                      {t("pricing.no_features", "No feature listed.")}
                    </NoFeatures>
                  )}
                </FeaturesList>
                {!isExpanded && hasOverflow && <Fade />}
              </DescFeatureBox>

              {hasOverflow && (
                <ShowMoreBtn
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={e => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : id);
                  }}
                  style={{ marginBottom: "0.9em" }}
                >
                  {isExpanded
                    ? t("pricing.showLess", "Daha Az Göster")
                    : t("pricing.showMore", "Devamını Oku")}
                </ShowMoreBtn>
              )}

              <ButtonRow>
                <OfferButton
                  disabled={loadingBtnId === id}
                  onClick={e => {
                    e.stopPropagation();
                    handleGetOffer(plan);
                  }}
                >
                  {loadingBtnId === id
                    ? t("pricing.sending", "Gönderiliyor...")
                    : t("pricing.orderBtn", "Teklifi Al")}
                </OfferButton>
                <AddCartBtn
                  disabled={loadingBtnId === id}
                  onClick={e => {
                    e.stopPropagation();
                    handleAddToCart(plan);
                  }}
                >
                  {t("pricing.addToCart", "Sepete Ekle")}
                </AddCartBtn>
              </ButtonRow>
            </PricingCard>
          );
        })}
      </PricingGrid>
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <SeeAllBtn href="/pricing">
          {t("page.pricing.all", "Tüm Fiyatlandırmalar")}
        </SeeAllBtn>
      </div>
    </Section>
  );
}

// --- STYLES ---
const Section = styled(motion.section)`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xxxl} 0 ${({ theme }) => theme.spacings.xxl};
  width: 100%;
`;

const SectionHead = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding-left: ${({ theme }) => theme.spacings.xl};
  box-sizing: border-box;
  text-align: left;

  @media (max-width: 900px) {
    padding-left: ${({ theme }) => theme.spacings.md};
  }
  @media (max-width: 600px) {
    padding-left: ${({ theme }) => theme.spacings.sm};
    margin-bottom: 1.1rem;
    text-align: center;
  }
`;

const MinorTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.accent};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.21em;
`;

const MainTitle = styled.h2`
  font-size: clamp(2.2rem, 3.3vw, 2.7rem);
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin: 0 0 0.23em 0;
  letter-spacing: -0.01em;
  line-height: 1.13;
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  line-height: 1.7;
  margin-bottom: 0.7rem;
  max-width: 520px;
  opacity: 0.93;
  padding-right: 2vw;
`;

const PricingGrid = styled.div`
  display: flex;
  gap: 2.2rem;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
`;

const PricingCard = styled.div<{ $expanded?: boolean }>`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  min-width: 320px;
  max-width: 380px;
  flex: 1 1 340px;
  margin-bottom: 2.3rem;
  padding: 2.1rem 1.6rem 1.8rem 1.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: box-shadow ${({ theme }) => theme.transition.fast}, border ${({ theme }) => theme.transition.fast};
  ${({ $expanded }) => !$expanded && `
    min-height: 340px;
    max-height: 420px;
  `}
  @media (max-width: 650px) {
    min-width: 98vw;
    max-width: 99vw;
    padding: 1.3rem 0.6rem 1.3rem 0.6rem;
  }
`;

const CardHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.6rem;
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 0.4rem;
  flex: 1 1 auto;
`;

const PopularBadge = styled.div`
  background: linear-gradient(90deg, #ffac00 60%, #f55d08 100%);
  color: #fff;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  padding: 0.19em 0.85em;
  border-radius: 12px;
  margin-left: 0.5em;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 12px 0 rgba(245,93,8,0.09);
`;

const CardPrice = styled.div`
  font-size: ${({ theme }) => theme.fontSizes["xl"]};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  margin-bottom: 1.1rem;
  text-align: center;
  span {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }
`;

const Period = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  margin-left: 6px;
`;

const DescFeatureBox = styled.div<{ $expanded?: boolean }>`
  width: 100%;
  position: relative;
  min-height: 3.2em;
  margin-bottom: 0.88em;
  max-height: ${({ $expanded }) => ($expanded ? "800px" : "6.2em")};
  overflow: hidden;
  transition: max-height ${({ theme }) => theme.transition.normal};
`;

const FeaturesList = styled.ul`
  width: 100%;
  margin: 0 0 0.3em 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.18em;
  li {
    display: flex;
    align-items: center;
    gap: 0.8em;
    font-size: ${({ theme }) => theme.fontSizes.md};
    color: ${({ theme }) => theme.colors.success};
    font-weight: 600;
    span {
      color: ${({ theme }) => theme.colors.success};
      font-size: 1.15em;
    }
  }
`;

const NoFeatures = styled.li`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
  opacity: 0.85;
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const ShowMoreBtn = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.md};
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0.28em 0 0 0;
  transition: color ${({ theme }) => theme.transition.fast};
  &:hover, &:focus {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Fade = styled.div`
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 2em;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,0.001) 0%, ${({ theme }) => theme.colors.cardBackground} 99%);
  z-index: 3;
`;

const ButtonRow = styled.div`
  width: 100%;
  display: flex;
  gap: 0.9em;
  margin-top: 1.1rem;
  justify-content: center;
`;

const OfferButton = styled.button`
  padding: 0.5em 1.25em;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.md};
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background ${({ theme }) => theme.transition.normal}, transform 0.13s, opacity 0.18s;
  &:hover:enabled,
  &:focus-visible:enabled {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: #fff;
    transform: translateY(-1.5px) scale(1.035);
  }
  &:disabled {
    opacity: 0.7;
    pointer-events: none;
    filter: grayscale(0.32);
  }
`;

const AddCartBtn = styled.button`
  padding: 0.5em 1.3em;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.success};
  color: #fff;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.md};
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background ${({ theme }) => theme.transition.normal}, transform 0.13s, opacity 0.18s;
  &:hover:enabled,
  &:focus-visible:enabled {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    transform: translateY(-1.5px) scale(1.035);
  }
  &:disabled {
    opacity: 0.6;
    pointer-events: none;
    filter: grayscale(0.35);
  }
`;
