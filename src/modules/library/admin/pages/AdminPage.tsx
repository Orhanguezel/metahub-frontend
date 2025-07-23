"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/library/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";
import {
  createLibrary,
  updateLibrary,
  deleteLibrary,
  togglePublishLibrary,
} from "@/modules/library/slice/librarySlice";
import {
  createLibraryCategory,
  updateLibraryCategory,
} from "@/modules/library/slice/libraryCategorySlice";
import {
  FormModal,
  CategoryForm,
  CategoryListPage,
  List,
  Tabs,
} from "@/modules/library";
import { Modal } from "@/shared";
import { ILibrary, LibraryCategory } from "@/modules/library/types";

export default function AdminLibraryPage() {
  const { t } = useI18nNamespace("library", translations);

  const library = useAppSelector((state) => state.library.libraryAdmin);
  const loading = useAppSelector((state) => state.library.loading);
  const error = useAppSelector((state) => state.library.error);

  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<ILibrary | null>(null);
  const [editingCategory, setEditingCategory] = useState<LibraryCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();

  // ✅ Dosya desteği için formData'da files alanı kullanabilirsin

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateLibrary({ id, formData }));
    } else {
      await dispatch(createLibrary(formData));
    }
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_library",
      "Bu makaleyi silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteLibrary(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishLibrary({ id, isPublished: !isPublished }));
  };

  // Kategori işlemleri
  const handleCategorySubmit = async (
    data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
    id?: string
  ) => {
    if (id) {
      await dispatch(updateLibraryCategory({ id, data }));
    } else {
      await dispatch(createLibraryCategory(data));
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
            library={library}
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
          />
        )}

        {activeTab === "categories" && (
          <>
            <CategoryListPage
              onAdd={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              onEdit={(category) => {
                setEditingCategory(category);
                setCategoryModalOpen(true);
              }}
            />
            <Modal
              isOpen={categoryModalOpen}
              onClose={() => setCategoryModalOpen(false)}
            >
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
