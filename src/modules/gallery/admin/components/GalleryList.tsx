"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { deleteGalleryItem,updateGalleryItem } from "@/modules/gallery/slice/gallerySlice";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import {translations} from "@/modules/gallery";
import { Modal } from "@/shared";
import { GalleryEditForm } from "@/modules/gallery";
import type { IGalleryCategory, IGallery } from "@/modules/gallery/types";

interface GalleryListProps {
  images: IGallery[];
  categories: IGalleryCategory[];
  onUpdate: () => void;
}

const GalleryList: React.FC<GalleryListProps> = ({
  images,
  categories,
  onUpdate,
}) => {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("gallery", translations);
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;
  const [selectedItem, setSelectedItem] = useState<IGallery | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const filteredItems = selectedCategory
    ? images.filter((item) =>
        typeof item.category === "string"
          ? item.category === selectedCategory
          : item.category?._id === selectedCategory
      )
    : images;

  const handleDelete = async (id: string) => {
    if (window.confirm(t("delete.confirm", "Are you sure you want to delete?"))) {
      await dispatch(deleteGalleryItem(id));
      onUpdate();
    }
  };

const handleOpenEdit = (item: IGallery) => setSelectedItem(item);
const handleCloseModal = () => {
  setSelectedItem(null);
  onUpdate();
};


const handleSubmitGalleryEdit = async (formData: FormData, id?: string) => {
  if (!id) return;
  await dispatch(updateGalleryItem({ id, formData })).unwrap();
  onUpdate();
  handleCloseModal();
};



  return (
    <>
      {/* Category Filter */}
      <CategoryButtons>
        <CategoryButton
          $active={selectedCategory === ""}
          onClick={() => setSelectedCategory("")}
        >
          {t("form.all", "All")}
        </CategoryButton>
        {categories.map((cat) => (
          <CategoryButton
            key={cat._id}
            $active={selectedCategory === cat._id}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.name?.[lang] ||
              SUPPORTED_LOCALES.map((l) => cat.name?.[l]).find(Boolean) ||
              cat.slug}
          </CategoryButton>
        ))}
      </CategoryButtons>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <EmptyMessage>{t("empty", "No gallery items found.")}</EmptyMessage>
      ) : (
        <GridWrapper>
          {filteredItems.map((item) => {
            const firstItem = item.images?.[0];
            const imageUrl = firstItem?.thumbnail || firstItem?.url || "";
            const title =
              firstItem?.name?.[lang] ||
              SUPPORTED_LOCALES.map((l) => firstItem?.name?.[l]).find(Boolean) ||
              t("noTitle", "No title");

            const categoryObj =
              typeof item.category === "string"
                ? categories.find((c) => c._id === item.category)
                : item.category;

            const categoryTitle =
              categoryObj?.name?.[lang] ||
              SUPPORTED_LOCALES.map((l) => categoryObj?.name?.[l]).find(Boolean) ||
              categoryObj?.slug ||
              t("noCategory", "No category");

            return (
              <SmallCard key={item._id}>
                {imageUrl ? (
                  <ImagePreview src={imageUrl} alt={title} />
                ) : (
                  <Placeholder>{t("noImage", "No image")}</Placeholder>
                )}

                <Info>
                  <CategoryText>{categoryTitle}</CategoryText>
                  <Type>{item.type}</Type>
                  <p>{title}</p>
                </Info>

                <ButtonGroup>
                  <ActionButton type="button" onClick={() => handleOpenEdit(item)}>
                    {t("edit.button", "Edit")}
                  </ActionButton>
                  <DeleteButton type="button" onClick={() => handleDelete(item._id)}>
                    {t("delete.button", "Delete")}
                  </DeleteButton>
                </ButtonGroup>
              </SmallCard>
            );
          })}
        </GridWrapper>
      )}

      {selectedItem && (
  <Modal isOpen onClose={handleCloseModal}>
    <GalleryEditForm
      isOpen={!!selectedItem}
      editingItem={selectedItem}
      categories={categories}
      onClose={handleCloseModal}
      onSubmit={async (formData) => {
        if (selectedItem && selectedItem._id) {
          await handleSubmitGalleryEdit(formData, selectedItem._id);
        }
      }}
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
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.lg};

  @media ${({ theme }) => theme.media.mobile} {
    gap: ${({ theme }) => theme.spacings.xs};
    margin-bottom: ${({ theme }) => theme.spacings.md};
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
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.xl};
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
  gap: ${({ theme }) => theme.spacings.lg};
  margin-bottom: ${({ theme }) => theme.spacings.xl};

  @media ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacings.md};
  }
  @media ${({ theme }) => theme.media.xsmall} {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacings.sm};
  }
`;

const SmallCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacings.xl}
    ${({ theme }) => theme.spacings.lg};
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
    padding: ${({ theme }) => theme.spacings.lg}
      ${({ theme }) => theme.spacings.sm};
    min-height: 170px;
  }
`;

const Info = styled.div`
  margin-top: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
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
  gap: ${({ theme }) => theme.spacings.sm};
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  border: none;
  padding: ${({ theme }) => theme.spacings.xs}
    ${({ theme }) => theme.spacings.lg};
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
  margin-top: ${({ theme }) => theme.spacings.xl};
  margin-bottom: ${({ theme }) => theme.spacings.xl};
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
