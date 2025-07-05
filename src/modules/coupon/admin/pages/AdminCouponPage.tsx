"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  clearCouponMessages,
} from "@/modules/coupon/slice/couponSlice";
import { CouponForm, CouponTable } from "@/modules/coupon";
import { Message } from "@/shared";
import { useTranslation } from "react-i18next";

const AdminCouponPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("coupon");
  const { coupons, error, successMessage } = useAppSelector((s) => s.coupon);

  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    dispatch(fetchCoupons());
    return () => {
      dispatch(clearCouponMessages());
    };
  }, [dispatch]);

  const handleEdit = (coupon: any) => setEditing(coupon);

  const handleDelete = async (id: string) => {
    await dispatch(deleteCoupon(id));
    setEditing(null);
  };

  const handleSubmit = async (data: any) => {
    if (editing) {
      await dispatch(updateCoupon({ id: editing._id, data }));
    } else {
      await dispatch(createCoupon(data));
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
      />
      <CouponTable
        coupons={coupons}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Wrapper>
  );
};

export default AdminCouponPage;

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
