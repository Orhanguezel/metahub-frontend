"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  createCouponAdmin,
  updateCouponAdmin,
  deleteCouponAdmin,
  clearCouponMessages,
} from "@/modules/coupon/slice/couponSlice";
import { CouponForm, CouponTable } from "@/modules/coupon";
import { Message } from "@/shared";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

const AdminCouponPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("coupon", translations);

  // Merkezi fetch edilen coupon slice!
  const { coupons } = useAppSelector((s) => s.coupon);
  // Slice yapısı: { coupons: Coupon[], loading, error, successMessage }
  const couponList = coupons?.coupons || [];
  const loading = coupons?.loading;
  const error = coupons?.error;
  const successMessage = coupons?.successMessage;

  const [editing, setEditing] = useState<any | null>(null);

  // Temizlik sadece sayfa unmount'ta yapılır!
  React.useEffect(() => {
    return () => {
      dispatch(clearCouponMessages());
    };
  }, [dispatch]);

  const handleEdit = (coupon: any) => setEditing(coupon);

  const handleDelete = async (id: string) => {
    await dispatch(deleteCouponAdmin(id));
    setEditing(null);
  };

  const handleSubmit = async (data: any) => {
    if (editing) {
      await dispatch(updateCouponAdmin({ id: editing._id, data }));
    } else {
      await dispatch(createCouponAdmin(data));
    }
    setEditing(null);
  };

  return (
    <Wrapper>
      <Header>
        <Title>{t("admin.title", "Coupon Management")}</Title>
      </Header>

      {error && <Message $error>{error}</Message>}
      {successMessage && <Message $success>{successMessage}</Message>}

      <CouponForm
        onSubmit={handleSubmit}
        editing={editing}
        onCancel={() => setEditing(null)}
        loading={loading}
      />
      <CouponTable
        coupons={couponList}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
    </Wrapper>
  );
};

export default AdminCouponPage;

// --- Styled Components ---
const Wrapper = styled.div`
  max-width: 900px;
  margin: 32px auto;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacings.xl};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.lg};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;
