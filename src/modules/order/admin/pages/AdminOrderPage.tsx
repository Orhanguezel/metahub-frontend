"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import { OrderTable, OrderDetailModal, DeleteOrderModal } from "@/modules/order";
import styled from "styled-components";
import { Message } from "@/shared";
import type { IOrder } from "@/modules/order/types";

const AdminOrderPage: React.FC = () => {
  const { ordersAdmin, loading, error, successMessage } = useAppSelector((state) => state.orders);
  const { t } = useI18nNamespace("order", translations);

  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  const count = Array.isArray(ordersAdmin) ? ordersAdmin.length : 0;

  return (
    <PageWrap>
      {/* Header — activity/opsjobs paternine uyumlu */}
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "All Orders")}</h1>
          <Subtitle>{t("admin.subtitle", "Manage and track customer orders")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="orders-count">{count}</Counter>
        </Right>
      </Header>

      <Section>
        <SectionHead>
          <h2>{t("admin.list", "Orders")}</h2>
        </SectionHead>

        <Card>
          {loading && <Message>{t("loading", "Loading...")}</Message>}
          {error && <Message $error>{error}</Message>}
          {successMessage && <Message $success>{successMessage}</Message>}

          <TableBlock>
            <OrderTable
              orders={ordersAdmin}
              onShowDetail={setSelectedOrder}
              onDelete={setDeleteOrderId}
            />
          </TableBlock>
        </Card>
      </Section>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {deleteOrderId && (
        <DeleteOrderModal id={deleteOrderId} onClose={() => setDeleteOrderId(null)} />
      )}
    </PageWrap>
  );
};

export default AdminOrderPage;

/* ---- styled (opsjobs patern) ---- */
const PageWrap = styled.main`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column; align-items: flex-start; gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const TitleBlock = styled.div`
  display:flex; flex-direction:column; gap:4px;
  h1 { margin: 0; }
`;

const Subtitle = styled.p`
  margin:0; color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;

const Right = styled.div`display:flex; gap:${({ theme }) => theme.spacings.sm}; align-items:center;`;

const Counter = styled.span`
  padding: 6px 10px; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const Section = styled.section`margin-top: ${({ theme }) => theme.spacings.sm};`;

const SectionHead = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.sm};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;

const TableBlock = styled.div`
  margin-top: ${({ theme }) => theme.spacings.sm};
`;
