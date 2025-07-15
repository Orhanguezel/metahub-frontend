"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  checkCouponByCode,
  clearCouponMessages,
  clearCurrentCoupon,
} from "@/modules/coupon/slice/couponSlice";
import { Message } from "@/shared";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/coupon";
import type { SupportedLocale } from "@/types/common";

const CouponPage: React.FC = () => {
  const { t, i18n } = useI18nNamespace("coupon", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const dispatch = useAppDispatch();

  // Coupon slice
  const { current, loading, error, successMessage } = useAppSelector((s) => s.coupon);

  const [code, setCode] = useState("");

  // Her sayfa açılışında kupon mesajlarını ve seçili kuponu temizle!
  useEffect(() => {
    dispatch(clearCouponMessages());
    dispatch(clearCurrentCoupon());
    return () => {
      dispatch(clearCouponMessages());
      dispatch(clearCurrentCoupon());
    };
  }, [dispatch]);

  // Form submit
  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    await dispatch(checkCouponByCode(code.trim()));
  };

  // Coupon detail alanı: hem public slice hem admin slice'ta çalışır.
  const isValidCoupon = !!current && !!current.code && current.isActive !== false;

  return (
    <Wrapper>
      <Title>{t("page.title", "Apply Coupon")}</Title>
      <Form onSubmit={handleCheck}>
        <Input
          type="text"
          placeholder={t("form.code", "Enter coupon code")}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoFocus
          spellCheck={false}
        />
        <Button type="submit" disabled={loading || !code.trim()}>
          {loading ? t("form.checking", "Checking...") : t("form.check", "Check Coupon")}
        </Button>
        {error && <Message $error>{error}</Message>}
        {successMessage && <Message $success>{successMessage}</Message>}
      </Form>

      {/* Kupon detayı sadece geçerli ve aktif ise göster */}
      {isValidCoupon && (
        <CouponDetail>
          <h3>{current.title?.[lang] || current.title?.en || "-"}</h3>
          <div>
            {t("label.discount", "Discount")}: <strong>{current.discount}%</strong>
          </div>
          <div>
            {t("label.expiresAt", "Expires at")}:{" "}
            <strong>
              {current.expiresAt
                ? new Date(current.expiresAt).toLocaleDateString(lang)
                : t("form.noExpire", "-")}
            </strong>
          </div>
          {current.description && (
            <p style={{ marginTop: 8, color: "#666" }}>
              {current.description?.[lang] || current.description?.en || "-"}
            </p>
          )}
        </CouponDetail>
      )}
    </Wrapper>
  );
};

export default CouponPage;

// --- Styled Components (değişmedi) ---
const Wrapper = styled.div`
  max-width: 420px;
  margin: 48px auto;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
  width: 100%;
`;

const Input = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 1.05rem;
  outline: none;
  width: 100%;
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  padding: 10px 0;
  border-radius: 999px;
  border: none;
  font-weight: 700;
  font-size: 1.08rem;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
  transition: background 0.2s;
`;

const CouponDetail = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xl};
  padding: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  text-align: center;
`;
