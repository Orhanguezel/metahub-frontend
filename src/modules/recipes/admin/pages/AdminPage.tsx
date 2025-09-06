"use client";
import styled from "styled-components";
import { useState, useMemo, useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/recipes/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

// 10 dilli recipes common
import type { SupportedLocale } from "@/types/recipes/common";
import { SUPPORTED_LOCALES } from "@/types/recipes/common";

// ✅ Slice action adları (admin)
import {
  createRecipeAdmin,
  updateRecipeAdmin,
  deleteRecipeAdmin,
  togglePublishRecipeAdmin,
} from "@/modules/recipes/slice/recipeSlice";

// ✅ Category slice action adları
import {
  createRecipeCategory,
  updateRecipeCategory,
  fetchRecipeCategories, // ⬅️ sadece kategorileri çek
} from "@/modules/recipes/slice/recipeCategorySlice";

import { RecipesForm, CategoryForm, CategoryListPage, List } from "@/modules/recipes";
import { Modal } from "@/shared";
import type { IRecipe, RecipeCategory } from "@/modules/recipes/types";

/* --- helpers --- */
const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two) ? (two as SupportedLocale) : "tr";
};

export default function AdminRecipesPage() {
  const { i18n, t } = useI18nNamespace("recipes", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  // state (recipes parent’ta fetch ediliyor)
  const recipes = useAppSelector((s) => s.recipe.adminList || []);
  const loading = useAppSelector((s) => s.recipe.loading);
  const error = useAppSelector((s) => s.recipe.error);

  // kategori slice (store key’in sende `recipesCategory` olduğunu belirtmiştin)
  const categories = useAppSelector(
    (s) => (s as any).recipeCategory?.categories ?? []
  ) as RecipeCategory[];

  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">("list");
  const [editingItem, setEditingItem] = useState<IRecipe | null>(null);
  const [editingCategory, setEditingCategory] = useState<RecipeCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();

  // ⬇️ sadece kategorileri fetch et (mount’ta ve dil değişince – istersen dil bağımlılığını kaldırabilirsin)
  useEffect(() => {
    (dispatch(fetchRecipeCategories() as any)).unwrap().catch(() => {});
  }, [dispatch]);

  /* --- actions --- */
  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) await (dispatch(updateRecipeAdmin({ id, input: formData } as any)) as any).unwrap().catch(() => {});
    else await (dispatch(createRecipeAdmin(formData as any)) as any).unwrap().catch(() => {});
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t("confirm.delete_recipes", "Bu tarifi silmek istediğinize emin misiniz?");
    if (confirm(confirmMsg)) await (dispatch(deleteRecipeAdmin(id) as any)).unwrap().catch(() => {});
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishRecipeAdmin({ id, isPublished: !isPublished }) as any);
  };

  const handleCategorySubmit = async (
    data: { name: Record<SupportedLocale, string>; order?: number; isActive?: boolean },
    id?: string
  ) => {
    if (id) await (dispatch(updateRecipeCategory({ id, data }) as any)).unwrap().catch(() => {});
    else await (dispatch(createRecipeCategory(data) as any)).unwrap().catch(() => {});
    setEditingCategory(null);
    setCategoryModalOpen(false);
  };

  const count = recipes?.length ?? 0;

  /* --- UI --- */
  return (
    <PageWrap>
      {/* Header */}
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Recipes")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and publish your recipes")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="recipes-count">{count}</Counter>
          <PrimaryBtn
            onClick={() => {
              setEditingItem(null);
              setActiveTab("create");
            }}
          >
            + {t("create", "Create")}
          </PrimaryBtn>
        </Right>
      </Header>

      {/* Tabs */}
      <Tabs>
        <Tab $active={activeTab === "list"} onClick={() => setActiveTab("list")}>
          {t("list", "List")}
        </Tab>
        <Tab $active={activeTab === "create"} onClick={() => setActiveTab("create")}>
          {t("create", "Create")}
        </Tab>
        <Tab $active={activeTab === "categories"} onClick={() => setActiveTab("categories")}>
          {t("categories", "Categories")}
        </Tab>
      </Tabs>

      <Section>
        <SectionHead>
          <h2>
            {activeTab === "list" && t("list", "List")}
            {activeTab === "create" && t("create", "Create")}
            {activeTab === "categories" && t("categories", "Categories")}
          </h2>
          {activeTab === "list" ? (
            <SmallBtn disabled={loading}>{t("refresh", "Refresh")}</SmallBtn>
          ) : activeTab === "create" ? (
            <SmallBtn onClick={() => setActiveTab("list")}>{t("backToList", "Back to list")}</SmallBtn>
          ) : (
            <SmallBtn onClick={() => setCategoryModalOpen(true)}>+ {t("newCategory", "New Category")}</SmallBtn>
          )}
        </SectionHead>

        <Card>
          {activeTab === "list" && (
            <List
              recipes={recipes}
              lang={lang}
              loading={loading}
              error={error}
              onEdit={(item: IRecipe) => {
                setEditingItem(item);
                setActiveTab("create");
              }}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
              categories={categories}
            />
          )}

          {activeTab === "create" && (
            <RecipesForm
              initial={editingItem}
              categories={categories}
              onAddCategory={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
              onCancel={() => {
                setEditingItem(null);
                setActiveTab("list");
              }}
              onSubmit={handleSubmit}
            />
          )}

          {activeTab === "categories" && (
            <>
              <CategoryListPage
                onAdd={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
                onEdit={(category: RecipeCategory) => {
                  setEditingCategory(category);
                  setCategoryModalOpen(true);
                }}
              />
              <Modal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)}>
                <CategoryForm
                  isOpen={categoryModalOpen}
                  onClose={() => setCategoryModalOpen(false)}
                  editingItem={editingCategory}
                  onSubmit={handleCategorySubmit}
                />
              </Modal>
            </>
          )}
        </Card>
      </Section>
    </PageWrap>
  );
}

