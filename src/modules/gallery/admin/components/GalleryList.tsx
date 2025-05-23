"use client";

import React, { useState, useEffect } from "react";
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
  title: { tr: string; en: string; de: string };
  description?: { tr: string; en: string; de: string };
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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [search, setSearch] = useState("");

  const handleDelete = async (id: string) => {
    if (window.confirm(t("delete.confirm"))) {
      await dispatch(deleteGalleryItem(id));
      onUpdate();
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = async () => {
    setSelectedItem(null);
    onUpdate();
  };

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 100
    ) {
      setVisibleCount((prev) => prev + 12);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredItems = items
    .filter(
      (item) =>
        (selectedCategory === "" || item.category === selectedCategory) &&
        (search === "" ||
          item.items[0]?.title.tr
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.items[0]?.title.en
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.items[0]?.title.de.toLowerCase().includes(search.toLowerCase()))
    )
    .slice(0, visibleCount);

  return (
    <>
      <Controls>
        <CategoryButtons>
          <CategoryButton
            $active={selectedCategory === ""}
            onClick={() => setSelectedCategory("")}
          >
            {t("form.all")}
          </CategoryButton>
          {categories.map((cat) => (
            <CategoryButton
              key={cat}
              $active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </CategoryButton>
          ))}
        </CategoryButtons>

        <SearchInput
          type="text"
          placeholder={t("form.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Controls>

      {selectedIds.length > 0 && (
        <BatchActions>
          <button
            onClick={async () => {
              for (const id of selectedIds) {
                await dispatch(deleteGalleryItem(id));
              }
              setSelectedIds([]);
              onUpdate();
            }}
          >
            {t("delete.selected")}
          </button>
        </BatchActions>
      )}

      <GridWrapper>
        {filteredItems.map((item) => {
          const firstItem = item.items[0];
          const imageUrl = firstItem?.thumbnail || firstItem?.image;
          const title = firstItem?.title?.tr || "No title";

          return (
            <SmallCard key={item._id}>
              <SelectCheckbox
                type="checkbox"
                checked={selectedIds.includes(item._id)}
                onChange={() => handleToggleSelect(item._id)}
              />
              <FavoriteButton
                onClick={() => handleToggleFavorite(item._id)}
                $active={favorites.includes(item._id)}
              >
                ♥
              </FavoriteButton>

              <div
                onClick={() => handleToggleSelect(item._id)}
                style={{ cursor: "pointer" }}
              >
                {imageUrl ? (
                  <ImagePreview src={imageUrl} alt={title} />
                ) : (
                  <Placeholder>No image</Placeholder>
                )}
              </div>

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

      {selectedItem && (
        <Modal isOpen onClose={handleCloseModal}>
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

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CategoryButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CategoryButton = styled.button<{ $active: boolean }>`
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

const SearchInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

const BatchActions = styled.div`
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SmallCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  position: relative;
`;

const SelectCheckbox = styled.input`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
`;

const FavoriteButton = styled.button<{ $active: boolean }>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  cursor: pointer;
`;

const Info = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const CategoryText = styled.p`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: 0.8rem;
`;

const Type = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
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
  font-size: 0.75rem;
`;
