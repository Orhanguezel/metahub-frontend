"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getGalleryStats,
} from "@/modules/gallery/slice/gallerySlice";

import {
  GalleryList,
  GalleryMultiForm,
  GalleryStats,
  CategoryListPage,
  CategoryForm,
} from "@/modules/gallery";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import type { SupportedLocale } from "@/types/common";
import { motion, AnimatePresence } from "framer-motion";
import { IGalleryCategory } from "@/modules/gallery/types";

const AdminGalleryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const images = useAppSelector((state) => state.gallery.images);
  const stats = useAppSelector((state) => state.gallery.stats);
  const loading = useAppSelector((state) => state.gallery.loading);
  const categories = useAppSelector((state) => state.gallery.categories);

 const { i18n, t } = useI18nNamespace("gallery", translations);
     const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const [activeTab, setActiveTab] = useState<
    "list" | "add" | "stats" | "categories"
  >("list");
  const [editCategory, setEditCategory] = useState<IGalleryCategory | null>(
    null
  );
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  useEffect(() => {
    dispatch(getGalleryStats());
  }, [dispatch]);

  const handleUpdate = async () => {
    await dispatch(getGalleryStats());
  };

  return (
    <Container>
      <Title>{t("title")}</Title>

      <TabButtons>
        <TabButton
          $active={activeTab === "stats"}
          onClick={() => setActiveTab("stats")}
        >
          {t("tab.stats")}
        </TabButton>
        <TabButton
          $active={activeTab === "add"}
          onClick={() => setActiveTab("add")}
        >
          {t("tab.add")}
        </TabButton>
        <TabButton
          $active={activeTab === "list"}
          onClick={() => setActiveTab("list")}
        >
          {t("tab.list")}
        </TabButton>
        <TabButton
          $active={activeTab === "categories"}
          onClick={() => setActiveTab("categories")}
        >
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
  padding: ${({ theme }) => theme.spacings.xxl}
    ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  min-width: 340px;
  max-width: 90vw;

  @media (max-width: 600px) {
    padding: ${({ theme }) => theme.spacings.lg}
      ${({ theme }) => theme.spacings.sm};
    min-width: 0;
  }
`;