/* styled … (değişmedi) */
const PageWrap = styled.div`max-width:${({theme})=>theme.layout.containerWidth};margin:0 auto;padding:${({theme})=>theme.spacings.xl};`;
const Header = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:${({theme})=>theme.spacings.lg};${({theme})=>theme.media.mobile}{flex-direction:column;align-items:flex-start;gap:${({theme})=>theme.spacings.sm};}`;
const TitleBlock = styled.div`display:flex;flex-direction:column;gap:4px;h1{margin:0;}`;
const Subtitle = styled.p`margin:0;color:${({theme})=>theme.colors.textSecondary};font-size:${({theme})=>theme.fontSizes.sm};`;
const Right = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};align-items:center;`;
const Counter = styled.span`padding:6px 10px;border-radius:${({theme})=>theme.radii.pill};background:${({theme})=>theme.colors.backgroundAlt};font-weight:${({theme})=>theme.fontWeights.medium};`;
const Tabs = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};margin-bottom:${({theme})=>theme.spacings.md};`;
const Tab = styled.button<{ $active?: boolean }>`padding:8px 12px;border-radius:${({theme})=>theme.radii.pill};background:${({$active,theme})=>$active?theme.colors.primaryLight:theme.colors.cardBackground};color:${({theme})=>theme.colors.text};border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};cursor:pointer;`;
const Section = styled.section`margin-top:${({theme})=>theme.spacings.sm};`;
const SectionHead = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:${({theme})=>theme.spacings.sm};`;
const Card = styled.div`background:${({theme})=>theme.colors.cardBackground};border-radius:${({theme})=>theme.radii.lg};box-shadow:${({theme})=>theme.cards.shadow};padding:${({theme})=>theme.spacings.lg};`;
const PrimaryBtn = styled.button`background:${({theme})=>theme.buttons.primary.background};color:${({theme})=>theme.buttons.primary.text};border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};padding:8px 12px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;`;
const SmallBtn = styled.button`background:${({theme})=>theme.buttons.secondary.background};color:${({theme})=>theme.buttons.secondary.text};border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};padding:6px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;`;
