// src/modules/menu/admin/components/CategoryListPage.tsx
"use client";
import styled from "styled-components";
import Image from "next/image";
import { useMemo, useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  deleteMenuCategory,
  fetchMenuCategoriesAdmin,
  selectMenuCategoriesAdmin,
} from "@/modules/menu/slice/menucategorySlice";

import type { SupportedLocale } from "@/types/common";
import { getMultiLang } from "@/types/common";
import type { IMenuCategory } from "@/modules/menu/types/menucategory";
import { getUILang } from "@/i18n/getUILang";

type Props = {
  onAdd: () => void;
  onEdit: (category: IMenuCategory) => void;
};

export default function CategoryListPage({ onAdd, onEdit }: Props) {
  const { t, i18n } = useI18nNamespace("menu", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectMenuCategoriesAdmin);
  const loading = useAppSelector((s) => s.menucategory?.loading);
  const error = useAppSelector((s) => s.menucategory?.error);

  useEffect(() => {
    if (!categories?.length) {
      dispatch(fetchMenuCategoriesAdmin({}) as any);
    }
  }, [dispatch, categories?.length]);

  const remove = async (id: string) => {
    if (!confirm(t("confirm.delete_category", "Kategoriyi silmek istiyor musunuz?"))) return;
    await dispatch(deleteMenuCategory(id) as any).unwrap().catch(() => {});
  };

  const nameOf = (c: IMenuCategory) => getMultiLang(c.name as any, lang) || c.slug || c.code;

  const thumb = (c: IMenuCategory) => {
    const img = c.images?.[0];
    return img?.thumbnail || img?.webp || img?.url || undefined;
  };

  return (
    <Wrap>
      <Header>
        <h2>{t("categories", "Categories")}</h2>
        <Primary onClick={onAdd}>+ {t("newCategory", "New Category")}</Primary>
      </Header>

      {error && <ErrorBox role="alert">{String(error)}</ErrorBox>}

      {/* Card grid on mobile & tablet */}
      <Cards aria-busy={!!loading}>
        {(!categories || categories.length === 0) && !loading && <Empty>∅</Empty>}
        {categories.map((c) => {
          const title = nameOf(c);
          const src = thumb(c);
          return (
            <Card key={c._id}>
              <ThumbBox>
                {src ? (
                  <Image
                    src={src}
                    alt={title}
                    fill
                    sizes="(max-width: 1024px) 160px, 0px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <Placeholder>—</Placeholder>
                )}
              </ThumbBox>
              <CardBody>
                <CardTitle title={title}>{title}</CardTitle>
                <Meta>
                  <span className="label">{t("slug", "Slug")}:</span>
                  <span className="mono">{c.slug}</span>
                </Meta>
                <Meta>
                  <span className="label">{t("order", "Order")}:</span>
                  <span className="mono">{c.order ?? 0}</span>
                </Meta>
                <Badges>
                  <Badge $on={!!c.isActive}>{c.isActive ? t("active", "Active") : t("inactive", "Inactive")}</Badge>
                  <Badge $on={!!c.isPublished}>
                    {c.isPublished ? t("published", "Published") : t("unpublished", "Unpublished")}
                  </Badge>
                </Badges>
                <ActionsRow>
                  <Secondary onClick={() => onEdit(c)}>{t("edit", "Edit")}</Secondary>
                  <Danger onClick={() => remove(c._id)}>{t("delete", "Delete")}</Danger>
                </ActionsRow>
              </CardBody>
            </Card>
          );
        })}
      </Cards>

      {/* Table on desktop */}
      <TableWrap aria-busy={!!loading}>
        <Table>
          <thead>
            <tr>
              <th style={{ width: 80 }}>{t("image", "Image")}</th>
              <th>{t("name", "Name")}</th>
              <th>{t("slug", "Slug")}</th>
              <th>{t("order", "Order")}</th>
              <th>{t("active", "Active")}</th>
              <th>{t("published", "Published")}</th>
              <th aria-label={t("actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {(!categories || categories.length === 0) && !loading && (
              <tr>
                <td colSpan={7}>
                  <Empty>∅</Empty>
                </td>
              </tr>
            )}
            {categories.map((c) => {
              const title = nameOf(c);
              const src = thumb(c);
              return (
                <tr key={c._id}>
                  <td>
                    <TinyThumb aria-hidden="true">
                      {src ? (
                        <Image
                          src={src}
                          alt={title}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <Placeholder>—</Placeholder>
                      )}
                    </TinyThumb>
                  </td>
                  <td title={title}>{title}</td>
                  <td className="mono">{c.slug}</td>
                  <td className="mono">{c.order ?? 0}</td>
                  <td>
                    <Badge $on={!!c.isActive}>{c.isActive ? t("yes", "Yes") : t("no", "No")}</Badge>
                  </td>
                  <td>
                    <Badge $on={!!c.isPublished}>{c.isPublished ? t("yes", "Yes") : t("no", "No")}</Badge>
                  </td>
                  <td className="actions">
                    <Row>
                      <Secondary onClick={() => onEdit(c)}>{t("edit", "Edit")}</Secondary>
                      <Danger onClick={() => remove(c._id)}>{t("delete", "Delete")}</Danger>
                    </Row>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrap>
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ErrorBox = styled.div`
  padding: ${({ theme }) => theme.spacings.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.radii.md};
`;

/* Cards visible on mobile & tablet, hidden on desktop */
const Cards = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacings.md};

  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
  }
  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: 1fr 1fr;
  }
  ${({ theme }) => theme.media.desktop} {
    display: none;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.cards.shadow};
  display: grid;
  grid-template-columns: 160px 1fr;

  ${({ theme }) => theme.media.xsmall} {
    grid-template-columns: 120px 1fr;
  }
`;

const ThumbBox = styled.div`
  position: relative;
  width: 100%;
  min-height: 120px;
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
`;

const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
`;

const Meta = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${({ theme }) => theme.spacings.xs};
  align-items: center;
  .label {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
  .mono {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
`;

const Badges = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const ActionsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacings.xs};
`;

/* Table hidden on mobile & tablet, visible on desktop */
const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  background: ${({ theme }) => theme.colors.cardBackground};

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
  ${({ theme }) => theme.media.tablet} {
    display: none;
  }
  ${({ theme }) => theme.media.desktop} {
    display: block;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead th {
    background: ${({ theme }) => theme.colors.tableHeader};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacings.md};
    text-align: left;
    white-space: nowrap;
  }
  td {
    padding: ${({ theme }) => theme.spacings.md};
    border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    vertical-align: middle;
  }
  td.mono {
    font-family: ${({ theme }) => theme.fonts.mono};
  }
  td.actions {
    text-align: right;
  }
  tbody tr:hover td {
    background: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

const TinyThumb = styled.div`
  position: relative;
  width: 72px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
`;

const Placeholder = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  justify-content: flex-end;
`;

const Primary = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: ${({ theme }) => theme.transition.normal};
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const Secondary = styled.button`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  transition: ${({ theme }) => theme.transition.fast};
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
`;

const Danger = styled(Secondary)`
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
  &:hover {
    background: ${({ theme }) => theme.colors.dangerHover};
    color: ${({ theme }) => theme.colors.textOnDanger};
    border-color: ${({ theme }) => theme.colors.dangerHover};
  }
`;

const Badge = styled.span<{ $on: boolean }>`
  display: inline-block;
  padding: 0.2em 0.6em;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $on, theme }) => ($on ? theme.colors.successBg : theme.colors.inputBackgroundLight)};
  color: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.textSecondary)};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const Empty = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => theme.spacings.md};
  font-style: italic;
  width: 100%;
`;
