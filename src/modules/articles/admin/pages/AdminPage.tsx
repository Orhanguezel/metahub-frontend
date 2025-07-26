"use client";

import { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {translations} from "@/modules/articles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

import {
  createArticles,
  updateArticles,
  deleteArticles,
  togglePublishArticles,
} from "@/modules/articles/slice/articlesSlice";
import {
  createArticlesCategory,
  updateArticlesCategory,
} from "@/modules/articles/slice/articlesCategorySlice";

import {
  FormModal,
  CategoryForm,
  CategoryListPage,
  List,
  Tabs,
} from "@/modules/articles";

import { Modal } from "@/shared";
import { IArticles } from "@/modules/articles/types";
import { ArticlesCategory } from "@/modules/articles/types";

export default function AdminArticlesPage() {
  const { i18n, t } = useI18nNamespace("articles", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

const articles = useAppSelector((state) => state.articles.articlesAdmin);
const loading = useAppSelector((state) => state.articles.loading);
const error = useAppSelector((state) => state.articles.error);


  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<IArticles | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<ArticlesCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();

  

  // ---- FETCH YOK! ----

  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateArticles({ id, formData }));
    } else {
      await dispatch(createArticles(formData));
    }
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t(
      "confirm.delete_articles",
      "Bu haberi silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteArticles(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishArticles({ id, isPublished: !isPublished }));
  };

  // Create/Update Category
const handleCategorySubmit = async (
  data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
  id?: string
) => {
  if (id) {
    await dispatch(updateArticlesCategory({ id, data }));
  } else {
    await dispatch(createArticlesCategory(data));
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
            articles={articles}
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
