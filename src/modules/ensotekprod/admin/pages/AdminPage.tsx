"use client";

import { useState } from "react";
import styled from "styled-components";
import { IEnsotekprod, EnsotekCategory} from "@/modules/ensotekprod/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createEnsotekprod,
  updateEnsotekprod,
  deleteEnsotekprod,
  togglePublishEnsotekprod,
} from "@/modules/ensotekprod/slice/ensotekprodSlice";
import {
  createEnsotekCategory,
  updateEnsotekCategory,
} from "@/modules/ensotekprod/slice/ensotekCategorySlice";

import Modal from "@/shared/Modal";
import {
  FormModal,
  CategoryForm,
  CategoryListPage,
  List,
  Tabs,
} from "@/modules/ensotekprod";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/ensotekprod";
import type { SupportedLocale } from "@/types/common";

export default function AdminEnsotekprodPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">("list");
  const [editingItem, setEditingItem] = useState<IEnsotekprod | null>(null);
  const [editingCategory, setEditingCategory] = useState<EnsotekCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("ensotekprod", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const ensotekprod = useAppSelector((state) => state.ensotekprod.ensotekprodAdmin);
  const loading = useAppSelector((state) => state.ensotekprod.loading);
  const error = useAppSelector((state) => state.ensotekprod.error);

  // Create/Update Ensotekprod
  const handleCreateOrUpdate = async (data: FormData, id?: string) => {
    if (id) {
      await dispatch(updateEnsotekprod({ id, data }));
    } else {
      await dispatch(createEnsotekprod(data));
    }
    setEditingItem(null);
    setActiveTab("list");
  };

  // Delete Ensotekprod
  const handleDelete = async (id: string) => {
    if (window.confirm(t("admin.confirm.delete_ensotekprod", "Are you sure you want to delete this ensotekprod?"))) {
      await dispatch(deleteEnsotekprod(id));
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await dispatch(togglePublishEnsotekprod({ id, isPublished: !isPublished }));
  };

  // Edit Ensotekprod
  const handleEditEnsotekprod = (item: IEnsotekprod) => {
    setEditingItem(item);
    setActiveTab("create");
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: EnsotekCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  // Create/Update Category
  const handleCategorySubmit = async (data: FormData, id?: string) => {
    if (id) {
      await dispatch(updateEnsotekCategory({ id, data }));
    } else {
      await dispatch(createEnsotekCategory(data));
    }
    setEditingCategory(null);
    setCategoryModalOpen(false);
  };

  return (
    <Wrapper>
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <List
            ensotekprod={ensotekprod}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={handleEditEnsotekprod}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {activeTab === "create" && (
          <FormModal
            isOpen={true}
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
      </TabContent>
    </Wrapper>
  );
}

// Styled Components
const Wrapper = styled.div`
  max-width: 1200px;
  margin: auto;
  padding: ${({ theme }) => theme.layout.sectionspacings} ${({ theme }) => theme.spacings.md};
`;

const TabContent = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
`;
