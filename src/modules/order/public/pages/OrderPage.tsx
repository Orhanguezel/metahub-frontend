"use client";

import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyOrders, clearOrderMessages } from "@/modules/order/slice/ordersSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/order";
import styled, { css } from "styled-components";
import { OrderList } from "@/modules/order";
import type { IOrder } from "@/modules/order/types";

const OrderPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.account);
  const { myOrders, error, loading, status } = useAppSelector((s) => s.orders);
  const { t } = useI18nNamespace("order", translations);

  useEffect(() => {
    if (profile && status === "idle") dispatch(fetchMyOrders());
    return () => { dispatch(clearOrderMessages()); };
  }, [dispatch, profile, status]);

  const errorMessage = useMemo(() => {
    if (!error) return "";
    if (typeof error === "string") return error;
    if (typeof (error as any)?.message === "string") return (error as any).message;
    try { return JSON.stringify(error); } catch { return String(error); }
  }, [error]);

  const hasOrders = Array.isArray(myOrders) && myOrders.length > 0;
  const showEmpty = !loading && !hasOrders && !errorMessage;

  if (!profile) {
    return (
      <OrderPageWrapper>
        <MainContent>
          <Title>{t("title", "My Orders")}</Title>
          <OrderMessage $error>
            {t("loginRequired", "Siparişlerinizi görmek için giriş yapın.")}
          </OrderMessage>
        </MainContent>
      </OrderPageWrapper>
    );
  }

  return (
    <OrderPageWrapper>
      <MainContent>
        <Title>{t("title", "My Orders")}</Title>

        {loading && <OrderMessage>{t("loading", "Loading...")}</OrderMessage>}

        {showEmpty && (
          <>
            <NoOrdersSVG>
              <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <circle cx="32" cy="32" r="32" fill="#2875c2"/>
                <path d="M16 45c0-7 7.4-13 16-13s16 6 16 13" stroke="#fff" strokeWidth="2"/>
                <circle cx="24" cy="30" r="4" fill="#fff"/>
                <circle cx="40" cy="30" r="4" fill="#fff"/>
              </svg>
            </NoOrdersSVG>
            <OrderMessage>{t("empty", "You have no orders yet.")}</OrderMessage>
          </>
        )}

        {!loading && !!errorMessage && !hasOrders && (
          <OrderMessage $error>{errorMessage}</OrderMessage>
        )}

        {!loading && hasOrders && (
          <OrderListWrapper>
            <OrderList orders={myOrders as IOrder[]} />
          </OrderListWrapper>
        )}
      </MainContent>
    </OrderPageWrapper>
  );
};

export default OrderPage;

/* ===== styled ===== */
const OrderMessage = styled.div<{ $error?: boolean }>`
  text-align: center;
  padding: 3.5rem 0 2.5rem;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ $error, theme }) =>
    $error ? theme.colors.danger : theme.colors.primaryDark};
  background: ${({ $error, theme }) =>
    $error ? theme.colors.dangerBg : theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  margin: 1.5rem 0;
  box-shadow: ${({ theme }) => theme.shadows.xs};
  transition: background 0.17s;
  ${({ $error }) => $error && css`border: 1.5px solid #ff6b6b;`}
`;

const OrderPageWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: ${({ theme }) =>
    `linear-gradient(120deg, ${theme.colors.background} 0%, ${theme.colors.backgroundSecondary} 100%)`};
  position: relative;
`;

const MainContent = styled.main`
  flex-grow: 1;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 112px 1.5rem 3rem;
  position: relative;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.extraBold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2.5rem;
  letter-spacing: -1px;
  text-align: center;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primaryTransparent};
  padding-bottom: 1.2rem;
  background: linear-gradient(90deg, #fff 70%, ${({ theme }) => theme.colors.primaryTransparent} 100%);
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 12px 0 rgba(40,117,194,0.04);
`;

const OrderListWrapper = styled.div`
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2.2rem;
`;

const NoOrdersSVG = styled.div`
  margin: 0 auto 2rem auto;
  width: 90px;
  opacity: 0.13;
  svg { width: 100%; height: auto; display: block; }
`;
