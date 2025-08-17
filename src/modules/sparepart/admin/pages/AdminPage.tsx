"use client";
import { useState, useMemo } from "react";
import styled from "styled-components";
import { ISparepart, SparepartCategory } from "@/modules/sparepart/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createSparepart,
  updateSparepart,
  deleteSparepart,
  togglePublishSparepart,
} from "@/modules/sparepart/slice/sparepartSlice";
import {
  createSparepartCategory,
  updateSparepartCategory,
} from "@/modules/sparepart/slice/sparepartCategorySlice";

import Modal from "@/shared/Modal";
import {
  FormModal,
  CategoryForm,
  CategoryListPage,
  List,
} from "@/modules/sparepart";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/sparepart";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";

/* --- helpers --- */
const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two)
    ? (two as SupportedLocale)
    : "tr";
};

export default function AdminSparepartPage() {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("sparepart", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const sparepart = useAppSelector((state) => state.sparepart.sparepartAdmin);
  const loading = useAppSelector((state) => state.sparepart.loading);
  const error = useAppSelector((state) => state.sparepart.error);

  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">("list");
  const [editingItem, setEditingItem] = useState<ISparepart | null>(null);
  const [editingCategory, setEditingCategory] = useState<SparepartCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const count = Array.isArray(sparepart) ? sparepart.length : 0;

  // Create/Update Sparepart
  const handleCreateOrUpdate = async (data: FormData, id?: string) => {
    if (id) await dispatch(updateSparepart({ id, data }));
    else await dispatch(createSparepart(data));
    setEditingItem(null);
    setActiveTab("list");
  };

  // Delete Sparepart
  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        t(
          "admin.confirm.delete_sparepart",
          "Are you sure you want to delete this spare part?"
        )
      )
    ) {
      await dispatch(deleteSparepart(id));
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await dispatch(togglePublishSparepart({ id, isPublished: !isPublished }));
  };

  // Edit Sparepart
  const handleEditSparepart = (item: ISparepart) => {
    setEditingItem(item);
    setActiveTab("create");
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: SparepartCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  // Create/Update Category
  const handleCategorySubmit = async (data: FormData, id?: string) => {
    if (id) await dispatch(updateSparepartCategory({ id, data }));
    else await dispatch(createSparepartCategory(data));
    setEditingCategory(null);
    setCategoryModalOpen(false);
  };

  return (
    <PageWrap>
      {/* Header — activity/opsjobs paternine uyumlu */}
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Spare Parts")}</h1>
          <Subtitle>
            {t("admin.subtitle", "Create, organize and publish your spare parts")}
          </Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="sparepart-count">{count}</Counter>
          <PrimaryBtn
            onClick={() => {
              setEditingItem(null);
              setActiveTab("create");
            }}
          >
            + {t("create", "Create")}
          </PrimaryBtn>
        </Right>
      </Header>

      {/* Tabs */}
      <Tabs>
        <Tab $active={activeTab === "list"} onClick={() => setActiveTab("list")}>
          {t("list", "List")}
        </Tab>
        <Tab $active={activeTab === "create"} onClick={() => setActiveTab("create")}>
          {t("create", "Create")}
        </Tab>
        <Tab $active={activeTab === "categories"} onClick={() => setActiveTab("categories")}>
          {t("categories", "Categories")}
        </Tab>
      </Tabs>

      {/* Content */}
      <Section>
        <SectionHead>
          <h2>
            {activeTab === "list" && t("list", "List")}
            {activeTab === "create" && t("create", "Create")}
            {activeTab === "categories" && t("categories", "Categories")}
          </h2>
          {activeTab === "list" ? (
            <SmallBtn disabled={loading}>{t("refresh", "Refresh")}</SmallBtn>
          ) : activeTab === "create" ? (
            <SmallBtn onClick={() => setActiveTab("list")}>
              {t("backToList", "Back to list")}
            </SmallBtn>
          ) : (
            <SmallBtn onClick={handleOpenAddCategory}>
              + {t("newCategory", "New Category")}
            </SmallBtn>
          )}
        </SectionHead>

        <Card>
          {activeTab === "list" && (
            <List
              sparepart={sparepart}
              lang={lang}
              loading={loading}
              error={error}
              onEdit={handleEditSparepart}
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
              onSubmit={handleCreateOrUpdate}
            />
          )}

          {activeTab === "categories" && (
            <>
              <CategoryListPage onAdd={handleOpenAddCategory} onEdit={handleEditCategory} />
              <Modal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)}>
                <CategoryForm
                  isOpen={categoryModalOpen}
                  onClose={() => setCategoryModalOpen(false)}
                  editingItem={editingCategory}
                  onSubmit={handleCategorySubmit}
                />
              </Modal>
            </>
          )}
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled (activity/opsjobs paternine birebir) ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
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

const Tabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primaryLight : theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor: pointer;
`;

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.sm};
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
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;

const SmallBtn = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;
