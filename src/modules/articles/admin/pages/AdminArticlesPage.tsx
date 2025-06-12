"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCurrentLocale } from "@/utils/getCurrentLocale";

import {
  fetchAllArticlesAdmin,
  clearArticlesMessages,
  createArticles,
  updateArticles,
  deleteArticles,
  togglePublishArticles,
} from "@/modules/articles/slice/articlesSlice";

import {
  ArticlesFormModal,
  CategoryForm,
  CategoryListPage,
  ArticlesList,
  ArticlesTabs,
} from "@/modules/articles";

import { Modal } from "@/shared";
import { IArticles } from "@/modules/articles/types";
import { ArticlesCategory } from "@/modules/articles/types";

export default function AdminArticlesPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<IArticles | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<ArticlesCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { articles, loading, error } = useAppSelector(
    (state) => state.articles
  );
  const { t } = useTranslation("adminArticles");

  const lang = getCurrentLocale();

  useEffect(() => {
    dispatch(fetchAllArticlesAdmin(lang));
    return () => {
      dispatch(clearArticlesMessages());
    };
  }, [dispatch, lang]);

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
      "confirm.delete_article",
      "Bu makaleyi silmek istediğinize emin misiniz?"
    );
    if (confirm(confirmMsg)) {
      await dispatch(deleteArticles(id));
    }
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishArticles({ id, isPublished: !isPublished }));
  };

  return (
    <Wrapper>
      <ArticlesTabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <ArticlesList
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
          <ArticlesFormModal
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
