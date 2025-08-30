"use client";

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { OrderItemList, OrderDetail } from "@/modules/order";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import type { IOrder } from "@/modules/order/types";
import { useAppSelector } from "@/store/hooks";
import { SUPPORTED_LOCALES } from "@/types/common";

type OrderCardProps = { order: IOrder };

const currencySymbol = (code?: string) => {
  switch ((code || "").toUpperCase()) {
    case "EUR": return "€";
    case "USD": return "$";
    case "GBP": return "£";
    case "TRY": return "₺";
    default:    return code || "";
  }
};

const readDefaultCurrencyFromSettings = (settings: any[]): string => {
  const keys = ["currency_default", "default_currency", "currency"];
  const isCode = (x: unknown) => typeof x === "string" && /^[A-Za-z]{3}$/.test(x.trim());
  const pickFromTranslated = (val: Record<string, unknown>) => {
    for (const lng of SUPPORTED_LOCALES) {
      const v = (val as any)?.[lng]; if (isCode(v)) return String(v).toUpperCase();
    }
    for (const v of Object.values(val)) { if (isCode(v)) return String(v).toUpperCase(); }
    return undefined;
  };
  for (const k of keys) {
    const item = settings.find((x: any) => x?.key === k);
    const val = item?.value;
    if (isCode(val)) return String(val).toUpperCase();
    if (Array.isArray(val) && isCode(val[0])) return String(val[0]).toUpperCase();
    if (val && typeof val === "object") {
      const cur = (val as any).currency; if (isCode(cur)) return String(cur).toUpperCase();
      const fromTL = pickFromTranslated(val as Record<string, unknown>); if (fromTL) return fromTL;
    }
  }
  return "TRY";
};

const normalizeDate = (d: any): Date | undefined => {
  if (!d) return undefined;
  if (d instanceof Date) return d;
  if (typeof d === "string") return new Date(d);
  if (typeof d === "object" && "$date" in d) return new Date((d as any)["$date"]);
  return undefined;
};

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [showDetail, setShowDetail] = useState(false);
  const { t, i18n } = useI18nNamespace("order", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const settings = useAppSelector((s) => s.settings?.settingsAdmin || []);
  const defaultCurrency = useMemo(() => readDefaultCurrencyFromSettings(settings), [settings]);

  if (!order) return null;

  const created = normalizeDate(order.createdAt);
  const orderCurrency = order.currency || defaultCurrency;
  const sym = currencySymbol(orderCurrency);

  // Fallback toplam: satırların (unitPrice || priceComponents) ile toplanması + ücretler - indirim
  const itemsSubtotal = (order.items || []).reduce((acc, it) => {
    const pc = it.priceComponents;
    const unit = it.unitPrice > 0 ? it.unitPrice
      : pc ? Number(pc.base || 0) + Number(pc.modifiersTotal || 0) + Number(pc.deposit || 0)
      : 0;
    return acc + unit * (it.quantity || 0);
  }, 0);
  const fallbackFinal =
    itemsSubtotal +
    Number(order.deliveryFee || 0) +
    Number(order.serviceFee || 0) +
    Number(order.tipAmount || 0) +
    Number(order.taxTotal || 0) -
    Number(order.discount || 0);

  const totalToShow = Number(order.finalTotal || 0) > 0 ? order.finalTotal : fallbackFinal;

  const orderShortId = typeof order._id === "string"
    ? order._id.replace(/^id/i, "").slice(-6)
    : "";

  return (
    <Card>
      <CardTopRow>
        <OrderInfo>
          <OrderNumber>
            {t("orderNumber", "Sipariş Numarası:  ")} <span>#{orderShortId}</span>
          </OrderNumber>
          <DateSpan>{created ? created.toLocaleString() : "-"}</DateSpan>
        </OrderInfo>
        <StatusRow>
          <Status $status={order.status}>{t(`status.${order.status}`, order.status)}</Status>
          {order.isDelivered && <DeliveredBadge>{t("delivered", "Delivered")}</DeliveredBadge>}
        </StatusRow>
      </CardTopRow>

      {!!order.shippingAddress?.name && <BuyerName>{order.shippingAddress.name}</BuyerName>}

      <ItemListWrapper>
        <OrderItemList items={order.items} lang={lang} fallbackCurrency={orderCurrency} />
      </ItemListWrapper>

      <TotalRow>
        <span>{t("total", "Total:")}</span>
        <strong>{Number(totalToShow ?? 0).toFixed(2)} {sym}</strong>
      </TotalRow>

      <Actions>
        <ShowDetailBtn
          type="button"
          aria-expanded={showDetail}
          onClick={() => setShowDetail((v) => !v)}
        >
          {showDetail ? t("hideDetails", "Hide Details") : t("showDetails", "Show Details")}
        </ShowDetailBtn>
      </Actions>

      <DetailWrapper $show={showDetail}>
        {showDetail && <OrderDetail order={order} />}
      </DetailWrapper>
    </Card>
  );
};

