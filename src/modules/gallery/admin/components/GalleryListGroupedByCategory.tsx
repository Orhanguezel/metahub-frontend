"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { deleteGalleryItem } from "@/modules/gallery/slice/gallerySlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {Modal} from "@/shared";
import {GalleryEditForm} from "@/modules/gallery";

export interface GalleryItemData {
  image: string;
  thumbnail?: string;
  webp?: string;
  title: {
    tr: string;
    en: string;
    de: string;
  };
  description?: {
    tr: string;
    en: string;
    de: string;
  };
  order?: number;
}

export interface GalleryItem {
  _id: string;
  category: string;
  type: string;
  items: GalleryItemData[];
}

interface GalleryListProps {
  items: GalleryItem[];
  categories: string[];
  onUpdate: () => void;
}

const GalleryList: React.FC<GalleryListProps> = ({
  items,
  categories,
  onUpdate,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("gallery");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined" && window.confirm(t("delete.confirm"))) {
      await dispatch(deleteGalleryItem(id));
      onUpdate();
    }
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = async () => {
    setSelectedItem(null);
    onUpdate();
  };

  const filteredItems =
    selectedCategory === ""
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <>
      <CategoryButtons>
        <CategoryButton
          active={selectedCategory === ""}
          onClick={() => setSelectedCategory("")}
        >
          {t("form.all")}
        </CategoryButton>
        {categories.map((cat) => (
          <CategoryButton
            key={cat}
            active={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </CategoryButton>
        ))}
      </CategoryButtons>

      {filteredItems.length === 0 ? (
        <EmptyMessage>{t("empty")}</EmptyMessage>
      ) : (
        <GridWrapper>
          {filteredItems.map((item) => {
            const firstItem = item.items?.[0];
            const imageUrl = firstItem?.thumbnail || firstItem?.image || "";
            const title = firstItem?.title?.tr || "No title";

            return (
              <SmallCard key={item._id}>
                {imageUrl ? (
                  <ImagePreview src={imageUrl} alt={title} />
                ) : (
                  <Placeholder>No image</Placeholder>
                )}

                <Info>
                  <CategoryText>{item.category}</CategoryText>
                  <Type>{item.type}</Type>
                  <p>{title}</p>
                </Info>

                <ButtonGroup>
                  <ActionButton onClick={() => handleOpenEdit(item)}>
                    {t("edit.button")}
                  </ActionButton>
                  <DeleteButton onClick={() => handleDelete(item._id)}>
                    {t("delete.button")}
                  </DeleteButton>
                </ButtonGroup>
              </SmallCard>
            );
          })}
        </GridWrapper>
      )}

      {selectedItem && (
        <Modal isOpen={!!selectedItem} onClose={handleCloseModal}>
          <GalleryEditForm
            item={selectedItem}
            categories={categories}
            onClose={handleCloseModal}
          />
        </Modal>
      )}
    </>
  );
};

export default GalleryList;

const CategoryButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CategoryButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.backgroundSecondary};
  color: ${({ active, theme }) =>
    active ? theme.colors.buttonText : theme.colors.text};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    color: ${({ theme }) => theme.colors.buttonText};
  }
`;

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SmallCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Info = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CategoryText = styled.p`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  font-size: 0.8rem;
`;

const Type = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: 0.75rem;

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const DeleteButton = styled(ActionButton)`
  background: ${({ theme }) => theme.buttons.danger.background};

  &:hover {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
  }
`;

const EmptyMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.75rem;
`;
