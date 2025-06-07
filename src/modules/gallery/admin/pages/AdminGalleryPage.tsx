"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchGalleryItems,
  getGalleryStats,
} from "@/modules/gallery/slice/gallerySlice";
import { fetchGalleryCategories } from "@/modules/gallery/slice/galleryCategorySlice";

import {
  GalleryList,
  GalleryMultiForm,
  GalleryStats,
  CategoryListPage,
  CategoryForm,
} from "@/modules/gallery";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryCategory } from "@/modules/gallery/types/gallery";

const AdminGalleryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.gallery.items);
  const stats = useAppSelector((state) => state.gallery.stats);
  const loading = useAppSelector((state) => state.gallery.loading);
  const categories = useAppSelector((state) => state.galleryCategory.categories);
  const { t } = useTranslation("gallery");

  const [activeTab, setActiveTab] = useState<"list" | "add" | "stats" | "categories">("list");
  const [editCategory, setEditCategory] = useState<GalleryCategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  useEffect(() => {
    dispatch(fetchGalleryItems({}));
    dispatch(getGalleryStats());
    dispatch(fetchGalleryCategories());
  }, [dispatch]);

  const handleUpdate = async () => {
    await dispatch(fetchGalleryItems({}));
    await dispatch(getGalleryStats());
    await dispatch(fetchGalleryCategories());
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
            <GalleryMultiForm categories={categories} onUpdate={handleUpdate} />
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
            ) : items.length > 0 ? (
              <GalleryList
                items={items}
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
              onAdd={() => {
                setEditCategory(null);
                setShowCategoryForm(true);
              }}
              onEdit={(cat) => {
                setEditCategory(cat);
                setShowCategoryForm(true);
              }}
            />

            <AnimatePresence>
              {showCategoryForm && (
                <ModalOverlay
                  as={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ModalContent>
                    <CategoryForm
                      editingItem={editCategory}
                      onClose={() => setShowCategoryForm(false)}
                    />
                  </ModalContent>
                </ModalOverlay>
              )}
            </AnimatePresence>
          </MotionWrapper>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default AdminGalleryPage;

// Styles 

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.md};
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
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: left;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.02em;
`;

const TabButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
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
  transition: 
    background 0.22s,
    color 0.22s,
    box-shadow 0.22s;

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
  margin: ${({ theme }) => theme.spacing.xl} 0;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.body};
  opacity: 0.75;
`;

const MotionWrapper = styled(motion.div)`
  width: 100%;
  min-height: 300px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayEnd};
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  transition: background 0.3s;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  min-width: 340px;
  max-width: 90vw;

  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
    min-width: 0;
  }
`;

