"use client";
import styled from "styled-components";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/recipes/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getUILang } from "@/i18n/recipes/getUILang";

import type { SupportedLocale } from "@/types/recipes/common";

// ✅ Recipes slice (ADMIN + PUBLIC)
import {
  fetchRecipesAdmin,
  createRecipeAdmin,
  updateRecipeAdmin,
  deleteRecipeAdmin,
  togglePublishRecipeAdmin,
} from "@/modules/recipes/slice/recipeSlice";

// ✅ Category slice
import {
  createRecipeCategory,
  updateRecipeCategory,
  fetchRecipeCategories,
} from "@/modules/recipes/slice/recipeCategorySlice";

import { RecipesForm, CategoryForm, CategoryListPage, List } from "@/modules/recipes";
import RecipeAIGenerator from "@/modules/recipes/admin/components/RecipesForm/RecipeAIGenerator"; // gerekirse pathi kendi yapına göre düzelt
import type { IRecipe, RecipeCategory, RecipeFormInput } from "@/modules/recipes/types";

/* ── FormData → RecipeFormInput (TÜM ALANLAR) ── */
function fdToRecipeFormInput(fd: FormData): RecipeFormInput {
  const j = <T = any>(k: string): T | undefined => {
    const v = fd.get(k);
    if (typeof v === "string") { try { return JSON.parse(v) as T; } catch {} }
    return undefined;
  };
  const n = (k: string): number | undefined => {
    const v = fd.get(k);
    const num = typeof v === "string" ? Number(v) : Number(v as any);
    return Number.isFinite(num) ? num : undefined;
  };
  const b = (k: string): boolean | undefined => {
    const v = fd.get(k);
    if (v == null) return undefined;
    if (typeof v === "string") return v === "true" || v === "1";
    return Boolean(v);
  };
  const s = (k: string): string | undefined => {
    const v = fd.get(k);
    return typeof v === "string" && v.trim() ? v : undefined;
  };

  const images = fd.getAll("images").filter(x => x instanceof File) as File[];
  const removedImages: string[] = j<string[]>("removedImages") || [];

  return {
    slugCanonical: s("slugCanonical"),
    slug: j("slug") ?? s("slug"),
    order: n("order"),

    title: j("title"),
    description: j("description"),

    cuisines: j("cuisines"),
    tags: j("tags"),
    categories: j("categories"),

    servings: n("servings"),
    prepMinutes: n("prepMinutes"),
    cookMinutes: n("cookMinutes"),
    totalMinutes: n("totalMinutes"),
    calories: n("calories"),

    effectiveFrom: s("effectiveFrom"),
    effectiveTo: s("effectiveTo"),

    ingredients: j("ingredients"),
    steps: j("steps"),

    isPublished: b("isPublished"),
    isActive: b("isActive"),

    images: images.length ? images : undefined,
    removedImages,
  };
}

