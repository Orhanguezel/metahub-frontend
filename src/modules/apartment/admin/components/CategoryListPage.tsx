"use client";

import styled from "styled-components";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/apartment";
import type { ApartmentCategory } from "@/modules/apartment/types";
import { LANG_LABELS, SupportedLocale } from "@/types/common";
import {
  deleteApartmentCategory,
  updateApartmentCategory,
} from "@/modules/apartment/slice/apartmentCategorySlice";

interface CategoryListPageProps {
  onAdd: () => void;
  onEdit: (category: ApartmentCategory) => void;
}

export default function CategoryListPage({ onAdd, onEdit }: CategoryListPageProps) {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("apartment", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const { categories, loading, error, status } = useAppSelector(
    (state) => state.apartmentCategory
  );

  const handleDelete = (id: string) => {
    const confirmMessage = t(
      "admin.confirm.delete",
      "Are you sure you want to delete this category?"
    );
    if (window.confirm(confirmMessage)) {
      dispatch(deleteApartmentCategory(id));
    }
  };

  const handleToggleActive = (cat: ApartmentCategory) => {
    dispatch(
      updateApartmentCategory({
        id: cat._id,
        data: { isActive: !cat.isActive },
      })
    );
  };

  return (
    <Wrapper>
      <Header>
        <h2>{t("admin.categories.title", "Apartment Categories")}</h2>
        <AddButton onClick={onAdd} disabled={loading || status === "loading"}>
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
              <th>{t("city", "City")}</th>
              <th>{t("district", "District")}</th>
              <th>{t("zip", "ZIP")}</th>
              <th>{t("admin.active", "Active")}</th>
              <th>{t("admin.actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat._id}>
                <td>{i + 1}</td>
                <td>{cat.name?.[lang] || cat.name?.en || "—"}</td>
                <td>{cat.slug}</td>
                <td>{cat.city || "—"}</td>
                <td>{cat.district || "—"}</td>
                <td>{cat.zip || "—"}</td>
                <td>
                  <ActivePill $active={!!cat.isActive}>
                    {cat.isActive
                      ? t("admin.active", "Active")
                      : t("admin.inactive", "Inactive")}
                  </ActivePill>
                </td>
                <td>
                  <ActionButton
                    onClick={() => onEdit(cat)}
                    disabled={loading || status === "loading"}
                  >
                    {t("admin.edit", "Edit")}
                  </ActionButton>
                  <ToggleButton
                    onClick={() => handleToggleActive(cat)}
                    disabled={loading || status === "loading"}
                    aria-label={cat.isActive ? "Deactivate" : "Activate"}
                  >
                    {cat.isActive
                      ? t("admin.deactivate", "Deactivate")
                      : t("admin.activate", "Activate")}
                  </ToggleButton>
                  <DeleteButton
                    onClick={() => handleDelete(cat._id)}
                    disabled={loading || status === "loading"}
                  >
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

/* --- styles --- */
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
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    vertical-align: middle;
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
  color: ${({ theme }) => theme.colors.danger};
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled.button`
  margin-right: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: ${({ theme }) => theme.colors.info};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  padding: 0.4rem 0.8rem;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ActivePill = styled.span<{ $active: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $active }) => ($active ? "#0a5" : "#a00")};
  background: ${({ $active }) => ($active ? "#0a5" + "1a" : "#a00" + "1a")};
`;
