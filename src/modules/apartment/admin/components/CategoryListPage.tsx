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
        <StatusMessage aria-live="polite">{t("admin.loading", "Loading...")}</StatusMessage>
      ) : error ? (
        <ErrorMessage role="alert">❌ {error}</ErrorMessage>
      ) : !categories || categories.length === 0 ? (
        <StatusMessage>
          {t("admin.categories.empty", "No categories found.")}
        </StatusMessage>
      ) : (
        <>
          {/* Desktop / Tablet: Tablo */}
          <TableWrap>
            <Table role="table">
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
                    <td>{cat.name?.[lang] || cat.name?.[ "en" ] || "—"}</td>
                    <td>{cat.slug || "—"}</td>
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
          </TableWrap>

          {/* Mobile: Kartlar */}
          <Cards role="list">
            {categories.map((cat, i) => {
              const title = cat.name?.[lang] || cat.name?.en || "—";
              return (
                <Card role="listitem" key={cat._id}>
                  <CardHeader>
                    <IndexBadge>{i + 1}</IndexBadge>
                    <CardTitle title={title}>{title}</CardTitle>
                    <ActivePill $active={!!cat.isActive}>
                      {cat.isActive
                        ? t("admin.active", "Active")
                        : t("admin.inactive", "Inactive")}
                    </ActivePill>
                  </CardHeader>

                  <MetaGrid>
                    <MetaRow>
                      <MetaLabel>{t("admin.slug", "Slug")}</MetaLabel>
                      <MetaValue>{cat.slug || "—"}</MetaValue>
                    </MetaRow>
                    <MetaRow>
                      <MetaLabel>{t("city", "City")}</MetaLabel>
                      <MetaValue>{cat.city || "—"}</MetaValue>
                    </MetaRow>
                    <MetaRow>
                      <MetaLabel>{t("district", "District")}</MetaLabel>
                      <MetaValue>{cat.district || "—"}</MetaValue>
                    </MetaRow>
                    <MetaRow>
                      <MetaLabel>{t("zip", "ZIP")}</MetaLabel>
                      <MetaValue>{cat.zip || "—"}</MetaValue>
                    </MetaRow>
                  </MetaGrid>

                  <CardActions>
                    <ActionButton
                      onClick={() => onEdit(cat)}
                      disabled={loading || status === "loading"}
                    >
                      {t("admin.edit", "Edit")}
                    </ActionButton>
                    <ToggleButton
                      onClick={() => handleToggleActive(cat)}
                      disabled={loading || status === "loading"}
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
                  </CardActions>
                </Card>
              );
            })}
          </Cards>
        </>
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
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  h2 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    color: ${({ theme }) => theme.colors.title};
  }

  ${({ theme }) => theme.media.small} {
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacings.xs};
  }
`;

const AddButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background ${({ theme }) => theme.transition.fast};
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

/* masaüstünde tablo; mobilde gizle */
const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.cards.shadow};

  ${({ theme }) => theme.media.small} {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
    font-size: 0.95rem;
    vertical-align: middle;
    color: ${({ theme }) => theme.colors.text};
  }

  thead th {
    background: ${({ theme }) => theme.colors.tableHeader};
    position: sticky;
    top: 0;
    z-index: 1;
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

const ActivePill = styled.span<{ $active: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $active, theme }) => ($active ? theme.colors.textOnSuccess : "#a00")};
  background: ${({ $active, theme }) => ($active ? theme.colors.success : "#a00")};
  opacity: ${({ $active }) => ($active ? 1 : 0.85)};
`;

/* --- Mobile Cards --- */
const Cards = styled.div`
  display: none;

  ${({ theme }) => theme.media.small} {
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacings.md};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacings.md};
`;

const CardHeader = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const IndexBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radii.circle};
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const MetaRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: ${({ theme }) => theme.spacings.sm};
  font-size: 0.95rem;
`;

const MetaLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetaValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;
`;

const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 0.4rem 0.8rem;
  background: ${({ theme }) => theme.colors.warning};
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ToggleButton = styled.button`
  padding: 0.4rem 0.8rem;
  background: ${({ theme }) => theme.colors.info};
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const DeleteButton = styled.button`
  padding: 0.4rem 0.8rem;
  background: ${({ theme }) => theme.colors.danger};
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
