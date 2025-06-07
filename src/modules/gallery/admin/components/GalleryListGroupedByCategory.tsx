"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { deleteGalleryItem } from "@/modules/gallery/slice/gallerySlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Modal } from "@/shared";
import { GalleryEditForm } from "@/modules/gallery";
import type {
  GalleryCategory,
  GalleryItem as GalleryItemType,
} from "@/modules/gallery/types/gallery";

// GalleryItem interface'i tip dosyanda yukarıdaki gibi olmalı!

interface GalleryListProps {
  items: GalleryItemType[];
  categories: GalleryCategory[];
  onUpdate: () => void;
}

const GalleryList: React.FC<GalleryListProps> = ({
  items,
  categories,
  onUpdate,
}) => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation("gallery");
  const [selectedItem, setSelectedItem] = useState<GalleryItemType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Dil anahtarı güvenli
  const lang: "tr" | "en" | "de" =
    i18n.language === "tr" || i18n.language === "en" || i18n.language === "de"
      ? i18n.language
      : "tr";

  // Seçilen kategoriye göre filtrele
  const filteredItems = !selectedCategory
    ? items
    : items.filter((item) =>
        typeof item.category === "string"
          ? item.category === selectedCategory
          : item.category._id === selectedCategory
      );

  // Silme işlemi
  const handleDelete = async (id: string) => {
    if (typeof window !== "undefined" && window.confirm(t("delete.confirm"))) {
      await dispatch(deleteGalleryItem(id));
      onUpdate();
    }
  };

  // Edit modal aç/kapat
  const handleOpenEdit = (item: GalleryItemType) => setSelectedItem(item);
  const handleCloseModal = () => {
    setSelectedItem(null);
    onUpdate();
  };

  return (
    <>
      {/* Kategori Butonları */}
      <CategoryButtons>
        <CategoryButton
          $active={selectedCategory === ""}
          onClick={() => setSelectedCategory("")}
        >
          {t("form.all")}
        </CategoryButton>
        {categories.map((cat) => (
          <CategoryButton
            key={cat._id}
            $active={selectedCategory === cat._id}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.name?.[lang] || cat.slug}
          </CategoryButton>
        ))}
      </CategoryButtons>

      {/* Görsel grid */}
      {filteredItems.length === 0 ? (
        <EmptyMessage>{t("empty")}</EmptyMessage>
      ) : (
        <GridWrapper>
          {filteredItems.map((item) => {
            const firstItem = item.items?.[0];
            const imageUrl = firstItem?.thumbnail || firstItem?.image || "";
            const title = firstItem?.title?.[lang] || "No title";
            // Kategori adı bul
            const categoryObj =
              typeof item.category === "string"
                ? categories.find((cat) => cat._id === item.category)
                : item.category;

            return (
              <SmallCard key={item._id}>
                {imageUrl ? (
                  <ImagePreview src={imageUrl} alt={title} />
                ) : (
                  <Placeholder>No image</Placeholder>
                )}

                <Info>
                  <CategoryText>
                    {categoryObj?.name?.[lang] ||
                      (typeof item.category === "string"
                        ? item.category
                        : categoryObj?.slug)}
                  </CategoryText>
                  <Type>{item.type}</Type>
                  <p>{title}</p>
                </Info>

                <ButtonGroup>
                  <ActionButton
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                  >
                    {t("edit.button")}
                  </ActionButton>
                  <DeleteButton
                    type="button"
                    onClick={() => handleDelete(item._id)}
                  >
                    {t("delete.button")}
                  </DeleteButton>
                </ButtonGroup>
              </SmallCard>
            );
          })}
        </GridWrapper>
      )}

      {/* Edit Modal */}
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

// Styled Components

const CategoryButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacing.xs};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const CategoryButton = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.backgroundSecondary};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.buttonText : theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.bold : theme.fontWeights.medium};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ $active, theme }) =>
    $active ? theme.shadows.button : "none"};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: ${({ theme }) => theme.colors.buttonText};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
  @media ${({ theme }) => theme.media.xsmall} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const SmallCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 230px;
  transition: background ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal},
    transform ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: scale(1.025);
  }

  @media ${({ theme }) => theme.media.mobile} {
    border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
    min-height: 170px;
  }
`;

const Info = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CategoryText = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: ${({ theme }) => theme.fonts.body};
  margin: 0;
`;

const Type = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.body};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border: none;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    color: ${({ theme }) => theme.buttons.primary.textHover};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const DeleteButton = styled(ActionButton)`
  background: ${({ theme }) => theme.buttons.danger.background};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
    color: ${({ theme }) => theme.buttons.danger.textHover};
  }
`;

const EmptyMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-family: ${({ theme }) => theme.fonts.body};
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const Placeholder = styled.div`
  width: 100%;
  height: 120px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

export {
  CategoryButtons,
  CategoryButton,
  GridWrapper,
  SmallCard,
  Info,
  CategoryText,
  Type,
  ButtonGroup,
  ActionButton,
  DeleteButton,
  EmptyMessage,
  ImagePreview,
  Placeholder,
};
