"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyOrders, clearOrderMessages } from "@/modules/order/slice/ordersSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/order";
import styled from "styled-components";
import { OrderList } from "@/modules/order";
import type { IOrder } from "@/modules/order/types";

type OrderMessageProps = {
  $error?: boolean;
};

const OrderPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.account);
  const { myOrders, error, loading, status } = useAppSelector((s) => s.orders);
  const { t } = useI18nNamespace("order", translations);

  // Siparişleri sadece login olan kullanıcılar için fetch et
  useEffect(() => {
    if (profile && status === "idle") {
      dispatch(fetchMyOrders());
    }
    // Temizlik: sayfa unmount olunca mesajları sil
    return () => {
      dispatch(clearOrderMessages());
    };
  }, [dispatch, profile, status]);

  // error'u normalize et
  const errorMessage =
    typeof error === "string"
      ? error
      : error && typeof (error as any).message === "string"
      ? (error as any).message
      : error && typeof error === "object"
      ? JSON.stringify(error)
      : "";

  // 404/noOrdersFound soft hata olarak sayılır (boş state gösterir)
  const isNoOrders =
    !!errorMessage &&
    (errorMessage.includes("noOrdersFound") || errorMessage.includes("404"));

  const isValidOrders = Array.isArray(myOrders) && myOrders.length > 0;

  // Giriş yapılmamışsa hiçbir şey render etme (veya yönlendirme yapabilirsin)
  if (!profile) return null;

  return (
    <OrderPageWrapper>
      <MainContent>
        <Title>{t("title", "My Orders")}</Title>

        {loading && <OrderMessage>{t("loading", "Loading...")}</OrderMessage>}

        {/* API 404/noOrdersFound ise empty olarak göster */}
        {!loading && isNoOrders && (
          <OrderMessage>{t("empty", "You have no orders yet.")}</OrderMessage>
        )}

        {/* Diğer gerçek hatalar */}
        {!loading && !isNoOrders && !!errorMessage && (
          <OrderMessage $error>{errorMessage}</OrderMessage>
        )}

        {/* Boş ise ve hata yoksa */}
        {!loading && !isNoOrders && !errorMessage && !isValidOrders && (
          <OrderMessage>{t("empty", "You have no orders yet.")}</OrderMessage>
        )}

        {/* Siparişler varsa */}
        {!loading && !isNoOrders && !errorMessage && isValidOrders && (
          <OrderListWrapper>
            <OrderList orders={myOrders as IOrder[]} />
          </OrderListWrapper>
        )}
      </MainContent>
    </OrderPageWrapper>
  );
};

export default OrderPage;

// --- Styled Components ---
const OrderPageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.grey || "#f4f4f4"};
`;

const MainContent = styled.main`
  flex-grow: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 2rem 4rem;
  color: ${({ theme }) => theme.colors.black || "#0a0a0a"};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey || "#ddd"};
  padding-bottom: 1rem;
`;

const OrderListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const OrderMessage = styled.div<OrderMessageProps>`
  text-align: center;
  padding: 4rem 0 2rem;
  font-size: 1.15rem;
  color: ${({ $error, theme }) =>
    $error ? theme.colors.danger || "red" : theme.colors.darkGrey || "#555"};
`;
