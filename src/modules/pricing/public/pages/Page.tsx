"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/pricing/locales";
import { Skeleton, ErrorMessage } from "@/shared";
import { motion } from "framer-motion";
import type { SupportedLocale } from "@/types/common";
import type { IPricing } from "@/modules/pricing/types";
import { useState } from "react";

export default function PricingPage() {
  const { i18n, t } = useI18nNamespace("pricing", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const { pricing, loading, error } = useAppSelector((state) => state.pricing);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  // Currency kısa sembol (i18n anahtarları: "currencySymbol.EUR", "currencySymbol.USD", ...)
const getCurrencySymbol = (currency: string) => {
  // Önce i18n'den al, yoksa fallback
  const symbol = t(`currencySymbol.${currency}`, "");
  if (symbol && symbol !== `currencySymbol.${currency}`) return symbol;
  // Fallback (hiçbiri gelmezse hardcoded sembol)
  switch (currency) {
    case "EUR": return "€";
    case "USD": return "$";
    case "TRY": return "₺";
    case "PLN": return "zł";
    case "GBP": return "£";
    default: return currency;
  }
};


  // Periyot kısa çeviri
  const getPeriodLabel = (period: string) => {
    if (period === "once") return t("pricing.once", "one-time");
    if (period === "monthly") return t("pricing.monthly", "monthly");
    if (period === "yearly") return t("pricing.yearly", "yearly");
    return period;
  };

  if (loading) {
    return (
      <PageWrapper>
        <MainGrid>
          <LeftColumn>
            {[...Array(2)].map((_, i) => <Skeleton key={i} />)}
          </LeftColumn>
        </MainGrid>
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

  if (!Array.isArray(pricing) || pricing.length === 0) {
    return (
      <PageWrapper>
        <NoPricing>{t("page.noPricing", "No pricing plans found.")}</NoPricing>
      </PageWrapper>
    );
  }

  // --- Teklif Al butonu click handler ---
  const handleOrder = (item: IPricing) => {
    setRequestingId(item._id ?? "");
    setTimeout(() => {
      alert(
        t("pricing.orderSent", "Talebiniz alınmıştır!") +
        "\n\n" +
        (item.title?.[lang] || item.title?.en || "-") +
        " - " +
        item.price +
        " " +
        getCurrencySymbol(item.currency)
      );
      setRequestingId(null);
    }, 700);
  };

  // --- Sepete Ekle butonu click handler ---
  const handleAddToCart = (item: IPricing) => {
    setRequestingId(item._id ?? "");
    setTimeout(() => {
      alert(
        t("pricing.addedToCart", "Sepete eklendi!") +
        "\n" +
        (item.title?.[lang] || item.title?.en || "-")
      );
      setRequestingId(null);
    }, 500);
  };

  return (
    <PageWrapper>
      <MainGrid>
        <LeftColumn>
          {pricing.map((item: IPricing) => (
            <PricingItem
              key={item._id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PricingTitle>
                {item.title?.[lang] || item.title?.en || t("pricing.untitled", "Untitled")}
                {item.isPopular && (
                  <PopularBadge>{t("pricing.popular", "Popular")}</PopularBadge>
                )}
                {!item.isActive && (
                  <InactiveBadge>{t("pricing.inactive", "Inactive")}</InactiveBadge>
                )}
              </PricingTitle>
              <PriceBox>
                <span>
                  {item.price} {getCurrencySymbol(item.currency)}
                </span>
                <Period>{getPeriodLabel(item.period)}</Period>
              </PriceBox>
              <PricingDesc>
                {item.description?.[lang] || item.description?.en || "—"}
              </PricingDesc>
              <FeaturesList>
                {Array.isArray(item.features?.[lang]) && item.features?.[lang]?.length
                  ? item.features[lang].map((feature, idx) => (
                      <li key={idx}>
                        <span>✓</span> {feature}
                      </li>
                    ))
                  : <NoFeatures>{t("pricing.no_features", "No features listed.")}</NoFeatures>
                }
              </FeaturesList>
              <ButtonRow>
                <OrderButton
                  disabled={requestingId === item._id}
                  onClick={() => handleOrder(item)}
                >
                  {requestingId === item._id
                    ? t("pricing.sending", "Gönderiliyor...")
                    : t("pricing.orderBtn", "Teklifi Al")}
                </OrderButton>
                <AddCartBtn
                  disabled={requestingId === item._id}
                  onClick={() => handleAddToCart(item)}
                >
                  {t("pricing.addToCart", "Sepete Ekle")}
                </AddCartBtn>
              </ButtonRow>
            </PricingItem>
          ))}
        </LeftColumn>
      </MainGrid>
    </PageWrapper>
  );
}

// --- Styled Components ---
const PageWrapper = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xxl} ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.sectionBackground};
  min-height: 90vh;
`;

const MainGrid = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  width: 100%;
`;

const PricingItem = styled(motion.article)`
  background: ${({ theme }) => theme.colors.cardBackground || "#fff"};
  border-radius: 20px;
  border: 1.5px solid ${({ theme }) => theme.colors.borderLight || "#e5eaf3"};
  box-shadow: 0 3px 15px 0 rgba(40,117,194,0.09);
  padding: 2.1rem 2.3rem 1.5rem 2.3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 650px) {
    padding: 1.1rem 0.7rem 1.1rem 0.7rem;
  }
`;

const PricingTitle = styled.h2`
  font-size: 1.42rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: 0.23rem;
  line-height: 1.18;
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

const PopularBadge = styled.span`
  background: linear-gradient(90deg, #ffac00 60%, #f55d08 100%);
  color: #fff;
  font-size: 0.97em;
  font-weight: 700;
  padding: 0.14em 0.82em;
  border-radius: 10px;
  letter-spacing: 0.01em;
  box-shadow: 0 2px 12px 0 rgba(245,93,8,0.09);
`;

const InactiveBadge = styled.span`
  background: #c3c9d8;
  color: #fff;
  font-size: 0.93em;
  font-weight: 600;
  padding: 0.13em 0.8em;
  border-radius: 8px;
  margin-left: 0.38em;
`;

const PriceBox = styled.div`
  font-size: 2.08rem;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 800;
  margin-bottom: 1.02rem;
  span {
    font-size: 2.27rem;
  }
`;

const Period = styled.span`
  font-size: 0.91rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  margin-left: 6px;
`;

const PricingDesc = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.07rem;
  margin: 0.22em 0 1.22em 0;
  line-height: 1.64;
`;

const FeaturesList = styled.ul`
  width: 100%;
  margin: 0 0 1.1rem 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.33em;
  li {
    display: flex;
    align-items: center;
    gap: 0.8em;
    font-size: 1.02rem;
    color: ${({ theme }) => theme.colors.success};
    font-weight: 600;
    span {
      color: ${({ theme }) => theme.colors.success};
      font-size: 1.18em;
    }
  }
`;

const NoFeatures = styled.li`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
  opacity: 0.85;
  font-size: 0.99em;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1.15em;
  margin-top: 1.4rem;
  flex-wrap: wrap;
  justify-content: flex-start;

  @media (max-width: 650px) {
    flex-direction: column;
    gap: 0.7em;
    margin-top: 1em;
  }
`;

const OrderButton = styled.button`
  min-width: 140px;
  padding: 0.66em 1.6em;
  background: linear-gradient(90deg, #2875c2 60%, #0bb6d6 100%);
  color: #fff;
  font-size: 1.07rem;
  font-weight: 700;
  border-radius: 26px;
  border: none;
  cursor: pointer;
  transition: background 0.17s, color 0.13s, transform 0.13s, opacity 0.18s;
  box-shadow: 0 4px 14px 0 rgba(40,117,194,0.11);

  &:hover:enabled,
  &:focus-visible:enabled {
    background: linear-gradient(90deg, #0bb6d6 0%, #2875c2 100%);
    color: #fff;
    transform: translateY(-2px) scale(1.04);
  }

  &:disabled {
    opacity: 0.7;
    pointer-events: none;
    filter: grayscale(0.34);
  }
`;

const AddCartBtn = styled.button`
  min-width: 140px;
  padding: 0.66em 1.6em;
  background: ${({ theme }) => theme.colors.success};
  color: #fff;
  font-size: 1.07rem;
  font-weight: 700;
  border-radius: 26px;
  border: none;
  cursor: pointer;
  transition: background 0.18s, color 0.13s, transform 0.13s, opacity 0.18s;
  box-shadow: 0 4px 14px 0 rgba(60,160,60,0.11);

  &:hover:enabled,
  &:focus-visible:enabled {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    transform: translateY(-2px) scale(1.04);
  }

  &:disabled {
    opacity: 0.6;
    pointer-events: none;
    filter: grayscale(0.35);
  }
`;

const NoPricing = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.09rem;
  padding: 2.1rem 0 3rem 0;
  opacity: 0.86;
  text-align: center;
`;