export default function AdminRecipesPage() {
  const { i18n, t } = useI18nNamespace("recipes", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  // Store selectors (slice keys: recipe / recipesCategory)
  const recipes    = useAppSelector((s) => s.recipe.adminList);
  const loading    = useAppSelector((s) => s.recipe.loading);
  const error      = useAppSelector((s) => s.recipe.error);
  const categories = useAppSelector((s) => s.recipesCategory.categories) as RecipeCategory[];

  // Üst tablar
  const [activeTab, setActiveTab] = useState<"list" | "recipes" | "categories">("list");

  // Recipes sekmesi için alt tablar (New/Edit/AI)
  const [recTab, setRecTab] = useState<"new" | "edit" | "ai">("new");
  const [editingItem, setEditingItem] = useState<IRecipe | null>(null);

  // Categories sekmesi için alt tablar (List/Form)
  const [catTab, setCatTab] = useState<"catList" | "catForm">("catList");
  const [editingCategory, setEditingCategory] = useState<RecipeCategory | null>(null);

  const dispatch = useAppDispatch();

  // Mount: admin list + categories
  useEffect(() => {
    (dispatch(fetchRecipesAdmin() as any)).unwrap().catch(() => {});
    (dispatch(fetchRecipeCategories() as any)).unwrap().catch(() => {});
  }, [dispatch]);

  /* ── actions ── */
  const handleSubmit = useCallback(
    async (formData: FormData, id?: string) => {
      try {
        const payload: RecipeFormInput = fdToRecipeFormInput(formData);
        if (id) {
          await (dispatch(updateRecipeAdmin({ id, input: payload }) as any)).unwrap();
        } else {
          await (dispatch(createRecipeAdmin(payload) as any)).unwrap();
        }
        setEditingItem(null);
        setRecTab("new");
        setActiveTab("list");
      } catch {
        // hata slice’a düşer
      }
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmMsg = t("confirm.delete_recipes", "Bu tarifi silmek istediğinize emin misiniz?");
      if (!confirm(confirmMsg)) return;
      await (dispatch(deleteRecipeAdmin(id) as any)).unwrap().catch(() => {});
    },
    [dispatch, t]
  );

  const handleTogglePublish = useCallback(
    (id: string, isPublished: boolean) => {
      dispatch(togglePublishRecipeAdmin({ id, isPublished: !isPublished }) as any);
    },
    [dispatch]
  );

  const handleCategorySubmit = useCallback(
    async (
      data: { name: Record<SupportedLocale, string>; order?: number; isActive?: boolean },
      id?: string
    ) => {
      try {
        if (id) await (dispatch(updateRecipeCategory({ id, data }) as any)).unwrap();
        else await (dispatch(createRecipeCategory(data) as any)).unwrap();
        (dispatch(fetchRecipeCategories() as any)).unwrap().catch(() => {});
        setEditingCategory(null);
        setCatTab("catList");
      } catch {
        // slice handle
      }
    },
    [dispatch]
  );

  const count = recipes?.length ?? 0;

  /* ── UI ── */
  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Recipes")}</h1>
        </TitleBlock>
        <Right>
          <Counter aria-label="recipes-count">{count}</Counter>
          <PrimaryBtn
            onClick={() => {
              setEditingItem(null);
              setRecTab("new");
              setActiveTab("recipes");
            }}
          >
            + {t("create", "Create")}
          </PrimaryBtn>
        </Right>
      </Header>

      {/* Üst sekmeler */}
      <Tabs>
        <Tab $active={activeTab === "list"} onClick={() => setActiveTab("list")}>
          {t("list", "List")}
        </Tab>

        <Tab
          $active={activeTab === "recipes"}
          onClick={() => {
            setActiveTab("recipes");
            if (editingItem) setRecTab("edit");
            else setRecTab("new");
          }}
        >
          {recTab === "edit" ? t("edit", "Edit") : recTab === "ai" ? "AI" : t("create", "Create")}
        </Tab>

        <Tab
          $active={activeTab === "categories"}
          onClick={() => {
            setActiveTab("categories");
            setCatTab("catList");
            setEditingCategory(null);
          }}
        >
          {t("categories", "Categories")}
        </Tab>
      </Tabs>

      <Section>
        <SectionHead>
          <h2>
            {activeTab === "list" && t("list", "List")}
            {activeTab === "recipes" && (recTab === "edit" ? t("edit", "Edit") : recTab === "ai" ? "AI" : t("create", "Create"))}
            {activeTab === "categories" && t("categories", "Categories")}
          </h2>

          {activeTab === "list" && (
            <SmallBtn onClick={() => dispatch(fetchRecipesAdmin() as any)} disabled={loading}>
              {t("refresh", "Refresh")}
            </SmallBtn>
          )}

          {activeTab === "recipes" && (
            <SmallBtn onClick={() => setActiveTab("list")}>{t("backToList", "Back to list")}</SmallBtn>
          )}

          {activeTab === "categories" && (
            <SmallBtn onClick={() => dispatch(fetchRecipeCategories() as any)} disabled={loading}>
              {t("refresh", "Refresh")}
            </SmallBtn>
          )}
        </SectionHead>

        {/* Recipes için ALT TABLAR */}
        {activeTab === "recipes" && (
          <SubTabs>
            <Tab
              $active={recTab === "new"}
              onClick={() => {
                setRecTab("new");
                setEditingItem(null);
              }}
            >
              {t("newRecipe", "New Recipe")}
            </Tab>
            <Tab
              $active={recTab === "edit"}
              disabled={!editingItem}
              onClick={() => {
                if (!editingItem) return;
                setRecTab("edit");
              }}
            >
              {t("editRecipe", "Edit Recipe")}
            </Tab>
            <Tab
              $active={recTab === "ai"}
              onClick={() => setRecTab("ai")}
            >
              AI
            </Tab>
          </SubTabs>
        )}

        {/* Categories için ALT TABLAR */}
        {activeTab === "categories" && (
          <SubTabs>
            <Tab
              $active={catTab === "catList"}
              onClick={() => {
                setCatTab("catList");
                setEditingCategory(null);
              }}
            >
              {t("category.list", "Category List")}
            </Tab>
            <Tab
              $active={catTab === "catForm"}
              onClick={() => {
                if (!editingCategory) setEditingCategory({} as any);
                setCatTab("catForm");
              }}
            >
              {editingCategory && (editingCategory as any)?._id
                ? t("editCategory", "Edit Category")
                : t("newCategory", "New Category")}
            </Tab>
          </SubTabs>
        )}

        <Card>
          {activeTab === "list" && (
            <List
              recipes={recipes}
              lang={lang}
              loading={loading}
              error={error}
              onEdit={(item: IRecipe) => {
                setEditingItem(item);
                setActiveTab("recipes");
                setRecTab("edit");
              }}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
              categories={categories}
            />
          )}

          {activeTab === "recipes" && recTab !== "ai" && (
            <RecipesForm
              initial={recTab === "edit" ? editingItem : null}
              onAddCategory={() => {
                setActiveTab("categories");
                setEditingCategory({} as any);
                setCatTab("catForm");
              }}
              onCancel={() => {
                setEditingItem(null);
                setRecTab("new");
                setActiveTab("list");
              }}
              onSubmit={handleSubmit}
              onOpenAI={() => setRecTab("ai")} // ⬅️ modal yerine AI sekmesine geç
            />
          )}

          {activeTab === "recipes" && recTab === "ai" && (
            <RecipeAIGenerator
              defaultLang={lang}
              onGenerated={(recipe) => {
                setEditingItem(recipe);
                setActiveTab("recipes");
                setRecTab("edit"); // üretimden sonra direkt edit’e geç
              }}
            />
          )}

          {activeTab === "categories" && (
            <>
              {catTab === "catList" ? (
                <CategoryListPage
                  onAdd={() => {
                    setEditingCategory({} as any);
                    setCatTab("catForm");
                  }}
                  onEdit={(category: RecipeCategory) => {
                    setEditingCategory(category);
                    setCatTab("catForm");
                  }}
                />
              ) : (
                <CategoryForm
                  initial={(editingCategory as any)?._id ? editingCategory : null}
                  onCancel={() => {
                    setEditingCategory(null);
                    setCatTab("catList");
                  }}
                  onSubmit={handleCategorySubmit}
                />
              )}
            </>
          )}
        </Card>
      </Section>
    </PageWrap>
  );
}

