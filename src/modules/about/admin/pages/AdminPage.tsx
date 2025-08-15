"use client";
import styled from "styled-components";
import { useState, useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/about/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";

import { createAbout, updateAbout, deleteAbout, togglePublishAbout } from "@/modules/about/slice/aboutSlice";
import { createAboutCategory, updateAboutCategory } from "@/modules/about/slice/aboutCategorySlice";

import { AboutForm, CategoryForm, CategoryListPage, List } from "@/modules/about";
import { Modal } from "@/shared";
import type { IAbout, AboutCategory } from "@/modules/about/types";

/* --- helpers --- */
const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two) ? (two as SupportedLocale) : "tr";
};

export default function AdminAboutPage() {
  const { i18n, t } = useI18nNamespace("about", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  // state (fetch parentte)
  const about = useAppSelector((state) =>
    Array.isArray(state.about.aboutAdmin) ? state.about.aboutAdmin : []
  );
  const loading = useAppSelector((state) => state.about.loading);
  const error = useAppSelector((state) => state.about.error);
  const categories = useAppSelector((s) => (s as any).aboutCategory?.categories ?? []) as AboutCategory[];

  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">("list");
  const [editingItem, setEditingItem] = useState<IAbout | null>(null);
  const [editingCategory, setEditingCategory] = useState<AboutCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();

  /* --- actions --- */
  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) await (dispatch(updateAbout({ id, formData }) as any)).unwrap().catch(() => {});
    else await (dispatch(createAbout(formData) as any)).unwrap().catch(() => {});
    setActiveTab("list");
  };
  const handleDelete = async (id: string) => {
    const confirmMsg = t("confirm.delete_about", "Bu makaleyi silmek istediğinize emin misiniz?");
    if (confirm(confirmMsg)) await (dispatch(deleteAbout(id) as any)).unwrap().catch(() => {});
  };
  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishAbout({ id, isPublished: !isPublished }) as any);
  };
  const handleCategorySubmit = async (
    data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
    id?: string
  ) => {
    if (id) await (dispatch(updateAboutCategory({ id, data }) as any)).unwrap().catch(() => {});
    else await (dispatch(createAboutCategory(data) as any)).unwrap().catch(() => {});
    setEditingCategory(null);
    setCategoryModalOpen(false);
  };

  const count = about?.length ?? 0;

  /* --- UI --- */
  return (
    <PageWrap>
      {/* Header — opsjobs paternine uygun */}
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "About Articles")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and publish your About content")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="about-count">{count}</Counter>
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

      {/* Sekmeler */}
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

      {/* Sekme içerikleri — SectionHead + Card patern */}
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
              about={about}
              lang={lang}
              loading={loading}
              error={error}
              onEdit={(item: IAbout) => {
                setEditingItem(item);
                setActiveTab("create");
              }}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
              categories={categories}
            />
          )}

          {activeTab === "create" && (
            <AboutForm
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
                onEdit={(category: AboutCategory) => {
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

/* ---- styled (opsjobs ile uyumlu) ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  ${({ theme }) => theme.media.mobile} {
    flex-direction: column; align-items: flex-start; gap: ${({ theme }) => theme.spacings.sm};
  }
`;
const TitleBlock = styled.div`
  display:flex; flex-direction:column; gap:4px;
  h1{ margin:0; }
`;
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
