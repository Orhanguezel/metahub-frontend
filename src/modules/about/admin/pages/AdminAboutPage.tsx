"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllAboutAdmin,
  clearAboutMessages,
  createAbout,
  updateAbout,
  deleteAbout,
  togglePublishAbout,
} from "@/modules/about/slice/aboutSlice";
import {
  AboutTabs,
  AboutList,
  AboutFormModal,
  CategoryListPage,
  CategoryForm,
} from "@/modules/about";
import { Modal } from "@/shared";
import type { IAbout } from "@/modules/about/types/about";
import type { AboutCategory } from "@/modules/about/slice/aboutCategorySlice";

export default function AdminAboutPage() {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("about");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  const { about, loading, error } = useAppSelector((state) => state.about);

  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<IAbout | null>(null);
  const [editingCategory, setEditingCategory] = useState<AboutCategory | null>(
    null
  );
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllAboutAdmin(lang));
    return () => {
      dispatch(clearAboutMessages());
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

  const handleCreateOrUpdate = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateAbout({ id, formData }));
    } else {
      await dispatch(createAbout(formData));
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "admin.confirm.delete_about",
      "Are you sure you want to delete this About?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteAbout(id));
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await dispatch(togglePublishAbout({ id, isPublished: !isPublished }));
  };

  const handleEdit = (item: IAbout) => {
    setEditingItem(item);
    setActiveTab("create");
  };

  return (
    <Wrapper>
      <AboutTabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <AboutList
            about={about}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {activeTab === "create" && (
          <AboutFormModal
            isOpen
            onClose={resetForm}
            editingItem={editingItem}
            onSubmit={handleCreateOrUpdate}
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
            <Modal isOpen={categoryModalOpen} onClose={resetCategoryModal}>
              <CategoryForm
                onClose={resetCategoryModal}
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