/* styled – classicTheme ile uyumlu */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile}{ flex-direction: column; align-items: flex-start; gap: ${({ theme }) => theme.spacings.sm}; }
`;
const TitleBlock = styled.div`display:flex;flex-direction:column;gap:4px;h1{margin:0;}`;
const Right = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};align-items:center;`;
const Counter = styled.span`
  padding: 6px 10px; border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const Tabs = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};margin-bottom:${({theme})=>theme.spacings.md};flex-wrap:wrap;`;
const SubTabs = styled(Tabs)`margin-top:${({theme})=>theme.spacings.xs};`;
const Tab = styled.button<{ $active?: boolean; disabled?: boolean }>`
  padding:8px 12px;border-radius:${({theme})=>theme.radii.pill};
  background:${({$active,theme})=>$active?theme.colors.primaryLight:theme.colors.cardBackground};
  color:${({theme})=>theme.colors.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  cursor:${({disabled})=>disabled?'not-allowed':'pointer'};
  opacity:${({disabled})=>disabled?0.5:1};
`;
const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacings.sm};
`;
const SectionHead = styled.div`
  display:flex;align-items:center;justify-content:space-between;margin-bottom:${({theme})=>theme.spacings.sm};
  gap:${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
`;
const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;
const PrimaryBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 12px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
