// src/modules/menu/admin/components/ItemListPage.tsx
"use client";
import styled from "styled-components";
import Image from "next/image";
import { useMemo, useEffect, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getUILang } from "@/i18n/getUILang";

import {
  deleteMenuItem,
  fetchMenuItemsAdmin,
  selectMenuItemsAdmin,
} from "@/modules/menu/slice/menuitemSlice";

import type { SupportedLocale } from "@/types/common";
import { getMultiLang } from "@/types/common";
import type { IMenuItem } from "@/modules/menu/types/menuitem";

type Props = {
  onAdd: () => void;
  onEdit: (item: IMenuItem) => void;
};

type SimpleCat = {
  id: string;
  label: string;
  order?: number;
  code?: string;
  slug?: string;
};

const TAB_ALL = "__all";
const TAB_UNCAT = "__uncat";

export default function ItemListPage({ onAdd, onEdit }: Props) {
  const { t, i18n } = useI18nNamespace("menu", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectMenuItemsAdmin);
  const loading = useAppSelector((s) => s.menuitem?.loading);
  const error = useAppSelector((s) => s.menuitem?.error);

  useEffect(() => {
    if (!items?.length) {
      dispatch(fetchMenuItemsAdmin({}) as any);
    }
  }, [dispatch, items?.length]);

  const [activeTab, setActiveTab] = useState<string>(TAB_ALL);

  const thumb = (m: IMenuItem) => {
    const img = m.images?.[0];
    return img?.thumbnail || img?.webp || img?.url || undefined;
    };

  /* ---------- Categories derived from items ---------- */
  const { cats, counts } = useMemo(() => {
    const map = new Map<string, SimpleCat>();
    const cnt = new Map<string, number>();

    for (const m of items || []) {
      const links = Array.isArray(m.categories) ? m.categories : [];
      if (!links.length) {
        cnt.set(TAB_UNCAT, (cnt.get(TAB_UNCAT) || 0) + 1);
      } else {
        for (const l of links) {
          const catObj: any = typeof l?.category === "string" ? { _id: l.category } : l?.category || {};
          const id = String(catObj?._id || l?.category || "");
          if (!id) continue;
          const label =
            getMultiLang(catObj?.name as any, lang) ||
            catObj?.slug ||
            catObj?.code ||
            id;
          if (!map.has(id)) {
            map.set(id, { id, label, order: catObj?.order, code: catObj?.code, slug: catObj?.slug });
          }
          cnt.set(id, (cnt.get(id) || 0) + 1);
        }
      }
    }

    const arr = Array.from(map.values()).sort((a, b) => {
      const ao = a.order ?? Number.MAX_SAFE_INTEGER;
      const bo = b.order ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.label.localeCompare(b.label);
    });

    return { cats: arr, counts: cnt };
  }, [items, lang]);

  // Ensure active tab exists after data changes
  useEffect(() => {
    if (activeTab !== TAB_ALL && activeTab !== TAB_UNCAT && !cats.find((c) => c.id === activeTab)) {
      setActiveTab(TAB_ALL);
    }
  }, [cats, activeTab]);

  /* ---------- Filter items by active tab ---------- */
  const filtered = useMemo(() => {
    if (activeTab === TAB_ALL) return items || [];
    if (activeTab === TAB_UNCAT) {
      return (items || []).filter((m) => !m.categories?.length);
    }
    return (items || []).filter((m) =>
      (m.categories || []).some((c: any) => {
        const id = typeof c?.category === "string" ? c.category : c?.category?._id || c?.category;
        return String(id) === String(activeTab);
      })
    );
  }, [items, activeTab]);

  const remove = async (id: string) => {
    if (!confirm(t("confirm.delete_item", "Ürünü silmek istiyor musunuz?"))) return;
    await dispatch(deleteMenuItem(id) as any).unwrap().catch(() => {});
  };

  const countOf = (id: string) => counts.get(id) || 0;

  return (
    <Wrap>
      <Header>
        <h2>{t("items", "Items")}</h2>
        <Primary onClick={onAdd}>+ {t("newItem", "New Item")}</Primary>
      </Header>

      {error && <ErrorBox role="alert">{String(error)}</ErrorBox>}

      {/* ---------- Tabs by Category ---------- */}
      <Tabs role="tablist" aria-label={t("categories", "Categories")}>
        <TabButton
          role="tab"
          aria-selected={activeTab === TAB_ALL}
          $active={activeTab === TAB_ALL}
          onClick={() => setActiveTab(TAB_ALL)}
        >
          {t("all", "All")} <TabCount>{items?.length || 0}</TabCount>
        </TabButton>

        <TabButton
          role="tab"
          aria-selected={activeTab === TAB_UNCAT}
          $active={activeTab === TAB_UNCAT}
          onClick={() => setActiveTab(TAB_UNCAT)}
        >
          {t("uncategorized", "Uncategorized")} <TabCount>{countOf(TAB_UNCAT)}</TabCount>
        </TabButton>

        {cats.map((c) => (
          <TabButton
            key={c.id}
            role="tab"
            aria-selected={activeTab === c.id}
            $active={activeTab === c.id}
            onClick={() => setActiveTab(c.id)}
            title={c.slug || c.code || c.label}
          >
            {c.label} <TabCount>{countOf(c.id)}</TabCount>
          </TabButton>
        ))}
      </Tabs>

      {/* ---------- Cards (mobile & tablet) ---------- */}
      <Cards aria-busy={!!loading}>
        {(!filtered || filtered.length === 0) && !loading && <Empty>∅</Empty>}
        {filtered.map((m) => {
          const title = getMultiLang(m.name as any, lang) || m.slug || m.code;
          const src = thumb(m);
          return (
            <Card key={m._id}>
              <CardThumb>
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
              </CardThumb>
              <CardBody>
                <CardTitle title={title}>{title}</CardTitle>
                <MetaRow>
                  <span className="label">{t("code", "Code")}:</span>
                  <span className="mono">{m.code}</span>
                </MetaRow>
                <MetaRow>
                  <span className="label">{t("slug", "Slug")}:</span>
                  <span className="mono">{m.slug}</span>
                </MetaRow>
                <MetaRow>
                  <span className="label">{t("variants", "Variants")}:</span>
                  <span className="mono">{m.variants?.length ?? 0}</span>
                </MetaRow>
                <Badges>
                  <Badge $on={!!m.isActive}>{m.isActive ? t("active", "Active") : t("inactive", "Inactive")}</Badge>
                  <Badge $on={!!m.isPublished}>
                    {m.isPublished ? t("published", "Published") : t("unpublished", "Unpublished")}
                  </Badge>
                </Badges>
                <ActionsRow>
                  <Secondary onClick={() => onEdit(m)}>{t("edit", "Edit")}</Secondary>
                  <Danger onClick={() => remove(m._id)}>{t("delete", "Delete")}</Danger>
                </ActionsRow>
              </CardBody>
            </Card>
          );
        })}
      </Cards>

      {/* ---------- Table (desktop) ---------- */}
      <TableWrap aria-busy={!!loading}>
        <Table>
          <thead>
            <tr>
              <th style={{ width: 72 }}>{t("image", "Image")}</th>
              <th>{t("name", "Name")}</th>
              <th>{t("code", "Code")}</th>
              <th>{t("slug", "Slug")}</th>
              <th>{t("variants", "Variants")}</th>
              <th>{t("active", "Active")}</th>
              <th>{t("published", "Published")}</th>
              <th aria-label={t("actions", "Actions")} />
            </tr>
          </thead>
          <tbody>
            {(!filtered || filtered.length === 0) && !loading && (
              <tr>
                <td colSpan={8}>
                  <Empty>∅</Empty>
                </td>
              </tr>
            )}
            {filtered.map((m) => {
              const title = getMultiLang(m.name as any, lang) || m.slug || m.code;
              const src = thumb(m);
              return (
                <tr key={m._id}>
                  <td>
                    <TinyThumb aria-hidden="true">
                      {src ? (
                        <Image src={src} alt={title} fill sizes="72px" style={{ objectFit: "cover" }} />
                      ) : (
                        <Placeholder>—</Placeholder>
                      )}
                    </TinyThumb>
                  </td>
                  <td title={title}>{title}</td>
                  <td className="mono">{m.code}</td>
                  <td className="mono">{m.slug}</td>
                  <td className="mono">{m.variants?.length ?? 0}</td>
                  <td>
                    <Badge $on={!!m.isActive}>{m.isActive ? t("yes", "Yes") : t("no", "No")}</Badge>
                  </td>
                  <td>
                    <Badge $on={!!m.isPublished}>{m.isPublished ? t("yes", "Yes") : t("no", "No")}</Badge>
                  </td>
                  <td className="actions">
                    <Row>
                      <Secondary onClick={() => onEdit(m)}>{t("edit", "Edit")}</Secondary>
                      <Danger onClick={() => remove(m._id)}>{t("delete", "Delete")}</Danger>
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

/* ================= styled ================= */

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

/* Tabs */
const Tabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  flex-wrap: wrap;
`;
const TabButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.inputBackgroundLight)};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  &:hover {
    background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.hoverBackground)};
  }
`;
const TabCount = styled.span`
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
`;

/* Cards for mobile & tablet */
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

const CardThumb = styled.div`
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

const MetaRow = styled.div`
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

/* Table for desktop only */
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
  flex: 0 0 auto;
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
  flex-wrap: wrap;
`;

const Primary = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;

const Secondary = styled.button`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
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
