"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchArticlesCategories,
  deleteArticlesCategory,
} from "@/modules/articles/slice/articlesCategorySlice";
import { ArticlesCategory } from "@/modules/articles/types";

interface Props {
  onAdd: () => void;
  onEdit: (category: ArticlesCategory) => void;
}

export default function ArticlesCategoryListPage({ onAdd, onEdit }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("adminArticles");
  const { categories, loading, error } = useAppSelector(
    (state) => state.articlesCategory
  );

  useEffect(() => {
    dispatch(fetchArticlesCategories());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        t(
          "categories.confirm_delete",
          "Are you sure you want to delete this category?"
        )
      )
    ) {
      dispatch(deleteArticlesCategory(id));
    }
  };

  const renderContent = () => {
    if (loading)
      return <StatusMessage>{t("loading", "Loading...")}</StatusMessage>;
    if (error) return <ErrorMessage>❌ {error}</ErrorMessage>;
    if (!categories.length)
      return (
        <StatusMessage>
          {t("categories.empty", "No categories found.")}
        </StatusMessage>
      );

    return (
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>{t("languages.en", "EN")}</th>
            <th>{t("languages.tr", "TR")}</th>
            <th>{t("languages.de", "DE")}</th>
            <th>{t("slug", "Slug")}</th>
            <th>{t("actions", "Actions")}</th>
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
                  {t("edit", "Edit")}
                </ActionButton>
                <DeleteButton onClick={() => handleDelete(cat._id)}>
                  {t("delete", "Delete")}
                </DeleteButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Wrapper>
      <Header>
        <h2>{t("categories.title", "Article Categories")}</h2>
        <AddButton onClick={onAdd}>
          {t("categories.add", "Add Category")}
        </AddButton>
      </Header>
      {renderContent()}
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
