"use client";

import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  fetchBikeCategories,
  deleteBikeCategory,
} from "@/modules/bikes/slice/bikeCategorySlice";
import type { BikeCategory } from "@/modules/bikes/types";
import { LANG_LABELS, SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
//import { getCurrentLocale } from "@/utils/getCurrentLocale";

interface ProductCategoryListPageProps {
  onAdd: () => void;
  onEdit: (category: BikeCategory) => void;
}

export default function ProductCategoryListPage({
  onAdd,
  onEdit,
}: ProductCategoryListPageProps) {
  const { t, i18n } = useTranslation("bike");
  const dispatch = useAppDispatch();
  const { categories, loading, error } = useAppSelector(
    (state) => state.bikeCategory
  );

  // --- Seçili dili belirle (future-proof) ---
  // Eğer locale backend'den/utility'den alınacaksa aşağıyı kullan:
  // const lang: SupportedLocale = getCurrentLocale();
  // Ama i18n'dan direkt almak pratik:
  const lang = (SUPPORTED_LOCALES.includes(i18n.language as SupportedLocale)
    ? (i18n.language as SupportedLocale)
    : "en");

  useEffect(() => {
    dispatch(fetchBikeCategories());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    const confirmMessage = t(
      "admin.confirm.delete",
      "Are you sure you want to delete this category?"
    );
    if (window.confirm(confirmMessage)) {
      dispatch(deleteBikeCategory(id));
    }
  };

  return (
    <Wrapper>
      <Header>
        <h2>{t("admin.categories.title", "Product Categories")}</h2>
        <AddButton onClick={onAdd}>
          {t("admin.categories.add", "Add Category")}
        </AddButton>
      </Header>

      {loading ? (
        <StatusMessage>{t("admin.loading", "Loading...")}</StatusMessage>
      ) : error ? (
        <ErrorMessage>❌ {error}</ErrorMessage>
      ) : categories.length === 0 ? (
        <StatusMessage>
          {t("admin.categories.empty", "No categories found.")}
        </StatusMessage>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>
                {/* Aktif dil etiketi */}
                {t(`admin.language.${lang}`, LANG_LABELS[lang])}
              </th>
              <th>{t("admin.slug", "Slug")}</th>
              <th>{t("admin.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat._id}>
                <td>{i + 1}</td>
                {/* Sadece aktif dilde göster */}
                <td>{cat.name?.[lang] || "—"}</td>
                <td>{cat.slug}</td>
                <td>
                  <ActionButton onClick={() => onEdit(cat)}>
                    {t("admin.edit", "Edit")}
                  </ActionButton>
                  <DeleteButton onClick={() => handleDelete(cat._id)}>
                    {t("admin.delete", "Delete")}
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

// 💅 Styles aynı kalabilir

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
