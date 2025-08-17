"use client";

import styled from "styled-components";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/services";
import type { ServicesCategory } from "@/modules/services/types";
import { type SupportedLocale } from "@/types/common";
import { deleteServicesCategory } from "@/modules/services/slice/servicesCategorySlice";

interface ServicesCategoryListPageProps {
  onAdd: () => void;
  onEdit: (category: ServicesCategory) => void;
}

export default function ServicesCategoryListPage({
  onAdd,
  onEdit,
}: ServicesCategoryListPageProps) {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("services", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const categories = useAppSelector((s) => s.servicesCategory.categories);
  const loading = useAppSelector((s) => s.servicesCategory.loading);
  const error = useAppSelector((s) => s.servicesCategory.error);

  const handleDelete = (id: string) => {
    const confirmMessage = t("admin.confirm.delete", "Are you sure you want to delete this category?");
    if (window.confirm(confirmMessage)) dispatch(deleteServicesCategory(id));
  };

  return (
    <Wrap>
      <Header>
        <h2>{t("admin.categories.title", "Service Categories")}</h2>
        <AddBtn onClick={onAdd}>+ {t("admin.categories.add", "Add Category")}</AddBtn>
      </Header>

      {loading && <Info>{t("admin.loading", "Loading...")}</Info>}
      {error && !loading && <Error>❌ {error}</Error>}
      {!loading && !error && (!categories || categories.length === 0) && (
        <Info>{t("admin.categories.empty", "No categories found.")}</Info>
      )}

      {!loading && !error && categories && categories.length > 0 && (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th style={{ width: 56 }}>#</th>
                <th>{t("admin.categories.name", "Name")} ({lang.toUpperCase()})</th>
                <th>{t("admin.slug", "Slug")}</th>
                <th aria-label={t("admin.actions", "Actions")} />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: ServicesCategory, i: number) => (
                <tr key={cat._id}>
                  <td>{i + 1}</td>
                  <td title={cat.name?.[lang] || ""}>{cat.name?.[lang] || "—"}</td>
                  <td>{cat.slug}</td>
                  <td className="actions">
                    <Row>
                      <Secondary onClick={() => onEdit(cat)}>{t("admin.edit", "Edit")}</Secondary>
                      <Danger onClick={() => handleDelete(cat._id)}>{t("admin.delete", "Delete")}</Danger>
                    </Row>
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

/* styled — about category list patern */
const Wrap = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const Header = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  h2{ margin:0; font-size:${({theme})=>theme.fontSizes.lg}; }
`;
const AddBtn = styled.button`
  padding:8px 12px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
`;
const Info = styled.p`text-align:center;color:${({theme})=>theme.colors.textSecondary};`;
const Error = styled.p`text-align:center;color:${({theme})=>theme.colors.danger};`;

const TableWrap = styled.div`
  width:100%;overflow-x:auto;border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};background:${({theme})=>theme.colors.cardBackground};
`;
const Table = styled.table`
  width:100%;border-collapse:collapse;
  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.md};text-align:left;white-space:nowrap;
  }
  td{
    padding:${({theme})=>theme.spacings.md};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    font-size:${({theme})=>theme.fontSizes.sm};vertical-align:middle;
  }
  td.actions{text-align:right;}
  tbody tr:hover td{background:${({theme})=>theme.colors.hoverBackground};}
`;
const Row = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};justify-content:flex-end;`;
const Secondary = styled.button`
  padding:8px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;
const Danger = styled(Secondary)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{
    background:${({theme})=>theme.colors.dangerHover};
    color:${({theme})=>theme.colors.textOnDanger};
    border-color:${({theme})=>theme.colors.dangerHover};
  }
`;
