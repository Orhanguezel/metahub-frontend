"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { INews } from "@/modules/news/types/news";
import { NewsCategory } from "@/modules/news/slice/newsCategorySlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllNewsAdmin,
  clearNewsMessages,
  createNews,
  updateNews,
  deleteNews,
  togglePublishNews,
} from "@/modules/news/slice/newsSlice";
import Modal from "@/shared/Modal";
import {
  NewsFormModal,
  CategoryForm,
  CategoryListPage,
  NewsList,
  NewsTabs,
} from "@/modules/news";
import { useTranslation } from "react-i18next";

export default function AdminNewsPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<INews | null>(null);
  const [editingCategory, setEditingCategory] = useState<NewsCategory | null>(
    null
  );
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { news, loading, error } = useAppSelector((state) => state.news);
  const { i18n, t } = useTranslation("adminNews");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  // ✅ fetch admin news
  useEffect(() => {
    dispatch(fetchAllNewsAdmin(lang));
    return () => {
      dispatch(clearNewsMessages());
    };
  }, [dispatch, lang]);

  // ✅ create or update news
  const handleCreateOrUpdate = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateNews({ id, formData }));
    } else {
      await dispatch(createNews(formData));
    }
    setActiveTab("list");
  };

  // ✅ delete news
  const handleDelete = async (id: string) => {
    const confirmMessage = t(
      "confirm.delete_news",
      "Haberi silmek istediğinizden emin misiniz?"
    );
    if (confirm(confirmMessage)) {
      await dispatch(deleteNews(id));
    }
  };

  // ✅ publish toggle
  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await dispatch(togglePublishNews({ id, isPublished: !currentStatus }));
  };

  // ✅ category modal ops
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: NewsCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleEditNews = (item: INews) => {
    setEditingItem(item);
    setActiveTab("create");
  };

  return (
    <Wrapper>
      <NewsTabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <NewsList
            news={news}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={handleEditNews}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {activeTab === "create" && (
          <NewsFormModal
            isOpen={true}
            onClose={() => {
              setEditingItem(null); // temizle
              setActiveTab("list");
            }}
            editingItem={editingItem}
            onSubmit={handleCreateOrUpdate}
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
