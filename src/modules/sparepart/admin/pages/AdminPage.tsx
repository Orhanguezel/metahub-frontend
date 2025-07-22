"use client";

import { useState } from "react";
import styled from "styled-components";
import { ISparepart, SparepartCategory} from "@/modules/sparepart/types";
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
  Tabs,
} from "@/modules/sparepart";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/sparepart";
import type { SupportedLocale } from "@/types/common";

export default function AdminSparepartPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">("list");
  const [editingItem, setEditingItem] = useState<ISparepart | null>(null);
  const [editingCategory, setEditingCategory] = useState<SparepartCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("sparepart", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const sparepart = useAppSelector((state) => state.sparepart.sparepartAdmin);
  const loading = useAppSelector((state) => state.sparepart.loading);
  const error = useAppSelector((state) => state.sparepart.error);

  // Create/Update Sparepart
  const handleCreateOrUpdate = async (data: FormData, id?: string) => {
    if (id) {
      await dispatch(updateSparepart({ id, data }));
    } else {
      await dispatch(createSparepart(data));
    }
    setEditingItem(null);
    setActiveTab("list");
  };

  // Delete Sparepart
  const handleDelete = async (id: string) => {
    if (window.confirm(t("admin.confirm.delete_sparepart", "Are you sure you want to delete this sparepart?"))) {
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
    if (id) {
      await dispatch(updateSparepartCategory({ id, data }));
    } else {
      await dispatch(createSparepartCategory(data));
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