export default OrderCard;

/* ===== styled ===== */
const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 2.2rem 2rem 1.6rem;
  margin-bottom: 1.2rem;
  min-width: 0;
  display: flex; flex-direction: column; gap: 1.2rem;
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  transition: box-shadow 0.2s;
  &:hover { box-shadow: ${({ theme }) => theme.shadows.lg}; }
  @media (max-width: 640px) { padding: 1.3rem 0.7rem 1.1rem; }
`;
const CardTopRow = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start; gap: 1.1rem; flex-wrap: wrap;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight}; padding-bottom: 0.7rem;
`;
const OrderInfo = styled.div` display: flex; flex-direction: column; gap: 0.13em; `;
const OrderNumber = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md}; font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.01em; color: ${({ theme }) => theme.colors.primary}; margin-bottom: 0.05em;
`;
const StatusRow = styled.div` display: flex; align-items: center; gap: 0.5rem; `;
const Status = styled.span<{ $status: string }>`
  background: ${({ $status, theme }) =>
    $status === "cancelled" ? theme.colors.danger
    : $status === "pending" ? theme.colors.warning
    : $status === "completed" ? theme.colors.success
    : theme.colors.secondary};
  color: #fff; padding: 0.25em 1.15em; border-radius: 15px;
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 500; text-transform: capitalize;
  min-width: 80px; text-align: center; align-self: flex-start; letter-spacing: 0.02em;
  box-shadow: 0 1px 4px #2875c216;
`;
const DeliveredBadge = styled.span`
  background: linear-gradient(90deg, #2875c2 0%, #0bb6d6 100%);
  color: #fff; padding: 0.25em 0.9em; border-radius: 15px; font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 600;
`;
const DateSpan = styled.span` color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.fontSizes.xsmall}; margin-top: 2px; `;
const BuyerName = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary}; font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 500; margin-bottom: 0.2em; margin-top: 0.25em; letter-spacing: 0.01em;
`;
const ItemListWrapper = styled.div` margin: 0.7em 0 0.1em 0; `;
const TotalRow = styled.div`
  display: flex; justify-content: flex-end; gap: 1em; font-size: ${({ theme }) => theme.fontSizes.md};
  margin-top: 1.5rem; font-weight: ${({ theme }) => theme.fontWeights.bold}; color: ${({ theme }) => theme.colors.primary};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight}; padding-top: 0.8em;
`;
const Actions = styled.div` margin-top: 1.2rem; display: flex; justify-content: flex-end; `;
const ShowDetailBtn = styled.button`
  border: none; background: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.buttonText};
  border-radius: ${({ theme }) => theme.radii.pill}; padding: 0.55em 1.6em; font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer; font-weight: 500; letter-spacing: 0.01em; box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background 0.18s; outline: none;
  &:hover, &:focus { background: ${({ theme }) => theme.colors.primaryHover}; }
`;
const DetailWrapper = styled.div<{ $show: boolean }>`
  max-height: ${({ $show }) => ($show ? "1500px" : "0")};
  overflow: hidden;
  transition: max-height 0.33s cubic-bezier(.4,2,.6,1), opacity 0.22s;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  margin-top: ${({ $show }) => ($show ? "1.3rem" : "0")};
`;
