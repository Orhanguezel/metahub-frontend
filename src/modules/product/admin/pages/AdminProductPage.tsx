"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Iradonarprod } from "@/modules/product/types/radonarprod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchRadonarProdAdmin,
  createRadonarProd,
  updateRadonarProd,
  deleteRadonarProd,
  togglePublishRadonarProd,
  clearRadonarProdMessages,
} from "@/modules/product/slice/radonarprodSlice";
import {
  fetchRadonarCategories,
  clearCategoryMessages,
} from "@/modules/product/slice/radonarCategorySlice";

import Modal from "@/shared/Modal";
import {
  ProductFormModal,
  CategoryForm,
  CategoryListPage,
  ProductList,
  ProductTabs,
} from "@/modules/product";
import { useTranslation } from "react-i18next";
import type { RadonarCategory } from "@/modules/product/slice/radonarCategorySlice";

export default function AdminRadonarProductPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<Iradonarprod | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<RadonarCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { radonarprod, loading, error } = useAppSelector(
    (state) => state.radonarprod
  );
  const { categories } = useAppSelector((state) => state.radonarCategory);
  const { i18n, t } = useTranslation("product");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  // ✅ Fetch on mount
  useEffect(() => {
    dispatch(fetchRadonarProdAdmin(lang));
    dispatch(fetchRadonarCategories());
    return () => {
      dispatch(clearRadonarProdMessages());
      dispatch(clearCategoryMessages());
    };
  }, [dispatch, lang]);

  const handleCreateOrUpdate = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateRadonarProd({ id, formData }));
    } else {
      await dispatch(createRadonarProd(formData));
    }
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMessage = t(
      "admin.confirm.delete_product",
      "Ürünü silmek istediğinizden emin misiniz?"
    );
    if (confirm(confirmMessage)) {
      await dispatch(deleteRadonarProd(id));
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    await dispatch(togglePublishRadonarProd({ id, isPublished: !current }));
  };

  const handleEditProduct = (item: Iradonarprod) => {
    setEditingItem(item);
    setActiveTab("create");
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: RadonarCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  return (
    <Wrapper>
      <ProductTabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <ProductList
            product={radonarprod}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={handleEditProduct}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {activeTab === "create" && (
          <ProductFormModal
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
