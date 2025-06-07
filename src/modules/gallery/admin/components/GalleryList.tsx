"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { deleteGalleryItem } from "@/modules/gallery/slice/gallerySlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Modal } from "@/shared";
import { GalleryEditForm } from "@/modules/gallery";
import type { GalleryItem, GalleryCategory } from "@/modules/gallery/types/gallery";

interface GalleryListProps {
  items: GalleryItem[];
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
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [search, setSearch] = useState("");

  // Güvenli dil anahtarı
  const lang: "tr" | "en" | "de" =
    i18n.language === "tr" || i18n.language === "en" || i18n.language === "de"
      ? i18n.language
      : "tr";

  // Seçili kategoriye ve aramaya göre filtrele
  const filteredItems = items
    .filter((item) => {
     const categoryId =
  item && item.category
    ? typeof item.category === "string"
      ? item.category
      : item.category._id || ""
    : "";

      const matchesCategory =
        selectedCategory === "" || categoryId === selectedCategory;

      const firstItem = item.items[0];
      const matchesSearch =
        search === "" ||
        firstItem?.title?.tr?.toLowerCase().includes(search.toLowerCase()) ||
        firstItem?.title?.en?.toLowerCase().includes(search.toLowerCase()) ||
        firstItem?.title?.de?.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .slice(0, visibleCount);


  const getCategoryObj = (cat: string | GalleryCategory) =>
    typeof cat === "string"
      ? categories.find((c) => c._id === cat)
      : cat;

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
              key={cat._id}
              $active={selectedCategory === cat._id}
              onClick={() => setSelectedCategory(cat._id)}
            >
              {cat.name?.[lang] || cat.slug}
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
          const title = firstItem?.title?.[lang] || "No title";
          const categoryObj = getCategoryObj(item.category);

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
                <CategoryText>
                  {categoryObj?.name?.[lang] ||
                    (typeof item.category === "string"
                      ? item.category
                      : (item.category as GalleryCategory)?.slug || "")}
                </CategoryText>
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

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  align-items: center;

  @media ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const CategoryButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};

  @media ${({ theme }) => theme.media.mobile} {
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.xs};
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
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  box-shadow: ${({ $active, theme }) =>
    $active ? theme.shadows.button : "none"};
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: ${({ theme }) => theme.colors.buttonText};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const SearchInput = styled.input`
  flex: 1 1 200px;
  min-width: 180px;
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: border ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal};

  &::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    opacity: 1;
  }

  &:focus {
    border: ${({ theme }) => theme.borders.thick} ${({ theme }) => theme.colors.inputBorderFocus};
    outline: none;
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
  }
`;

const BatchActions = styled.div`
  margin: ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};

  button {
    background: ${({ theme }) => theme.buttons.danger.background};
    color: ${({ theme }) => theme.buttons.danger.text};
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    border: none;
    border-radius: ${({ theme }) => theme.radii.pill};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
    cursor: pointer;
    box-shadow: ${({ theme }) => theme.shadows.button};
    transition: background ${({ theme }) => theme.transition.normal};

    &:hover,
    &:focus {
      background: ${({ theme }) => theme.buttons.danger.backgroundHover};
      color: ${({ theme }) => theme.buttons.danger.textHover};
      box-shadow: ${({ theme }) => theme.shadows.lg};
    }
  }
`;

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
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
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  min-height: 230px;
  transition: box-shadow ${({ theme }) => theme.transition.normal},
    background ${({ theme }) => theme.transition.normal},
    transform ${({ theme }) => theme.transition.normal};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    background: ${({ theme }) => theme.colors.hoverBackground};
    transform: scale(1.03);
  }

  @media ${({ theme }) => theme.media.mobile} {
    border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
    min-height: 170px;
  }
`;

const SelectCheckbox = styled.input`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  width: 1.2em;
  height: 1.2em;
  accent-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`;

const FavoriteButton = styled.button<{ $active: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primaryTransparent : "transparent"};
  border: none;
  border-radius: ${({ theme }) => theme.radii.circle};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  width: 2.1em;
  height: 2.1em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background ${({ theme }) => theme.transition.normal},
    color ${({ theme }) => theme.transition.normal};
  cursor: pointer;
  box-shadow: ${({ $active, theme }) =>
    $active ? theme.shadows.button : "none"};

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.colors.primaryDark};
    background: ${({ theme }) => theme.colors.primaryTransparent};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xs};
  background: ${({ theme }) => theme.colors.backgroundAlt};
`;

const Placeholder = styled.div`
  width: 100%;
  height: 120px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xs};
`;

const Info = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  flex: 1 1 auto;
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

export {
  Controls,
  CategoryButtons,
  CategoryButton,
  SearchInput,
  BatchActions,
  GridWrapper,
  SmallCard,
  SelectCheckbox,
  FavoriteButton,
  ImagePreview,
  Placeholder,
  Info,
  CategoryText,
  Type,
  ButtonGroup,
  ActionButton,
  DeleteButton,
};
