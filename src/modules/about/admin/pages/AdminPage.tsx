"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createAbout,
  updateAbout,
  deleteAbout,
  togglePublishAbout,
} from "@/modules/about/slice/aboutSlice";
import {
  createAboutCategory,
  updateAboutCategory,
} from "@/modules/about/slice/aboutCategorySlice";

import {
  FormModal,
  CategoryForm,
  CategoryListPage,
  List,
  Tabs,
} from "@/modules/about";

import { Modal } from "@/shared";
import { IAbout } from "@/modules/about/types";
import { AboutCategory } from "@/modules/about/types";

export default function AdminAboutPage() {
const { i18n, t } = useI18nNamespace("adminModules", translations);
const lang = (i18n.language?.slice(0, 2)) as SupportedLocale; 

const about = useAppSelector((state) => state.about.aboutAdmin);
const loading = useAppSelector((state) => state.about.loading);
const error = useAppSelector((state) => state.about.error);


  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<IAbout | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<AboutCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();

  

  // ---- FETCH YOK! ----

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateAbout({ id, formData }));
    } else {
      await dispatch(createAbout(formData));
    }
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_article",
      "Bu makaleyi silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteAbout(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishAbout({ id, isPublished: !isPublished }));
  };

  // Create/Update Category
const handleCategorySubmit = async (
  data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
  id?: string
) => {
  if (id) {
    await dispatch(updateAboutCategory({ id, data }));
  } else {
    await dispatch(createAboutCategory(data));
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
            about={about}
            lang={lang}
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
