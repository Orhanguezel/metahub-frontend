"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNewsCategories,
  deleteNewsCategory,
  NewsCategory,
} from "@/modules/news/slice/newsCategorySlice";

interface NewsCategoryListPageProps {
  onAdd: () => void;
  onEdit: (category: NewsCategory) => void;
}

export default function CategoryListPage({
  onAdd,
  onEdit,
}: NewsCategoryListPageProps) {
  const { t } = useTranslation("adminNews");

  const dispatch = useAppDispatch();
  const { categories, loading, error } = useAppSelector(
    (state) => state.newsCategory
  );

  useEffect(() => {
    dispatch(fetchNewsCategories());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    const confirmMessage = t(
      "confirm.delete",
      "Bu kategoriyi silmek istediğinize emin misiniz?"
    );
    if (window.confirm(confirmMessage)) {
      dispatch(deleteNewsCategory(id));
    }
  };

  return (
    <Wrapper>
      <Header>
        <h2>{t("categories.title", "Haber Kategorileri")}</h2>
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
              <th>{t("language.en", "EN")}</th>
              <th>{t("language.tr", "TR")}</th>
              <th>{t("language.de", "DE")}</th>
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
`;

const StatusMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.95rem;
`;

const ErrorMessage = styled.p`
  text-align: center;
  color: red;
  font-size: 0.95rem;
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
