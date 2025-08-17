"use client";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/massage/locales";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES } from "@/types/common";

import {
  createMassage,
  updateMassage,
  deleteMassage,
  togglePublishMassage,
} from "@/modules/massage/slice/massageSlice";
import {
  createMassageCategory,
  updateMassageCategory,
} from "@/modules/massage/slice/massageCategorySlice";

import { FormModal, CategoryForm, CategoryListPage, List } from "@/modules/massage";
import { Modal } from "@/shared";
import type { IMassage, MassageCategory } from "@/modules/massage/types";

/* --- helpers --- */
const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two)
    ? (two as SupportedLocale)
    : "tr";
};

export default function AdminMassagePage() {
  const { i18n, t } = useI18nNamespace("massage", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  // state (fetch parentte)
  const massage = useAppSelector((s) =>
    Array.isArray(s.massage.massageAdmin) ? s.massage.massageAdmin : []
  );
  const loading = useAppSelector((s) => s.massage.loading);
  const error = useAppSelector((s) => s.massage.error);
  const categories = useAppSelector((s) => (s as any).massageCategory?.categories ?? []) as MassageCategory[];

  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">("list");
  const [editingItem, setEditingItem] = useState<IMassage | null>(null);
  const [editingCategory, setEditingCategory] = useState<MassageCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dispatch = useAppDispatch();

  /* --- actions --- */
  const handleSubmit = async (formData: FormData, id?: string) => {
    if (id) await (dispatch(updateMassage({ id, formData }) as any)).unwrap().catch(() => {});
    else await (dispatch(createMassage(formData) as any)).unwrap().catch(() => {});
    setActiveTab("list");
  };

  const handleDelete = async (id: string) => {
    const confirmMsg = t("confirm.delete_massage", "Bu hizmeti silmek istediğinize emin misiniz?");
    if (confirm(confirmMsg)) await (dispatch(deleteMassage(id) as any)).unwrap().catch(() => {});
  };

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    dispatch(togglePublishMassage({ id, isPublished: !isPublished }) as any);
  };

  const handleCategorySubmit = async (
    data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
    id?: string
  ) => {
    if (id) await (dispatch(updateMassageCategory({ id, data }) as any)).unwrap().catch(() => {});
    else await (dispatch(createMassageCategory(data) as any)).unwrap().catch(() => {});
    setEditingCategory(null);
    setCategoryModalOpen(false);
  };

  const count = massage?.length ?? 0;

  /* --- UI (About ile aynı patern) --- */
  return (
    <PageWrap>
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Massage")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and publish your massage")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="massage-count">{count}</Counter>
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
              massage={massage}
              lang={lang}
              loading={loading}
              error={error}
              onEdit={(item) => {
                setEditingItem(item);
                setActiveTab("create");
              }}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
              categories={categories}
            />
          )}

          {activeTab === "create" && (
            <FormModal
              isOpen
              onClose={() => {
                setEditingItem(null);
                setActiveTab("list");
              }}
              editingItem={editingItem}
              onSubmit={handleSubmit}
              categories={categories}
            />
          )}

          {activeTab === "categories" && (
            <>
              <CategoryListPage
                onAdd={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
                onEdit={(category: MassageCategory) => {
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

/* ---- styled (about admin ile birebir) ---- */
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
