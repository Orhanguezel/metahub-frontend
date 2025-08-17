"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  clearCouponMessages,
} from "@/modules/coupon/slice/couponSlice";
import { CouponForm, CouponTable } from "@/modules/coupon";
import { Message } from "@/shared";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/coupon";

const AdminCouponPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("coupon", translations);

  const { couponsAdmin, loading, error, successMessage } = useAppSelector((s) => s.coupon);
  const [editing, setEditing] = useState<any | null>(null);

  const count = couponsAdmin?.length ?? 0;

  useEffect(() => {
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
      await dispatch(updateCoupon({ id: editing._id, formData: data }));
    } else {
      await dispatch(createCoupon(data));
    }
    setEditing(null);
  };

  return (
    <PageWrap>
      {/* Header — About sayfasıyla aynı patern */}
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Coupon Management")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and publish your coupons")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="coupon-count">{count}</Counter>
          <PrimaryBtn
            onClick={() => {
              setEditing(null); // formu resetleyip yeni oluşturma moduna geç
            }}
          >
            + {t("create", "Create")}
          </PrimaryBtn>
        </Right>
      </Header>

      {error && <Message $error>{error}</Message>}
      {successMessage && <Message $success>{successMessage}</Message>}

      <Section>
        <SectionHead>
          <h2>{editing ? t("form.update", "Update") : t("form.create", "Create")}</h2>
        </SectionHead>
        <Card>
          <CouponForm
            onSubmit={handleSubmit}
            editing={editing}
            onCancel={() => setEditing(null)}
            loading={loading}
          />
        </Card>
      </Section>

      <Section>
        <SectionHead>
          <h2>{t("admin.list", "Coupons")}</h2>
        </SectionHead>
        <Card>
          <CouponTable
            coupons={couponsAdmin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </Card>
      </Section>
    </PageWrap>
  );
};

export default AdminCouponPage;

/* ---- styled (About/Section admin ile hizalı) ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.lg};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h1 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }

  ${({ theme }) => theme.media.mobile} {
    h1 {
      font-size: ${({ theme }) => theme.fontSizes.lg};
    }
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Right = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
`;

const Counter = styled.span`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacings.xl};
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.sm};

  h2 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes.lg};
    color: ${({ theme }) => theme.colors.title};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;

const PrimaryBtn = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;
