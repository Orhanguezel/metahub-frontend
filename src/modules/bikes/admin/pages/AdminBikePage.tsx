"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { IBike, BikeCategory } from "@/modules/bikes/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBikesAdmin,
  createBike,
  updateBike,
  deleteBike,
  togglePublishBike,
  clearBikeMessages,
} from "@/modules/bikes/slice/bikeSlice";
import {
  fetchBikeCategories,
  clearCategoryMessages,
} from "@/modules/bikes/slice/bikeCategorySlice";

import Modal from "@/shared/Modal";
import {
  BikeFormModal,
  CategoryForm,
  CategoryListPage,
  BikeList,
  BikeTabs,
} from "@/modules/bikes";
import { useTranslation } from "react-i18next";
import { getCurrentLocale } from "@/utils/getCurrentLocale";
import type { SupportedLocale } from "@/types/common";

export default function AdminBikePage() {
  // Tab & Modal State
  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">("list");
  const [editingItem, setEditingItem] = useState<IBike | null>(null);
  const [editingCategory, setEditingCategory] = useState<BikeCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Redux
  const dispatch = useAppDispatch();
  const { bikes, loading, error } = useAppSelector((state) => state.bike);
  const { categories } = useAppSelector((state) => state.bikeCategory);
  const { t } = useTranslation("bike");

  // Merkezi ve dinamik dil
  const lang: SupportedLocale = getCurrentLocale();

  // Data Fetch
  useEffect(() => {
    dispatch(fetchBikesAdmin(lang));
    dispatch(fetchBikeCategories());
    return () => {
      dispatch(clearBikeMessages());
      dispatch(clearCategoryMessages());
    };
  }, [dispatch, lang]);

  // Create/Update Handler
  const handleCreateOrUpdate = async (data: FormData, id?: string) => {
    if (id) {
      await dispatch(updateBike({ id, data }));
    } else {
      await dispatch(createBike(data));
    }
    setEditingItem(null);
    setActiveTab("list");
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (window.confirm(t("admin.confirm.delete_bike", "Ürünü silmek istediğinizden emin misiniz?"))) {
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

  return (
    <Wrapper>
      <BikeTabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <BikeList
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
          <BikeFormModal
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
            <CategoryListPage
              onAdd={handleOpenAddCategory}
              onEdit={handleEditCategory}
            />
            <Modal
              isOpen={categoryModalOpen}
              onClose={() => setCategoryModalOpen(false)}
            >
              <CategoryForm
                onClose={() => setCategoryModalOpen(false)}
                editingItem={editingCategory}
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
  padding: ${({ theme }) => theme.layout.sectionSpacing}
    ${({ theme }) => theme.spacing.md};
`;

const TabContent = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
`;
