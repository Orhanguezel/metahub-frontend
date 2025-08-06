"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/pricing/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createPricing,
  updatePricing,
  deletePricing,
} from "@/modules/pricing/slice/pricingSlice";

import { FormModal, List, Tabs } from "@/modules/pricing";
import type { IPricing } from "@/modules/pricing/types";

export default function AdminPricingPage() {
  const { i18n, t } = useI18nNamespace("pricing", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const dispatch = useAppDispatch();

  // Admin pricing (slice’tan geliyor)
  const pricing = useAppSelector((state) => state.pricing.pricingAdmin || []);
  const loading = useAppSelector((state) => state.pricing.loading);
  const error = useAppSelector((state) => state.pricing.error);

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingItem, setEditingItem] = useState<IPricing | null>(null);

  // Sayfa ilk yüklendiğinde listeyi çek
  // (NOT: SSR/CSR ortamına göre useEffect ile fetchAllPricingAdmin tetikleyebilirsin.)

  // --- SUBMIT ---
  const handleSubmit = async (values: Partial<IPricing>, id?: string) => {
    if (id) {
      await dispatch(updatePricing({ id, payload: values }));
    } else {
      await dispatch(createPricing(values));
    }
    setEditingItem(null);
    setActiveTab("list");
    // Yeniden liste çekmek gerekiyorsa:
    // await dispatch(fetchAllPricingAdmin());
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_pricing",
      "Bu fiyat paketini silmek istediğinize emin misiniz?"
    );
    if (window.confirm(confirmMsg)) {
      await dispatch(deletePricing(id));
    }
  };

  // Yayın durumu değişikliği: direkt updatePricing ile
  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await dispatch(updatePricing({ id, payload: { isPublished: !isPublished } }));
  };

  return (
    <Wrapper>
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <List
            pricing={pricing}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={(item) => {
              setEditingItem(item);
              setActiveTab("create");
            }}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {activeTab === "create" && (
          <FormModal
            isOpen
            initialData={editingItem}
            onClose={() => {
              setEditingItem(null);
              setActiveTab("list");
            }}
            onSubmit={handleSubmit}
          />
        )}
      </TabContent>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 1200px;
  margin: auto;
  padding: ${({ theme }) => theme.layout.sectionspacings}
    ${({ theme }) => theme.spacings.md};
`;

const TabContent = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
`;
