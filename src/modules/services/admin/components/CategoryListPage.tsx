"use client";

import styled from "styled-components";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/services/locales";
import type { ServicesCategory } from "@/modules/services/types";
import { LANG_LABELS, SupportedLocale } from "@/types/common";
import { deleteServicesCategory } from "@/modules/services/slice/servicesCategorySlice";

interface ProductCategoryListPageProps {
  onAdd: () => void;
  onEdit: (category: ServicesCategory) => void;
}

export default function ProductCategoryListPage({
  onAdd,
  onEdit,
}: ProductCategoryListPageProps) {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("services", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Merkezi fetch ile gelen slice'ı okuyoruz
   const categories = useAppSelector((state) => state.servicesCategory.categories);
  const loading = useAppSelector((state) => state.services.loading);
  const error = useAppSelector((state) => state.services.error);
  

  // Silme işlemi
  const handleDelete = (id: string) => {
    const confirmMessage = t(
      "admin.confirm.delete",
      "Are you sure you want to delete this category?"
    );
    if (window.confirm(confirmMessage)) {
      dispatch(deleteServicesCategory(id));
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
      ) : !categories || categories.length === 0 ? (
        <StatusMessage>
          {t("admin.categories.empty", "No categories found.")}
        </StatusMessage>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>{t(`admin.language.${lang}`, LANG_LABELS[lang])}</th>
              <th>{t("admin.slug", "Slug")}</th>
              <th>{t("admin.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat: ServicesCategory, i: number) => (
              <tr key={cat._id}>
                <td>{i + 1}</td>
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

// --- Styled Components ---
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
  th, td {
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
