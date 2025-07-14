"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/order";
import {
  OrderTable,
  OrderDetailModal,
  DeleteOrderModal,
} from "@/modules/order";
import styled from "styled-components";
import { Message } from "@/shared";
import type { IOrder } from "@/modules/order/types";

// --- Page Component ---
const AdminOrderPage: React.FC = () => {
  const { ordersAdmin, loading, error, successMessage } = useAppSelector(
    (state) => state.orders
  );
  const { t } = useI18nNamespace("order", translations);
 

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  return (
    <PageContainer>
      <HeaderBar>
        <PageTitle>{t("admin.title", "All Orders")}</PageTitle>
      </HeaderBar>

      {loading && <Message>{t("loading", "Loading...")}</Message>}
      {error && <Message $error>{error}</Message>}
      {successMessage && <Message $success>{successMessage}</Message>}

      <TableSection>
        <OrderTable
          orders={ordersAdmin}
          onShowDetail={setSelectedOrder}
          onDelete={setDeleteOrderId}
        />
      </TableSection>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
      {/* Delete Modal */}
      {deleteOrderId && (
        <DeleteOrderModal
          id={deleteOrderId}
          onClose={() => setDeleteOrderId(null)}
        />
      )}
    </PageContainer>
  );
};

export default AdminOrderPage;

// --- Styled Components ---
const PageContainer = styled.main`
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background || "#f7f8fa"};
  padding: 110px 0 30px 0;

  @media (max-width: 800px) {
    padding-top: 80px;
    padding-bottom: 10vw;
  }
`;

const HeaderBar = styled.div`
  max-width: 1400px;
  margin: 0 auto 2.2rem auto;
  padding: 0 2vw;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media (max-width: 600px) {
    margin-bottom: 1.2rem;
    padding: 0 6vw;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  letter-spacing: -0.5px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border || "#e0e0e0"};
  width: 100%;
  text-align: left;

  @media (max-width: 600px) {
    font-size: 1.4rem;
    padding-bottom: 6px;
  }
`;

const TableSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.card || "#fff"};
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.06);
  border-radius: ${({ theme }) => theme.radii.md || "14px"};
  padding: 36px 38px 22px 38px;
  min-height: 420px;
  @media (max-width: 900px) {
    max-width: 98vw;
    padding: 17px 7vw 17px 7vw;
    border-radius: 11px;
  }
  @media (max-width: 600px) {
    min-width: unset;
    padding: 11px 1vw 11px 1vw;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
    border-radius: 7px;
  }
`;
