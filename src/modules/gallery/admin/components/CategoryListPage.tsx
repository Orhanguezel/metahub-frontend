// src/modules/gallery/components/GalleryCategoryListPage.tsx
"use client";

import styled from "styled-components";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/gallery";
import { deleteGalleryCategory } from "@/modules/gallery/slice/galleryCategorySlice";
import type { GalleryCategory } from "@/modules/gallery/types";
import { LANG_LABELS, SupportedLocale } from "@/types/common";

interface Props {
  onAdd: () => void;
  onEdit: (category: GalleryCategory) => void;
}

export default function GalleryCategoryListPage({ onAdd, onEdit }: Props) {
  const { i18n, t } = useI18nNamespace("gallery", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;
  const dispatch = useAppDispatch();

  const { adminCategories: categories, loading, error } = useAppSelector(
    (state) => state.galleryCategory
  );

  const handleDelete = (id: string) => {
    const msg = t("admin.confirm.delete", "Are you sure you want to delete this category?");
    if (window.confirm(msg)) dispatch(deleteGalleryCategory(id));
  };

  const total = categories.length;

  return (
    <Wrap>
      <TopBar>
        <Title>{t("admin.categories.title", "Gallery Categories")}</Title>
        <Right>
          <Counter aria-label={t("count", "Count")}>{total}</Counter>
          <Primary onClick={onAdd}>{t("admin.categories.add", "Add Category")}</Primary>
        </Right>
      </TopBar>

      {loading ? (
        <Status>{t("admin.loading", "Loading...")}</Status>
      ) : error ? (
        <Error>❌ {error}</Error>
      ) : total === 0 ? (
        <Empty>{t("admin.categories.empty", "No categories found.")}</Empty>
      ) : (
        <TableWrap>
          <Table role="table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t(`admin.language.${lang}`, LANG_LABELS[lang])}</th>
                <th>{t("admin.slug", "Slug")}</th>
                <th>{t("admin.active", "Active")}</th>
                <th className="actions">{t("admin.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={cat._id}>
                  <td>{i + 1}</td>
                  <td title={cat.name?.[lang] || "—"}>{cat.name?.[lang] || "—"}</td>
                  <td className="mono" title={cat.slug}>
                    {cat.slug}
                  </td>
                  <td>
                    <StateBadge $on={!!cat.isActive}>
                      {cat.isActive ? t("on", "On") : t("off", "Off")}
                    </StateBadge>
                  </td>
                  <td className="actions">
                    <Secondary onClick={() => onEdit(cat)}>
                      {t("admin.edit", "Edit")}
                    </Secondary>
                    <Danger onClick={() => handleDelete(cat._id)}>
                      {t("admin.delete", "Delete")}
                    </Danger>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </Wrap>
  );
}

/* ================= Styles ================= */

const Wrap = styled.div`
  margin-top: ${({ theme }) => theme.spacings.md};
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.md};
  flex-wrap: wrap;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.title};
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Counter = styled.span`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const BaseBtn = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: ${({ theme }) => theme.fonts.body};
  box-shadow: ${({ theme }) => theme.shadows.button};

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Primary = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border-color: ${({ theme }) => theme.buttons.primary.background};
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
  }
`;

const Secondary = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
`;

const Danger = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};
  border-color: ${({ theme }) => theme.buttons.danger.background};
  &:hover {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
    color: ${({ theme }) => theme.buttons.danger.textHover};
  }
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  background: ${({ theme }) => theme.colors.cardBackground};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 680px;

  th,
  td {
    padding: ${({ theme }) => theme.spacings.md};
    text-align: left;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
    color: ${({ theme }) => theme.colors.text};
  }

  thead th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.text};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tbody tr:hover td {
    background: ${({ theme }) => theme.colors.hoverBackground};
  }

  td.actions {
    text-align: right;
    white-space: nowrap;
  }

  .mono {
    font-family: ${({ theme }) => theme.fonts.mono};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const StateBadge = styled.span<{ $on: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  background: ${({ $on, theme }) => ($on ? theme.colors.successBg : theme.colors.dangerBg)};
  color: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.danger)};
  border: ${({ theme }) => theme.borders.thin}
    ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.danger)};
`;

const Status = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin: ${({ theme }) => theme.spacings.lg} 0;
`;

const Empty = styled(Status)``;

const Error = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin: ${({ theme }) => theme.spacings.lg} 0;
`;
