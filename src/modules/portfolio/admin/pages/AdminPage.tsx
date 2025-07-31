"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/portfolio/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  togglePublishPortfolio,
} from "@/modules/portfolio/slice/portfolioSlice";

import {
  FormModal,
  List,
  Tabs,
} from "@/modules/portfolio";

import { IPortfolio } from "@/modules/portfolio/types";

export default function AdminPortfolioPage() {
  const { i18n, t } = useI18nNamespace("portfolio", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Sadece portfolioAdmin slice'tan geliyor
  const portfolio = useAppSelector((state) =>
    Array.isArray(state.portfolio.portfolioAdmin) ? state.portfolio.portfolioAdmin : []
  );
  const loading = useAppSelector((state) => state.portfolio.loading);
  const error = useAppSelector((state) => state.portfolio.error);

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingItem, setEditingItem] = useState<IPortfolio | null>(null);

  const dispatch = useAppDispatch();

  // --- SUBMIT ---
  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updatePortfolio({ id, formData }));
    } else {
      await dispatch(createPortfolio(formData));
    }
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_portfolio",
      "Bu makaleyi silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deletePortfolio(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishPortfolio({ id, isPublished: !isPublished }));
  };

  return (
    <Wrapper>
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <List
            portfolio={portfolio}
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
            onClose={() => {
              setEditingItem(null);
              setActiveTab("list");
            }}
            editingItem={editingItem}
            onSubmit={handleSubmit}
            // Artık category bağımlılığı yok!
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
