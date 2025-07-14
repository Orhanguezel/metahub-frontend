"use client";

import { useState } from "react";
import styled from "styled-components";
import { IBikes, BikesCategory} from "@/modules/bikes/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createBikes,
  updateBikes,
  deleteBikes,
  togglePublishBikes,
} from "@/modules/bikes/slice/bikesSlice";
import {
  createBikesCategory,
  updateBikesCategory,
} from "@/modules/bikes/slice/bikesCategorySlice";

import Modal from "@/shared/Modal";
import {
  FormModal,
  CategoryForm,
  CategoryListPage,
  List,
  Tabs,
} from "@/modules/bikes";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/bikes";
import type { SupportedLocale } from "@/types/common";

export default function AdminBikesPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">("list");
  const [editingItem, setEditingItem] = useState<IBikes | null>(null);
  const [editingCategory, setEditingCategory] = useState<BikesCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("bikes", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const bikes = useAppSelector((state) => state.bikes.bikesAdmin);
  const loading = useAppSelector((state) => state.bikes.loading);
  const error = useAppSelector((state) => state.bikes.error);

  // Create/Update Bike
  const handleCreateOrUpdate = async (data: FormData, id?: string) => {
    if (id) {
      await dispatch(updateBikes({ id, data }));
    } else {
      await dispatch(createBikes(data));
    }
    setEditingItem(null);
    setActiveTab("list");
  };

  // Delete Bike
  const handleDelete = async (id: string) => {
    if (window.confirm(t("admin.confirm.delete_bike", "Are you sure you want to delete this bike?"))) {
      await dispatch(deleteBikes(id));
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await dispatch(togglePublishBikes({ id, isPublished: !isPublished }));
  };

  // Edit Bike
  const handleEditBikes = (item: IBikes) => {
    setEditingItem(item);
    setActiveTab("create");
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: BikesCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  // Create/Update Category
  const handleCategorySubmit = async (data: FormData, id?: string) => {
    if (id) {
      await dispatch(updateBikesCategory({ id, data }));
    } else {
      await dispatch(createBikesCategory(data));
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
            bikes={bikes}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={handleEditBikes}
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
