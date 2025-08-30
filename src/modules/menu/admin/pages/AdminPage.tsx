"use client";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";

/* ====== MENU slice ====== */
import {
  fetchMenusAdmin,
  createMenu,
  updateMenu,
  deleteMenu,
  changeMenuPublish,
  changeMenuStatus,
} from "@/modules/menu/slice/menuSlice";

/* ====== CATEGORY slice ====== */
import {
  fetchMenuCategoriesAdmin,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} from "@/modules/menu/slice/menucategorySlice";

/* ====== ITEM slice ====== */
import {
  fetchMenuItemsAdmin,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/modules/menu/slice/menuitemSlice";

/* ====== UI Components ====== */
import {
  MenuForm,
  List,
  CategoryForm,
  CategoryListPage,
  ItemForm,
  ItemListPage,
} from "@/modules/menu";

/* ====== Types ====== */
import type {
  IMenu,
  MenuCreatePayload,
  MenuUpdatePayload,
} from "@/modules/menu/types/menu";

import type {
  IMenuCategory,
  MenuCategoryCreatePayload,
  MenuCategoryUpdatePayload,
} from "@/modules/menu/types/menucategory";

import type {
  IMenuItem,
  MenuItemCreatePayload,
  MenuItemUpdatePayload,
} from "@/modules/menu/types/menuitem";

import { getUILang } from "@/i18n/getUILang";

type Section = "menus" | "categories" | "items";

export default function AdminMenuPage() {
  const { i18n, t } = useI18nNamespace("menu", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const dispatch = useAppDispatch();

  // ---- global state (menu)
  const menus = useAppSelector((s) => (s.menu?.adminList ?? []) as IMenu[]);
  const menuLoading = useAppSelector((s) => s.menu?.loading);
  const menuError = useAppSelector((s) => s.menu?.error);

  // ---- local UI state
  const [section, setSection] = useState<Section>("menus");

  // Menu form state
  const [menuTab, setMenuTab] = useState<"list" | "create">("list");
  const [editingMenu, setEditingMenu] = useState<IMenu | null>(null);

  // Category inline form state
  const [catOpen, setCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<IMenuCategory | null>(null);

  // Item inline form state
  const [itemOpen, setItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IMenuItem | null>(null);

  useEffect(() => {
    dispatch(fetchMenusAdmin({}) as any);
    dispatch(fetchMenuCategoriesAdmin({}) as any);
    dispatch(fetchMenuItemsAdmin({}) as any);
  }, [dispatch]);

  /* ========= MENU handlers ========= */
  const handleMenuSubmit = async (
    payload: MenuCreatePayload | MenuUpdatePayload | FormData,
    id?: string
  ) => {
    try {
      if (id) {
        const patch = payload instanceof FormData ? payload : (payload as MenuUpdatePayload);
        await (dispatch(updateMenu({ id, patch }) as any)).unwrap();
      } else {
        const body = payload instanceof FormData ? payload : (payload as MenuCreatePayload);
        await (dispatch(createMenu(body) as any)).unwrap();
      }
      setEditingMenu(null);
      setMenuTab("list");
      dispatch(fetchMenusAdmin({}) as any);
    } catch {}
  };

  const handleMenuDelete = async (id: string) => {
    const msg = t("confirm.delete_menu", "Bu menüyü silmek istediğinize emin misiniz?");
    if (!confirm(msg)) return;
    try {
      await (dispatch(deleteMenu(id) as any)).unwrap();
      dispatch(fetchMenusAdmin({}) as any);
    } catch {}
  };

  const handleMenuTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(changeMenuPublish({ id, isPublished: !isPublished }) as any)
      .unwrap()
      .then(() => dispatch(fetchMenusAdmin({}) as any))
      .catch(() => {});
  };

  const handleMenuToggleActive = (id: string, isActive: boolean) => {
    dispatch(changeMenuStatus({ id, isActive: !isActive }) as any)
      .unwrap()
      .then(() => dispatch(fetchMenusAdmin({}) as any))
      .catch(() => {});
  };

  /* ========= CATEGORY handlers ========= */
  const handleCategoryOpenCreate = () => {
    setEditingCat(null);
    setCatOpen(true);
  };
  const handleCategoryEdit = (c: IMenuCategory) => {
    setEditingCat(c);
    setCatOpen(true);
  };

  // ✅ FormData | JSON destekli
  const handleCategorySubmit = async (
    payload: MenuCategoryCreatePayload | MenuCategoryUpdatePayload | FormData,
    id?: string
  ) => {
    try {
      if (id) {
        await (dispatch(updateMenuCategory({ id, patch: payload as any }) as any)).unwrap();
      } else {
        await (dispatch(createMenuCategory(payload as any) as any)).unwrap();
      }
      setCatOpen(false);
      setEditingCat(null);
      dispatch(fetchMenuCategoriesAdmin({}) as any);
    } catch {}
  };

  const handleCategoryDelete = async (id: string) => {
    const msg = t("confirm.delete_category", "Kategoriyi silmek istiyor musunuz?");
    if (!confirm(msg)) return;
    try {
      await (dispatch(deleteMenuCategory(id) as any)).unwrap();
      setCatOpen(false);
      setEditingCat(null);
      dispatch(fetchMenuCategoriesAdmin({}) as any);
    } catch {}
  };

  /* ========= ITEM handlers ========= */
  const handleItemSubmit = async (
    payload: MenuItemCreatePayload | MenuItemUpdatePayload | FormData,
    id?: string
  ) => {
    try {
      if (id) {
        await (dispatch(updateMenuItem({ id, patch: payload as any }) as any)).unwrap();
      } else {
        await (dispatch(createMenuItem(payload as any) as any)).unwrap();
      }
      setItemOpen(false);
      setEditingItem(null);
      dispatch(fetchMenuItemsAdmin({}) as any);
    } catch {}
  };

  const handleItemDelete = async (id: string) => {
    const msg = t("confirm.delete_item", "Ürünü silmek istiyor musunuz?");
    if (!confirm(msg)) return;
    try {
      await (dispatch(deleteMenuItem(id) as any)).unwrap();
      setItemOpen(false);
      setEditingItem(null);
      dispatch(fetchMenuItemsAdmin({}) as any);
    } catch {}
  };

  const menuCount = menus?.length ?? 0;

  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Menu Admin")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and publish your menus, categories and items")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="menu-count">{menuCount}</Counter>
        </Right>
      </Header>

      <Tabs>
        <Tab $active={section === "menus"} onClick={() => setSection("menus")}>
          {t("menus", "Menus")}
        </Tab>
        <Tab $active={section === "categories"} onClick={() => setSection("categories")}>
          {t("categories", "Categories")}
        </Tab>
        <Tab $active={section === "items"} onClick={() => setSection("items")}>
          {t("items", "Items")}
        </Tab>
      </Tabs>

      <Section>
        {/* MENUS */}
        {section === "menus" && (
          <>
            <SectionHead>
              <h2>
                {menuTab === "list" && t("list", "List")}
                {menuTab === "create" && (editingMenu ? t("edit", "Edit") : t("create", "Create"))}
              </h2>
              {menuTab === "list" ? (
                <Row>
                  <SmallBtn disabled={!!menuLoading} onClick={() => dispatch(fetchMenusAdmin({}) as any)}>
                    {t("refresh", "Refresh")}
                  </SmallBtn>
                  <PrimaryBtn
                    onClick={() => {
                      setEditingMenu(null);
                      setMenuTab("create");
                    }}
                  >
                    + {t("create", "Create")}
                  </PrimaryBtn>
                </Row>
              ) : (
                <SmallBtn onClick={() => setMenuTab("list")}>{t("backToList", "Back to list")}</SmallBtn>
              )}
            </SectionHead>

            <Card>
              {menuTab === "list" && (
                <List
                  menus={menus}
                  lang={lang}
                  loading={!!menuLoading}
                  error={menuError}
                  onEdit={(m: IMenu) => {
                    setEditingMenu(m);
                    setMenuTab("create");
                  }}
                  onDelete={handleMenuDelete}
                  onTogglePublish={handleMenuTogglePublish}
                  onToggleActive={handleMenuToggleActive}
                />
              )}

              {menuTab === "create" && (
                <MenuForm
                  initial={editingMenu as any}
                  lang={lang}
                  onCancel={() => {
                    setEditingMenu(null);
                    setMenuTab("list");
                  }}
                  onSubmit={handleMenuSubmit}
                />
              )}
            </Card>
          </>
        )}

        {/* CATEGORIES */}
        {section === "categories" && (
          <>
            <SectionHead>
              <h2>{t("categories", "Categories")}</h2>
              <Row>
                <SmallBtn onClick={() => dispatch(fetchMenuCategoriesAdmin({}) as any)}>
                  {t("refresh", "Refresh")}
                </SmallBtn>
                <PrimaryBtn onClick={handleCategoryOpenCreate}>+ {t("newCategory", "New Category")}</PrimaryBtn>
              </Row>
            </SectionHead>

            <Card>
              <CategoryListPage
                onAdd={handleCategoryOpenCreate}
                onEdit={handleCategoryEdit}
              />
            </Card>

            {/* INLINE Category Form */}
            {catOpen && (
              <Card style={{ marginTop: 12 }}>
                <SectionHead>
                  <h3>{editingCat ? t("edit","Edit") : t("create","Create")} — {t("category","Category")}</h3>
                  <Row>
                    {editingCat && editingCat._id && (
                      <DangerBtn
                        onClick={() => {
                          handleCategoryDelete(editingCat._id!);
                        }}
                      >
                        {t("delete","Delete")}
                      </DangerBtn>
                    )}
                    <SmallBtn onClick={() => { setCatOpen(false); setEditingCat(null); }}>
                      {t("close","Close")}
                    </SmallBtn>
                  </Row>
                </SectionHead>

                <CategoryForm
                  isOpen={catOpen}
                  editingItem={editingCat}
                  onClose={() => { setCatOpen(false); setEditingCat(null); }}
                  onSubmit={handleCategorySubmit}
                />
              </Card>
            )}
          </>
        )}

        {/* ITEMS */}
        {section === "items" && (
          <>
            <SectionHead>
              <h2>{t("items", "Items")}</h2>
              <Row>
                <SmallBtn onClick={() => dispatch(fetchMenuItemsAdmin({}) as any)}>
                  {t("refresh", "Refresh")}
                </SmallBtn>
                <PrimaryBtn onClick={() => { setEditingItem(null); setItemOpen(true); }}>
                  + {t("newItem", "New Item")}
                </PrimaryBtn>
              </Row>
            </SectionHead>

            <Card>
              <ItemListPage
                onAdd={() => { setEditingItem(null); setItemOpen(true); }}
                onEdit={(it) => { setEditingItem(it); setItemOpen(true); }}
              />
            </Card>

            {/* INLINE Item Form */}
            {itemOpen && (
              <Card style={{ marginTop: 12 }}>
                <SectionHead>
                  <h3>{editingItem ? t("edit","Edit") : t("create","Create")} — {t("item","Item")}</h3>
                  <Row>
                    {editingItem && editingItem._id && (
                      <DangerBtn
                        onClick={() => {
                          handleItemDelete(editingItem._id!);
                        }}
                      >
                        {t("delete","Delete")}
                      </DangerBtn>
                    )}
                    <SmallBtn onClick={() => { setItemOpen(false); setEditingItem(null); }}>
                      {t("close","Close")}
                    </SmallBtn>
                  </Row>
                </SectionHead>

                <ItemForm
                  isOpen={itemOpen}
                  editingItem={editingItem}
                  onClose={() => { setItemOpen(false); setEditingItem(null); }}
                  onSubmit={handleItemSubmit}
                />
              </Card>
            )}
          </>
        )}
      </Section>
    </PageWrap>
  );
}

/* ---- styled ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content:space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column; align-items: flex-start; gap: ${({ theme }) => theme.spacings.sm};
  }
`;
const TitleBlock = styled.div`display:flex; flex-direction:column; gap:4px; h1{ margin:0; }`;
const Subtitle = styled.p`
  margin:0; color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.sm};
`;
const Right = styled.div`display:flex; gap:${({ theme }) => theme.spacings.sm}; align-items:center;`;
const Counter = styled.span`
  padding: 6px 10px; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const Tabs = styled.div`display:flex; gap:${({ theme }) => theme.spacings.xs}; margin-bottom:${({ theme }) => theme.spacings.md};`;
const Tab = styled.button<{ $active?: boolean }>`
  padding:8px 12px; border-radius:${({ theme }) => theme.radii.pill};
  background:${({ $active, theme }) => ($active ? theme.colors.primaryLight : theme.colors.cardBackground)};
  color:${({ theme }) => theme.colors.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor:pointer;
`;
const Section = styled.section`margin-top: ${({ theme }) => theme.spacings.sm};`;
const SectionHead = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:${({ theme }) => theme.spacings.sm};
`;
const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;
const PrimaryBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 12px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const DangerBtn = styled(SmallBtn)`
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border-color:${({theme})=>theme.colors.danger};
  &:hover{
    background:${({theme})=>theme.colors.dangerHover};
    color:${({theme})=>theme.colors.textOnDanger};
    border-color:${({theme})=>theme.colors.dangerHover};
  }
`;
const Row = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center; flex-wrap: wrap;`;
