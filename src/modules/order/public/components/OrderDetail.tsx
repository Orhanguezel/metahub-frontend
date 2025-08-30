"use client";

import React, { useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import styled from "styled-components";
import type { OrderStatus, IOrderItem, IOrder } from "@/modules/order/types";
import { useAppSelector } from "@/store/hooks";
import { SUPPORTED_LOCALES } from "@/types/common";

/* ---------- helpers ---------- */
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
  const isCode = (x: unknown) =>
    typeof x === "string" && /^[A-Za-z]{3}$/.test((x as string).trim());
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

/* ---------- component ---------- */
interface OrderDetailProps {
  order: IOrder;
}

const pickUnit = (it: IOrderItem) => {
  const pc = it.priceComponents;
  const sumPc = pc ? Number(pc.base || 0) + Number(pc.modifiersTotal || 0) + Number(pc.deposit || 0) : 0;

  const candidates = [
    Number(it.unitPrice || 0),
    sumPc,
    Number((it as any).priceAtAddition || 0),
    ((it as any).totalPriceAtAddition && it.quantity ? Number((it as any).totalPriceAtAddition) / it.quantity : 0),
  ];

  return candidates.find((n) => typeof n === "number" && isFinite(n) && n > 0) || 0;
};

const OrderDetail: React.FC<OrderDetailProps> = ({ order }) => {
  const { t, i18n } = useI18nNamespace("order", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const settings = useAppSelector((s) => s.settings?.settingsAdmin || []);
  const defaultCurrency = useMemo(() => readDefaultCurrencyFromSettings(settings), [settings]);

  if (!order) return null;

  const orderCurrency = order.currency || defaultCurrency;
  const orderSym = currencySymbol(orderCurrency);

  const created = normalizeDate(order.createdAt);
  const deliveredAt = normalizeDate(order.deliveredAt);

  const itemsSubtotal = (order.items || []).reduce((acc, it) => acc + pickUnit(it) * (it.quantity || 0), 0);

  const finalTotal =
    Number(order.finalTotal || 0) > 0
      ? Number(order.finalTotal)
      : itemsSubtotal +
        Number(order.deliveryFee || 0) +
        Number(order.serviceFee || 0) +
        Number(order.tipAmount || 0) +
        Number(order.taxTotal || 0) -
        Number(order.discount || 0);

  return (
    <Container>
      <Section>
        <DetailTitle>{t("detail.title", "Sipariş Detayı")}</DetailTitle>

        <Row>
          <Label>{t("orderId", "Sipariş No")}</Label>
          <Value>{order._id}</Value>
        </Row>

        <Row>
          <Label>{t("createdAt", "Oluşturulma")}</Label>
          <Value>{created ? created.toLocaleString() : "-"}</Value>
        </Row>

        <Row>
          <Label>{t("status", "Sipariş Durumu")}</Label>
          <BadgeRow>
            <OrderStatusBadge $status={order.status}>
              {t(`status.${order.status}`, order.status)}
            </OrderStatusBadge>
            {order.isDelivered && <DeliveredBadge>{t("delivered", "Delivered")}</DeliveredBadge>}
            {order.isPaid && <PaidBadge>{t("paid", "Paid")}</PaidBadge>}
            {deliveredAt && <SmallNote>({t("deliveredAt", "Teslim")} {deliveredAt.toLocaleString()})</SmallNote>}
          </BadgeRow>
        </Row>

        <Row>
          <Label>{t("serviceType", "Servis Tipi")}</Label>
          <Value>{order.serviceType || "-"}</Value>
        </Row>

        {order.branch && (
          <Row>
            <Label>{t("branch", "Şube")}</Label>
            <Value>{String((order as any).branch?._id || order.branch)}</Value>
          </Row>
        )}
      </Section>

      <Section>
        <SubTitle>{t("productDetails", "Ürünler")}</SubTitle>

        {order.items.map((item: IOrderItem, index: number) => {
          const snap = item.menu?.snapshot;

          const snapName =
            (snap?.name && (snap.name as any)?.[lang]) ||
            (snap?.name && (snap.name as any)?.en);

          const productName =
            snapName ?? (item as any)?.product?.name?.[lang] ?? (item as any)?.product?.name?.en ?? "-";

          const variantName =
            (snap?.variantName && (snap.variantName as any)?.[lang]) ||
            (snap?.variantName && (snap.variantName as any)?.en) ||
            "";

          const variantCode = item.menu?.variantCode || "";
          const sizeLabel =
            (snap?.sizeLabel && (snap.sizeLabel as any)?.[lang]) ||
            (snap?.sizeLabel && (snap.sizeLabel as any)?.["en"]) ||
            "";

          const modsCodes =
            item.menu?.modifiers?.length
              ? item.menu.modifiers
                  .map((m) => `${m.groupCode}:${m.optionCode}${m.quantity && m.quantity > 1 ? `×${m.quantity}` : ""}`)
                  .join(", ")
              : "";

          const pc = item.priceComponents;
          const unitCurrencyCode = item.unitCurrency || pc?.currency || orderCurrency;
          const unitSym = currencySymbol(unitCurrencyCode);

          const unit =
            typeof item.unitPrice === "number" && item.unitPrice > 0
              ? item.unitPrice
              : pc
              ? Number(pc.base || 0) + Number(pc.modifiersTotal || 0) + Number(pc.deposit || 0)
              : 0;

          const lineTotal = unit * (item.quantity || 0);

          const dietaryTags = [
            snap?.dietary?.vegetarian ? t("diet.veg", "Vegetarian") : null,
            snap?.dietary?.vegan ? t("diet.vegan", "Vegan") : null,
            snap?.dietary?.containsAlcohol ? t("diet.alcohol", "Alcohol") : null,
            typeof snap?.dietary?.spicyLevel === "number" && snap?.dietary?.spicyLevel > 0
              ? `${t("diet.spicy", "Spicy")} ${"🌶".repeat(Math.min(3, snap?.dietary?.spicyLevel))}`
              : null,
          ].filter(Boolean) as string[];

          const allergens = Array.isArray(snap?.allergens) ? snap!.allergens : [];
          const additives = Array.isArray(snap?.additives) ? snap!.additives : [];

          return (
            <ProductBlock key={index}>
              <div>
                <strong>
                  {productName}
                  {variantName ? ` (${variantName})` : ""}
                  {sizeLabel ? ` — ${sizeLabel}` : ""}
                  {!variantName && variantCode ? ` [${variantCode}]` : ""}
                </strong>

                {!!modsCodes && <ProductDesc>{modsCodes}</ProductDesc>}

                {/* Snapshot detayları */}
                {dietaryTags.length > 0 && (
                  <ProductDesc>{dietaryTags.join(" • ")}</ProductDesc>
                )}
                {allergens.length > 0 && (
                  <ProductDesc>
                    {t("detail.allergens", "Alerjenler")}:{" "}
                    {allergens.map((a) => (a?.value?.[lang] || a?.key)).join(", ")}
                  </ProductDesc>
                )}
                {additives.length > 0 && (
                  <ProductDesc>
                    {t("detail.additives", "Katkı Maddeleri")}:{" "}
                    {additives.map((a) => (a?.value?.[lang] || a?.key)).join(", ")}
                  </ProductDesc>
                )}

                {item.menu?.notes && <ProductDesc>“{item.menu.notes}”</ProductDesc>}

                {/* Fiyat kırılımı */}
                {pc ? (
                  <>
                    <ProductDesc>
                      {t("detail.base", "Baz")}: {Number(pc.base || 0).toFixed(2)} {unitSym}
                      {!!pc.modifiersTotal && (
                        <> • {t("detail.mods", "Ekler")}: {Number(pc.modifiersTotal).toFixed(2)} {unitSym}</>
                      )}
                      {!!pc.deposit && (
                        <> • {t("detail.deposit", "Depozito")}: {Number(pc.deposit).toFixed(2)} {unitSym}</>
                      )}
                    </ProductDesc>

                    {Array.isArray(pc.modifiers) && pc.modifiers.length > 0 && (
                      <ModifiersTable>
                        <thead>
                          <tr>
                            <th>{t("detail.modifier", "Seçenek")}</th>
                            <th>{t("quantity", "Adet")}</th>
                            <th>{t("unitPrice", "Birim")}</th>
                            <th>{t("lineTotal", "Toplam")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pc.modifiers.map((m, i) => (
                            <tr key={i}>
                              <td>{m.code}</td>
                              <td>{m.qty}</td>
                              <td>{Number(m.unitPrice || 0).toFixed(2)} {unitSym}</td>
                              <td>{Number(m.total || 0).toFixed(2)} {unitSym}</td>
                            </tr>
                          ))}
                        </tbody>
                      </ModifiersTable>
                    )}
                  </>
                ) : (
                  <ProductDesc>{t("detail.noPriceInfo", "Fiyat bilgisi bulunamadı.")}</ProductDesc>
                )}
              </div>

              <ProductDetails>
                <span>{t("quantity", "Adet")}: <b>{item.quantity}</b></span>
                <span>{t("unitPrice", "Birim Fiyat")}: <b>{unit.toFixed(2)} {unitSym}</b></span>
                <span>{t("lineTotal", "Satır Toplam")}: <b>{lineTotal.toFixed(2)} {unitSym}</b></span>
              </ProductDetails>
            </ProductBlock>
          );
        })}
      </Section>

      <Section>
        <SubTitle>{t("total", "Toplam Fiyat")}</SubTitle>
        <TotalsTable>
          <tbody>
            <tr>
              <td>{t("subtotal", "Ara Toplam")}</td>
              <td>{Number(order.subtotal || itemsSubtotal || 0).toFixed(2)} {orderSym}</td>
            </tr>
            {order.deliveryFee ? (
              <tr>
                <td>{t("deliveryFee", "Teslimat Ücreti")}</td>
                <td>{Number(order.deliveryFee).toFixed(2)} {orderSym}</td>
              </tr>
            ) : null}
            {order.serviceFee ? (
              <tr>
                <td>{t("serviceFee", "Hizmet Ücreti")}</td>
                <td>{Number(order.serviceFee).toFixed(2)} {orderSym}</td>
              </tr>
            ) : null}
            {order.tipAmount ? (
              <tr>
                <td>{t("tipAmount", "Bahşiş")}</td>
                <td>{Number(order.tipAmount).toFixed(2)} {orderSym}</td>
              </tr>
            ) : null}
            {order.taxTotal ? (
              <tr>
                <td>{t("taxTotal", "Vergi")}</td>
                <td>{Number(order.taxTotal).toFixed(2)} {orderSym}</td>
              </tr>
            ) : null}
            {order.discount ? (
              <tr>
                <td>{t("discount", "İndirim")}</td>
                <td>-{Number(order.discount).toFixed(2)} {orderSym}</td>
              </tr>
            ) : null}
            <tr>
              <td><strong>{t("finalTotal", "Genel Toplam")}</strong></td>
              <td><strong>{Number(finalTotal || 0).toFixed(2)} {orderSym}</strong></td>
            </tr>
          </tbody>
        </TotalsTable>
      </Section>

      {order.shippingAddress && (
        <Section>
          <SubTitle>{t("shippingAddress", "Teslimat Adresi")}</SubTitle>
          <AddressTable>
            <tbody>
              <tr>
                <td>{t("name", "Alıcı")}</td>
                <td>{order.shippingAddress?.name}</td>
              </tr>
              <tr>
                <td>{t("phone", "Telefon")}</td>
                <td>{order.shippingAddress?.phone}</td>
              </tr>
              <tr>
                <td>{t("address", "Adres")}</td>
                <td>
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}
                  {order.shippingAddress?.postalCode ? ` (${order.shippingAddress.postalCode})` : ""}, {order.shippingAddress?.country}
                </td>
              </tr>
            </tbody>
          </AddressTable>
        </Section>
      )}

      <Section>
        <SubTitle>{t("paymentMethod", "Ödeme Yöntemi")}</SubTitle>
        <Value>{order.paymentMethod}</Value>
      </Section>
    </Container>
  );
};

export default OrderDetail;

/* ===================== Styled ===================== */
const Container = styled.div`
  max-width: 750px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 2.5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.3rem;
  @media (max-width: 800px) { padding: 1.5rem 0.7rem 1.3rem; }
`;
const Section = styled.section` margin-bottom: 0.2rem; `;
const DetailTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 800; margin-bottom: 1.1rem; letter-spacing: -0.5px;
`;
const SubTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 600; margin-bottom: 0.9rem; letter-spacing: -0.2px;
`;
const Row = styled.div`
  display: flex; align-items: center; margin-bottom: 0.38em; gap: 1.2em;
  @media (max-width: 500px) { flex-direction: column; gap: 0.3em; align-items: flex-start; }
`;
const Label = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 120px; font-weight: 500;
`;
const Value = styled.div` font-size: ${({ theme }) => theme.fontSizes.md}; color: ${({ theme }) => theme.colors.text}; word-break: break-all; `;
const BadgeRow = styled.div` display: flex; gap: 0.5rem; align-items: center; `;
const SmallNote = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

type BadgeProps = { $status?: OrderStatus };
const OrderStatusBadge = styled.div<BadgeProps>`
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 700;
  padding: 0.32em 1.35em; border-radius: 2em; color: #fff;
  background: ${({ $status }) =>
    $status === "completed" ? "linear-gradient(90deg, #28C76F 30%, #1E9A5B 100%)"
    : $status === "pending" ? "linear-gradient(90deg, #FFC107 40%, #E0A800 100%)"
    : $status === "cancelled" ? "linear-gradient(90deg, #FF6B6B 30%, #E53935 100%)"
    : "linear-gradient(90deg, #688EB3 0%, #23405B 100%)"};
  text-shadow: 0 2px 8px #2221; display: inline-block; min-width: 110px; text-align: center; letter-spacing: .04em; border: none;
`;
const DeliveredBadge = styled(OrderStatusBadge).attrs<BadgeProps>({ $status: "shipped" })`
  background: linear-gradient(90deg, #2875c2 0%, #0bb6d6 100%);
`;
const PaidBadge = styled(OrderStatusBadge).attrs<BadgeProps>({ $status: "completed" })`
  background: linear-gradient(90deg, #6a5acd 0%, #3f3fc5 100%);
`;

const ProductBlock = styled.div`
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  padding: 1.1em 1.3em 1.1em 1.1em; margin-bottom: 1.2em;
  display: flex; flex-direction: column; gap: 0.65em;
  @media (max-width: 600px) { padding: 0.8em 0.7em; }
`;
const ProductDesc = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xsmall}; margin-top: 0.14em;
`;
const ProductDetails = styled.div`
  display: flex; gap: 2.3em; font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary}; margin-top: 0.4em;
  @media (max-width: 500px) { flex-direction: column; gap: 0.2em; }
`;

const ModifiersTable = styled.table`
  width: 100%; border-collapse: collapse; margin-top: .3rem;
  th, td { text-align: left; padding: .35rem .4rem; font-size: ${({ theme }) => theme.fontSizes.xsmall}; }
  thead th { color: ${({ theme }) => theme.colors.textMuted}; font-weight: 600; }
  tbody td:last-child, thead th:last-child { text-align: right; }
`;

const TotalsTable = styled.table`
  width: 100%; font-size: ${({ theme }) => theme.fontSizes.sm}; border-collapse: collapse;
  td { padding: 0.32em 0.7em 0.32em 0; border: none;
    &:first-child { color: ${({ theme }) => theme.colors.textMuted}; }
    &:last-child { text-align: right; }
  }
`;
const AddressTable = styled.table`
  width: 100%; font-size: ${({ theme }) => theme.fontSizes.sm}; background: transparent; border-collapse: collapse;
  td {
    padding: 0.32em 0.7em 0.32em 0; border: none; color: ${({ theme }) => theme.colors.text};
    &:first-child { font-weight: 500; color: ${({ theme }) => theme.colors.textMuted}; min-width: 80px; }
  }
`;
