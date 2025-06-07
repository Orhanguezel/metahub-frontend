"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { IBlog } from "@/modules/blog/types/blog";
import { BlogCategory } from "@/modules/blog/slice/blogCategorySlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllBlogsAdmin,
  clearBlogMessages,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublishBlog,
} from "@/modules/blog/slice/blogSlice";
import Modal from "@/shared/Modal";
import {
  BlogFormModal,
  CategoryForm,
  CategoryListPage,
  BlogList,
  BlogTabs,
} from "@/modules/blog";
import { useTranslation } from "react-i18next";

export default function AdminBlogPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">(
    "list"
  );
  const [editingItem, setEditingItem] = useState<IBlog | null>(null);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(
    null
  );
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { blogs, loading, error } = useAppSelector((state) => state.blog);
  const { i18n, t } = useTranslation("adminBlog");

  const lang = (
    ["tr", "en", "de"].includes(i18n.language) ? i18n.language : "en"
  ) as "tr" | "en" | "de";

  useEffect(() => {
    dispatch(fetchAllBlogsAdmin(lang));
    return () => {
      dispatch(clearBlogMessages());
    };
  }, [dispatch, lang]);

  const handleCreateOrUpdate = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateBlog({ id, formData }));
    } else {
      await dispatch(createBlog(formData));
    }
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMessage = t(
      "confirm.delete_blog",
      "Blogu silmek istediğinizden emin misiniz?"
    );
    if (confirm(confirmMessage)) {
      await dispatch(deleteBlog(id));
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    await dispatch(togglePublishBlog({ id, isPublished: !currentStatus }));
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleEditBlog = (item: IBlog) => {
    setEditingItem(item);
    setActiveTab("create");
  };

  return (
    <Wrapper>
      <BlogTabs activeTab={activeTab} onChange={setActiveTab} />

      <TabContent>
        {activeTab === "list" && (
          <BlogList
            blogs={blogs}
            lang={lang}
            loading={loading}
            error={error}
            onEdit={handleEditBlog}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        )}

        {activeTab === "create" && (
          <BlogFormModal
            isOpen={true}
            onClose={() => {
              setEditingItem(null);
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
