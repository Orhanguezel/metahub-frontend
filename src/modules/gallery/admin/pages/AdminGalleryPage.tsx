"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getGalleryStats,
  clearGalleryMessages,
} from "@/modules/gallery/slice/gallerySlice";
import {
  GalleryList,
  GalleryMultiForm,
  GalleryStats,
  CategoryListPage,
  CategoryForm,
  translations,
} from "@/modules/gallery";
import { Modal } from "@/shared";
import {
  createGalleryCategory,
  updateGalleryCategory,
} from "@/modules/gallery/slice/galleryCategorySlice";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { motion, AnimatePresence } from "framer-motion";
import { IGalleryCategory } from "@/modules/gallery/types";
import { toast } from "react-toastify";

const AdminGalleryPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const images = useAppSelector((state) => state.gallery.adminImages);
  const loading = useAppSelector((state) => state.gallery.loading);
  const successMessage = useAppSelector((state) => state.gallery.successMessage);
  const error = useAppSelector((state) => state.gallery.error);
  const stats = useAppSelector((state) => state.gallery.stats);
  const categories = useAppSelector((s) => s.galleryCategory.adminCategories);

  const { t } = useI18nNamespace("gallery", translations);

  const [activeTab, setActiveTab] = useState<"list" | "add" | "stats" | "categories">("list");
  const [editCategory, setEditCategory] = useState<IGalleryCategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // ✅ Modal kapatma handler
  const handleModalClose = () => {
    setShowCategoryForm(false);
    setEditCategory(null);
  };

  useEffect(() => {
    if (successMessage) toast.success(successMessage);
    if (error) toast.error(error);
    if (successMessage || error) {
      dispatch(clearGalleryMessages());
    }
  }, [successMessage, error, dispatch]);

  useEffect(() => {
    if (!stats || Object.keys(stats).length === 0) {
      dispatch(getGalleryStats());
    }
  }, [dispatch, stats]);

  const handleUpdate = async () => {
    await dispatch(getGalleryStats());
  };

  // ✅ Kategori create/update submit handler
  const handleSubmitCategory = async (formData: FormData, id?: string) => {
    if (id) {
      // Update
      await dispatch(updateGalleryCategory({ id, data: formData })).unwrap();
    } else {
      // Create
      await dispatch(createGalleryCategory(formData)).unwrap();
    }
    handleModalClose(); // Modal'ı kapat
  };

  const handleAddCategory = () => {
    setEditCategory(null);
    setShowCategoryForm(true);
  };
  const handleEditCategory = (category: IGalleryCategory) => {
    setEditCategory(category);
    setShowCategoryForm(true);
  };

  return (
    <Container>
      <Title>{t("title")}</Title>

      <TabButtons>
        <TabButton $active={activeTab === "stats"} onClick={() => setActiveTab("stats")}>
          {t("tab.stats")}
        </TabButton>
        <TabButton $active={activeTab === "add"} onClick={() => setActiveTab("add")}>
          {t("tab.add")}
        </TabButton>
        <TabButton $active={activeTab === "list"} onClick={() => setActiveTab("list")}>
          {t("tab.list")}
        </TabButton>
        <TabButton $active={activeTab === "categories"} onClick={() => setActiveTab("categories")}>
          {t("tab.categories", "Categories")}
        </TabButton>
      </TabButtons>

      <AnimatePresence mode="wait">
        {activeTab === "stats" && (
          <MotionWrapper
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <GalleryStats stats={stats} />
          </MotionWrapper>
        )}

        {activeTab === "add" && (
          <MotionWrapper
            key="add"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <GalleryMultiForm categories={categories || []} onUpdate={handleUpdate} />
          </MotionWrapper>
        )}

        {activeTab === "list" && (
          <MotionWrapper
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <EmptyMessage>{t("loading")}</EmptyMessage>
            ) : images.length > 0 ? (
              <GalleryList
                images={images}
                categories={categories}
                onUpdate={handleUpdate}
              />
            ) : (
              <EmptyMessage>{t("empty")}</EmptyMessage>
            )}
          </MotionWrapper>
        )}

        {activeTab === "categories" && (
          <MotionWrapper
            key="categories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <CategoryListPage
              onAdd={handleAddCategory}
              onEdit={handleEditCategory}
            />

            <AnimatePresence>
              {showCategoryForm && (
                <Modal isOpen={showCategoryForm} onClose={handleModalClose}>
                  <CategoryForm
                    isOpen={showCategoryForm}
                    onClose={handleModalClose}
                    editingItem={editCategory}
                    onSubmit={handleSubmitCategory}
                  />
                </Modal>
              )}
            </AnimatePresence>
          </MotionWrapper>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default AdminGalleryPage;

// ---- Styles (değişmedi) ----

const Container = styled.div`
  padding: ${({ theme }) => theme.spacings.xxl}
    ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.colors.sectionBackground};
  color: ${({ theme }) => theme.colors.text};
  min-height: 70vh;
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  transition: background 0.3s;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  text-align: left;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacings: 0.02em;
`;

const TabButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
  justify-content: flex-start;
  flex-wrap: wrap;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.6rem 2rem;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.main};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.backgroundSecondary};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.buttonText : theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background 0.22s, color 0.22s, box-shadow 0.22s;

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primaryHover : theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.buttonText};
    box-shadow: ${({ theme }) => theme.shadows.lg};
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

const MotionWrapper = styled(motion.div)`
  width: 100%;
  min-height: 300px;
`;

