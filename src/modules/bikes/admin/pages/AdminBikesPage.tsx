"use client";

import { useState } from "react";
import styled from "styled-components";
import { IBike, BikeCategory } from "@/modules/bikes/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createBike,
  updateBike,
  deleteBike,
  togglePublishBike,
} from "@/modules/bikes/slice/bikeSlice";
import {
  createBikeCategory,
  updateBikeCategory,
} from "@/modules/bikes/slice/bikeCategorySlice";

import Modal from "@/shared/Modal";
import {
  BikesFormModal,
  CategoryForm,
  CategoryListPage,
  BikesList,
  BikesTabs,
} from "@/modules/bikes";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import type { SupportedLocale } from "@/types/common";

export default function AdminBikesPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">("list");
  const [editingItem, setEditingItem] = useState<IBike | null>(null);
  const [editingCategory, setEditingCategory] = useState<BikeCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { bikes, loading, error } = useAppSelector((state) => state.bike);
  const { categories } = useAppSelector((state) => state.bikeCategory);
  const { i18n, t } = useI18nNamespace("bikes", translations);
    const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Create/Update Bike
  const handleCreateOrUpdate = async (data: FormData, id?: string) => {
    if (id) {
      await dispatch(updateBike({ id, data }));
    } else {
      await dispatch(createBike(data));
    }
    setEditingItem(null);
    setActiveTab("list");
  };

  // Delete Bike
  const handleDelete = async (id: string) => {
    if (window.confirm(t("admin.confirm.delete_bike", "Are you sure you want to delete this bike?"))) {
      await dispatch(deleteBike(id));
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await dispatch(togglePublishBike({ id, isPublished: !isPublished }));
  };

  // Edit Bike
  const handleEditBike = (item: IBike) => {
    setEditingItem(item);
    setActiveTab("create");
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: BikeCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  // Create/Update Category
  const handleCategorySubmit = async (data: FormData, id?: string) => {
    if (id) {
      await dispatch(updateBikeCategory({ id, data }));
    } else {
      await dispatch(createBikeCategory(data));
    }
    setEditingCategory(null);
    setCategoryModalOpen(false);
  };

  return (
    <Wrapper>
      <BikesTabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <BikesList
            bikes={bikes}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={handleEditBike}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {activeTab === "create" && (
          <BikesFormModal
            isOpen={true}
            onClose={() => {
              setEditingItem(null);
              setActiveTab("list");
            }}
            editingItem={editingItem}
            onSubmit={handleCreateOrUpdate}
            categories={categories}
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
