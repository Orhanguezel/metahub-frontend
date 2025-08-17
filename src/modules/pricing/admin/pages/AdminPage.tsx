"use client";

import styled from "styled-components";
import { useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/pricing/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";

import {
  createPricing,
  updatePricing,
  deletePricing,
} from "@/modules/pricing/slice/pricingSlice";

import { FormModal, List } from "@/modules/pricing";
import type { IPricing } from "@/modules/pricing/types";

/* --- helpers --- */
const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(two)
    ? (two as SupportedLocale)
    : "tr";
};

export default function AdminPricingPage() {
  const { i18n, t } = useI18nNamespace("pricing", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const dispatch = useAppDispatch();

  // Store’dan okuma (fetch parent’ta)
  const pricing = useAppSelector((state) => state.pricing.pricingAdmin || []);
  const loading = useAppSelector((state) => state.pricing.loading);
  const error = useAppSelector((state) => state.pricing.error);

  // UI state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<IPricing | null>(null);

  // Actions
  const handleSubmit = async (values: Partial<IPricing>, id?: string) => {
    try {
      if (id) {
        await (dispatch(updatePricing({ id, payload: values })) as any).unwrap?.();
      } else {
        await (dispatch(createPricing(values)) as any).unwrap?.();
      }
      setEditingItem(null);
      setIsFormOpen(false);
    } catch {
      /* hata slice’ta yönetiliyor */
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_pricing",
      "Bu fiyat paketini silmek istediğinize emin misiniz?"
    );
    if (window.confirm(confirmMsg)) {
      try {
        await (dispatch(deletePricing(id)) as any).unwrap?.();
      } catch {}
    }
  };

  // Yayın durumu (toggle) — slice’ta ayrı action yoksa update ile tersine çevir
  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await dispatch(updatePricing({ id, payload: { isPublished: !isPublished } }) as any);
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };
  const openEdit = (item: IPricing) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const count = pricing?.length ?? 0;

  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Pricing Plans")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and publish your pricing plans")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="pricing-count">{count}</Counter>
          <PrimaryBtn onClick={openCreate}>+ {t("create", "Create")}</PrimaryBtn>
        </Right>
      </Header>

      <Section>
        <SectionHead>
          <h2>{t("list", "List")}</h2>
          <SmallBtn disabled>{t("managedByParent", "Managed by parent fetch")}</SmallBtn>
        </SectionHead>

        <Card>
          <List
            pricing={pricing}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={openEdit}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        </Card>
      </Section>

      {/* Form (modal benzeri) */}
      <FormModal
        isOpen={isFormOpen}
        initialData={editingItem}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </PageWrap>
  );
}

/* ---- styled (Portfolio sayfası ile birebir) ---- */
const PageWrap = styled.div`
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
const TitleBlock = styled.div`display:flex; flex-direction:column; gap:4px; h1{margin:0;}`;
const Subtitle = styled.p`margin:0; color:${({theme})=>theme.colors.textSecondary}; font-size:${({theme})=>theme.fontSizes.sm};`;
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
const PrimaryBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} transparent;
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
  transition: opacity ${({ theme }) => theme.transition.normal};
  &:hover { opacity: ${({ theme }) => theme.opacity.hover}; background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;
const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
