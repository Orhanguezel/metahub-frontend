"use client";

import styled from "styled-components";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/library/locales";
import type { LibraryCategory } from "@/modules/library/types";
import { LANG_LABELS, SupportedLocale } from "@/types/common";
import { deleteLibraryCategory, fetchLibraryCategories } from "@/modules/library/slice/libraryCategorySlice";
import { useEffect } from "react";

interface Props {
  onAdd: () => void;
  onEdit: (category: LibraryCategory) => void;
}

export default function CategoryListPage({ onAdd, onEdit }: Props) {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("library", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const categories = useAppSelector((s) => s.libraryCategory.categories);
  const loading = useAppSelector((s) => s.libraryCategory.loading);
  const error = useAppSelector((s) => s.libraryCategory.error);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchLibraryCategories());
    }
  }, [dispatch, categories]); // intentionally once

  const handleDelete = (id: string) => {
    const msg = t("admin.confirm.delete", "Are you sure you want to delete this category?");
    if (confirm(msg)) dispatch(deleteLibraryCategory(id));
  };

  return (
    <Wrap>
      <Header>
        <h2>{t("admin.categories.title", "Categories")}</h2>
        <Primary onClick={onAdd}>{t("admin.categories.add", "Add Category")}</Primary>
      </Header>

      {loading ? (
        <Status>{t("admin.loading", "Loading...")}</Status>
      ) : error ? (
        <Error>❌ {error}</Error>
      ) : !categories || categories.length === 0 ? (
        <Status>{t("admin.categories.empty", "No categories found.")}</Status>
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
            {categories.map((cat, i) => (
              <tr key={cat._id}>
                <td>{i + 1}</td>
                <td>{cat.name?.[lang] || cat.name?.en || "—"}</td>
                <td>{cat.slug}</td>
                <td className="actions">
                  <Secondary onClick={() => onEdit(cat)}>{t("admin.edit", "Edit")}</Secondary>
                  <Danger onClick={() => handleDelete(cat._id)}>{t("admin.delete", "Delete")}</Danger>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`margin-top:${({theme})=>theme.spacings.md};`;
const Header = styled.div`
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:${({theme})=>theme.spacings.md};
  h2{ margin:0; font-size:${({theme})=>theme.fontSizes.lg}; }
`;
const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} transparent;
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const Table = styled.table`
  width:100%; border-collapse:collapse;
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  overflow:hidden; box-shadow:${({theme})=>theme.cards.shadow};

  th, td{ padding:${({theme})=>theme.spacings.md}; text-align:left; }
  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    white-space:nowrap;
  }
  tbody td{ border-top:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright}; }
  td.actions{ white-space:nowrap; }
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer; margin-right:8px;
  &:hover{ background:${({theme})=>theme.buttons.secondary.backgroundHover}; }
`;
const Danger = styled(Secondary)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{ background:${({theme})=>theme.colors.dangerHover}; color:${({theme})=>theme.colors.textOnDanger}; }
`;
const Status = styled.p`text-align:center; color:${({theme})=>theme.colors.textSecondary};`;
const Error = styled.p`text-align:center; color:${({theme})=>theme.colors.danger}; font-weight:${({theme})=>theme.fontWeights.semiBold};`;
