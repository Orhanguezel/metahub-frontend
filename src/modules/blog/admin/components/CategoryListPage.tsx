"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBlogCategories,
  deleteBlogCategory,
  BlogCategory,
} from "@/modules/blog/slice/blogCategorySlice";

interface BlogCategoryListPageProps {
  onAdd: () => void;
  onEdit: (category: BlogCategory) => void;
}

export default function BlogCategoryListPage({
  onAdd,
  onEdit,
}: BlogCategoryListPageProps) {
  const { t } = useTranslation("adminBlog");

  const dispatch = useAppDispatch();
  const { categories, loading, error } = useAppSelector(
    (state) => state.blogCategory
  );

  useEffect(() => {
    dispatch(fetchBlogCategories());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    const confirmMessage = t(
      "categories.confirm_delete",
      "Bu kategoriyi silmek istediğinize emin misiniz?"
    );
    if (window.confirm(confirmMessage)) {
      dispatch(deleteBlogCategory(id));
    }
  };

  return (
    <Wrapper>
      <Header>
        <h2>{t("categories.title", "Blog Kategorileri")}</h2>
        <AddButton onClick={onAdd}>
          {t("categories.add", "Yeni Kategori")}
        </AddButton>
      </Header>

      {loading ? (
        <StatusMessage>{t("loading", "Yükleniyor...")}</StatusMessage>
      ) : error ? (
        <ErrorMessage>❌ {error}</ErrorMessage>
      ) : categories.length === 0 ? (
        <StatusMessage>
          {t("categories.empty", "Kategori bulunamadı.")}
        </StatusMessage>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>{t("languages.en", "EN")}</th>
              <th>{t("languages.tr", "TR")}</th>
              <th>{t("languages.de", "DE")}</th>
              <th>{t("slug", "Slug")}</th>
              <th>{t("actions", "İşlemler")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat._id}>
                <td>{i + 1}</td>
                <td>{cat.name.en}</td>
                <td>{cat.name.tr}</td>
                <td>{cat.name.de}</td>
                <td>{cat.slug}</td>
                <td>
                  <ActionButton onClick={() => onEdit(cat)}>
                    {t("edit", "Düzenle")}
                  </ActionButton>
                  <DeleteButton onClick={() => handleDelete(cat._id)}>
                    {t("delete", "Sil")}
                  </DeleteButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Wrapper>
  );
}

// 🔧 Styled Components
const Wrapper = styled.div`
  margin-top: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const AddButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    font-size: 0.95rem;
  }

  th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.text};
  }

  td {
    vertical-align: middle;
  }
`;

const StatusMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
`;

const ErrorMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.danger};
  font-weight: bold;
`;

const ActionButton = styled.button`
  margin-right: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: ${({ theme }) => theme.colors.warning};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  padding: 0.4rem 0.8rem;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
`;
