"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchReferencesAdmin,
  clearReferenceMessages,
  createReference,
  updateReference,
  deleteReference,
  togglePublishReference,
} from "@/modules/references/slice/referencesSlice";
import {
  fetchReferenceCategories,
  clearCategoryMessages,
  createReferenceCategory,
  updateReferenceCategory,
  deleteReferenceCategory,
} from "@/modules/references/slice/referencesCategorySlice";
import {
  ReferenceTabs,
  ReferenceList,
  ReferenceFormModal,
  CategoryListPage,
  CategoryForm,
} from "@/modules/references";
import { Modal } from "@/shared";
import type { IReference } from "@/modules/references/types/reference";
import type { ReferenceCategory } from "@/modules/references/slice/referencesCategorySlice";

export default function AdminReferencePage() {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("reference");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const { references, loading, error } = useAppSelector(
    (state) => state.references
  );
  const { categories } = useAppSelector((state) => state.referenceCategory);

  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<IReference | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<ReferenceCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Referanslar ve kategorileri çek
  useEffect(() => {
    dispatch(fetchReferencesAdmin(lang));
    dispatch(fetchReferenceCategories());
    return () => {
      dispatch(clearReferenceMessages());
      dispatch(clearCategoryMessages());
    };
  }, [dispatch, lang]);

  const resetForm = () => {
    setEditingItem(null);
    setActiveTab("list");
  };

  const resetCategoryModal = () => {
    setEditingCategory(null);
    setCategoryModalOpen(false);
  };

  // Referans oluştur/güncelle
  const handleCreateOrUpdate = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateReference({ id, formData }));
    } else {
      await dispatch(createReference(formData));
    }
    resetForm();
  };

  // Referans sil
  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "admin.confirm.delete_reference",
      "Are you sure you want to delete this reference?"
    );
    if (window.confirm(confirmMsg)) {
      await dispatch(deleteReference(id));
    }
  };

  // Yayınlama/pasif
  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await dispatch(togglePublishReference({ id, isPublished: !isPublished }));
  };

  // Referans düzenleme
  const handleEdit = (item: IReference) => {
    setEditingItem(item);
    setActiveTab("create");
  };

  // Kategori işlemleri
  const handleCategoryCreateOrUpdate = async (data: any, id?: string) => {
    if (id) {
      await dispatch(updateReferenceCategory({ id, data }));
    } else {
      await dispatch(createReferenceCategory(data));
    }
    resetCategoryModal();
  };

  const handleCategoryDelete = async (id: string) => {
    const confirmMsg = t(
      "admin.confirm.delete_category",
      "Are you sure you want to delete this category?"
    );
    if (window.confirm(confirmMsg)) {
      await dispatch(deleteReferenceCategory(id));
    }
  };

  return (
    <Wrapper>
      <ReferenceTabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <ReferenceList
            references={references}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {activeTab === "create" && (
          <ReferenceFormModal
            isOpen={true}
            onClose={resetForm}
            editingItem={editingItem}
            onSubmit={handleCreateOrUpdate}
            categories={categories}
          />
        )}

        {activeTab === "categories" && (
          <>
            <CategoryListPage
              categories={categories}
              onAdd={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              onEdit={(category) => {
                setEditingCategory(category);
                setCategoryModalOpen(true);
              }}
              onDelete={handleCategoryDelete}
            />
            <Modal isOpen={categoryModalOpen} onClose={resetCategoryModal}>
              <CategoryForm
                editingItem={editingCategory}
                onSubmit={handleCategoryCreateOrUpdate}
                onClose={resetCategoryModal}
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
