"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchGalleryItems,
  getGalleryStats,
  fetchGalleryCategories,
} from "@/modules/gallery/slice/gallerySlice";
import{ 
GalleryList,
GalleryMultiForm,
GalleryStats
} from "@/modules/gallery";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const AdminGalleryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, stats, categories, loading } = useAppSelector(
    (state) => state.gallery
  );
  const { t } = useTranslation("gallery");

  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    dispatch(fetchGalleryItems({}));
    dispatch(getGalleryStats());
    dispatch(fetchGalleryCategories());
  }, [dispatch]);

  const handleUpdate = async () => {
    await dispatch(fetchGalleryItems({}));
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
      </AnimatePresence>
    </Container>
  );
};

export default AdminGalleryPage;

// Styled Components

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TabButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.backgroundSecondary};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.buttonText : theme.colors.text};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: ${({ theme }) => theme.colors.buttonText};
  }
`;

const EmptyMessage = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textAlt};
  margin-top: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

// Motion Wrapper
const MotionWrapper = styled(motion.div)`
  width: 100%;
`;
