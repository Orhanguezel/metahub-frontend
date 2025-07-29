"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { OrderItemList, OrderDetail } from "@/modules/order";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import type { SupportedLocale } from "@/types/common";
import { getLocalized } from "@/shared/getLocalized";
import type { IOrder } from "@/modules/order/types";

type OrderCardProps = {
  order: IOrder;
};

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [showDetail, setShowDetail] = useState(false);
  const { t, i18n } = useI18nNamespace("order", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  if (!order) return null;

  const { _id, createdAt, totalPrice, items, status, shippingAddress } = order;

  // Sipariş numarası için: id'yi temizle ve sadece son 6 karakterini al
  const orderShortId = typeof _id === "string"
    ? _id.replace(/^id/i, "").slice(-6)
    : "";

  return (
    <Card>
      <CardTopRow>
        <OrderInfo>
          <OrderNumber>
            {t("orderNumber", "Sipariş Numarası:  ")}
            <span>#{orderShortId}</span>
          </OrderNumber>
          <DateSpan>
            {createdAt
              ? new Date(createdAt).toLocaleString()
              : "-"}
          </DateSpan>
        </OrderInfo>
        <Status $status={status}>
          {t(`status.${status}`, status)}
        </Status>
      </CardTopRow>
      {shippingAddress?.name && (
        <BuyerName>
          {getLocalized(shippingAddress.name, lang)}
        </BuyerName>
      )}
      <ItemListWrapper>
        <OrderItemList items={items} lang={lang} />
      </ItemListWrapper>
      <TotalRow>
        <span>{t("total", "Total:")}</span>
        <strong>{(totalPrice ?? 0).toFixed(2)} EUR</strong>
      </TotalRow>
      <Actions>
        <ShowDetailBtn
          type="button"
          aria-expanded={showDetail}
          onClick={() => setShowDetail((v) => !v)}
        >
          {showDetail
            ? t("hideDetails", "Hide Details")
            : t("showDetails", "Show Details")}
        </ShowDetailBtn>
      </Actions>
      <DetailWrapper $show={showDetail}>
        {showDetail && <OrderDetail order={order} />}
      </DetailWrapper>
    </Card>
  );
};

export default OrderCard;

// --- Styled Components ---
const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 2.2rem 2rem 1.6rem;
  margin-bottom: 1.2rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
  @media (max-width: 640px) {
    padding: 1.3rem 0.7rem 1.1rem;
  }
`;

const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding-bottom: 0.7rem;
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.13em;
`;

const OrderNumber = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.01em;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.05em;
`;

const Status = styled.span<{ $status: string }>`
  background: ${({ $status, theme }) =>
    $status === "delivered"
      ? theme.colors.success
      : $status === "cancelled"
      ? theme.colors.danger
      : $status === "pending"
      ? theme.colors.warning
      : theme.colors.secondary};
  color: #fff;
  padding: 0.25em 1.15em;
  border-radius: 15px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  text-transform: capitalize;
  min-width: 80px;
  text-align: center;
  align-self: flex-start;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 4px #2875c216;
`;

const DateSpan = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  margin-top: 2px;
`;

const BuyerName = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 500;
  margin-bottom: 0.2em;
  margin-top: 0.25em;
  letter-spacing: 0.01em;
`;

const ItemListWrapper = styled.div`
  margin: 0.7em 0 0.1em 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-top: 1.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding-top: 0.8em;
`;

const Actions = styled.div`
  margin-top: 1.2rem;
  display: flex;
  justify-content: flex-end;
`;

const ShowDetailBtn = styled.button`
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.buttonText};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 0.55em 1.6em;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  font-weight: 500;
  letter-spacing: 0.01em;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background 0.18s;
  outline: none;
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const DetailWrapper = styled.div<{ $show: boolean }>`
  max-height: ${({ $show }) => ($show ? "1500px" : "0")};
  overflow: hidden;
  transition: max-height 0.33s cubic-bezier(.4,2,.6,1), opacity 0.22s;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  margin-top: ${({ $show }) => ($show ? "1.3rem" : "0")};
`;

