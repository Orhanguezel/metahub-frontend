"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";

import { clearGalleryMessages } from "@/modules/gallery/slice/gallerySlice";

import {
  GalleryList,
  GalleryMultiForm,
  CategoryListPage,
  CategoryForm,
  translations,
} from "@/modules/gallery";

import {
  createGalleryCategory,
  updateGalleryCategory,
} from "@/modules/gallery/slice/galleryCategorySlice";

import type { GalleryCategory } from "@/modules/gallery/types";
import { Modal } from "@/shared";

const AdminGalleryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("gallery", translations);

  // Slice state
  const items = useAppSelector((s) => s.gallery.galleryAdmin);
  const loading = useAppSelector((s) => s.gallery.loading);
  const successMessage = useAppSelector((s) => s.gallery.successMessage);
  const error = useAppSelector((s) => s.gallery.error);
  const categories = useAppSelector((s) => s.galleryCategory.adminCategories);

  // UI state
  const [activeTab, setActiveTab] = useState<"list" | "create" | "categories">("list");
  const [editCategory, setEditCategory] = useState<GalleryCategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const hasItems = useMemo(() => Array.isArray(items) && items.length > 0, [items]);
  const count = items?.length ?? 0;

  const handleModalClose = () => {
    setShowCategoryForm(false);
    setEditCategory(null);
  };

  // Toast + mesaj temizleme
  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearGalleryMessages());
  }, [successMessage, error, dispatch]);

  // Parent fetch ettiği için burada ekstra fetch yok
  const handleUpdate = () => {
    // no-op (çocuklar kendi dispatch'lerini yapıyor)
  };

  // Kategori create/update
  const handleSubmitCategory = async (formData: FormData, id?: string) => {
    if (id) {
      await dispatch(updateGalleryCategory({ id, data: formData })).unwrap();
    } else {
      await dispatch(createGalleryCategory(formData)).unwrap();
    }
    handleModalClose();
  };

  const handleAddCategory = () => {
    setEditCategory(null);
    setShowCategoryForm(true);
  };
  const handleEditCategory = (category: GalleryCategory) => {
    setEditCategory(category);
    setShowCategoryForm(true);
  };

  return (
    <PageWrap>
      {/* Header — About sayfası paternine uyumlu */}
      <Header>
        <TitleBlock>
          <h1>{t("admin.title", "Gallery Management")}</h1>
          <Subtitle>{t("admin.subtitle", "Create, organize and publish your gallery items")}</Subtitle>
        </TitleBlock>
        <Right>
          <Counter aria-label="gallery-count">{count}</Counter>
          <PrimaryBtn
            onClick={() => {
              setActiveTab("create");
            }}
          >
            + {t("create", "Create")}
          </PrimaryBtn>
        </Right>
      </Header>

      {/* Sekmeler */}
      <Tabs role="tablist" aria-label={t("tabs", "Gallery tabs")}>
        <Tab role="tab" aria-selected={activeTab === "list"} $active={activeTab === "list"} onClick={() => setActiveTab("list")}>
          {t("list", "List")}
        </Tab>
        <Tab role="tab" aria-selected={activeTab === "create"} $active={activeTab === "create"} onClick={() => setActiveTab("create")}>
          {t("create", "Create")}
        </Tab>
        <Tab role="tab" aria-selected={activeTab === "categories"} $active={activeTab === "categories"} onClick={() => setActiveTab("categories")}>
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
            <SmallBtn onClick={handleAddCategory}>+ {t("newCategory", "New Category")}</SmallBtn>
          )}
        </SectionHead>

        <Card>
          {activeTab === "list" && (
            <>
              {loading ? (
                <EmptyMessage>{t("loading", "Loading...")}</EmptyMessage>
              ) : hasItems ? (
                <GalleryList items={items} categories={categories} onUpdate={handleUpdate} />
              ) : (
                <EmptyMessage>{t("empty", "No gallery items yet.")}</EmptyMessage>
              )}
            </>
          )}

          {activeTab === "create" && (
            <GalleryMultiForm categories={categories || []} onUpdate={handleUpdate} />
          )}

          {activeTab === "categories" && (
            <>
              <CategoryListPage onAdd={handleAddCategory} onEdit={handleEditCategory} />
              <Modal isOpen={showCategoryForm} onClose={handleModalClose}>
                <CategoryForm
                  isOpen={showCategoryForm}
                  onClose={handleModalClose}
                  editingItem={editCategory}
                  onSubmit={handleSubmitCategory}
                />
              </Modal>
            </>
          )}
        </Card>
      </Section>
    </PageWrap>
  );
};

export default AdminGalleryPage;

/* ---- styled (classicTheme renkleriyle) ---- */
const PageWrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacings.lg};
  }
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.lg};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column; align-items: flex-start; gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const TitleBlock = styled.div`
  display: flex; flex-direction: column; gap: 4px;

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    line-height: 1.1;
    color: ${({ theme }) => theme.colors.title};
    letter-spacing: .2px;
    position: relative;

    /* alt vurgu çizgisi (tema rengi) */
    &::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: -6px;
      width: 54px;
      height: 3px;
      background: ${({ theme }) => theme.colors.borderHighlight};
      border-radius: ${({ theme }) => theme.radii.pill};
    }
  }

  ${({ theme }) => theme.media.mobile} {
    h1 { font-size: ${({ theme }) => theme.fontSizes.lg}; }
  }
`;

const Subtitle = styled.p`
  margin: 8px 0 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: ${({ theme }) => theme.fonts.body};
`;

const Right = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacings.sm}; align-items: center;
`;

const Counter = styled.span`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.borderHighlight};
  color: ${({ theme }) => theme.colors.title};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const Tabs = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacings.xs};
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.cardBackground};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.buttonText : theme.colors.text};
  border: ${({ theme, $active }) =>
    $active
      ? `${theme.borders.thin} ${theme.colors.primary}`
      : `${theme.borders.thin} ${theme.colors.border}`};
  cursor: pointer;
  transition: background ${({ theme }) => theme.durations.normal} ease;

  &:hover,
  &:focus-visible {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primaryHover : theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.buttonText};
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const SectionHead = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.sm};

  h2 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    color: ${({ theme }) => theme.colors.title};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding: ${({ theme }) => theme.spacings.lg};
`;

const PrimaryBtn = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.background};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: background ${({ theme }) => theme.durations.normal} ease;

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
  }
  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const SmallBtn = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: background ${({ theme }) => theme.durations.normal} ease;

  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const EmptyMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: ${({ theme }) => theme.spacings.xl} 0;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.body};
  opacity: 0.75;
`;
