"use client";

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import {
  deleteGallery,
  updateGallery,
  togglePublishGallery, // ⬅️ eklendi
} from "@/modules/gallery/slice/gallerySlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { translations } from "@/modules/gallery";
import { Modal } from "@/shared";
import { GalleryEditForm } from "@/modules/gallery";
import type { GalleryCategory, IGallery } from "@/modules/gallery/types";

interface GalleryListProps {
  items: IGallery[];
  categories: GalleryCategory[];
  onUpdate: () => void;
}

const GalleryList: React.FC<GalleryListProps> = ({ items, categories, onUpdate }) => {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("gallery", translations);
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLocale;

  const [selectedItem, setSelectedItem] = useState<IGallery | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const filteredItems = useMemo(
    () =>
      selectedCategory
        ? items.filter((item) =>
            typeof item.category === "string"
              ? item.category === selectedCategory
              : item.category?._id === selectedCategory
          )
        : items,
    [items, selectedCategory]
  );

  const totalCount = items.length;
  const filteredCount = filteredItems.length;

  const handleDelete = async (id: string) => {
    if (window.confirm(t("delete.confirm", "Are you sure you want to delete?"))) {
      await dispatch(deleteGallery(id));
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
    await dispatch(updateGallery({ id, formData })).unwrap();
    onUpdate();
    handleCloseModal();
  };

  // ✅ Publish toggle (tek uç)
  const handleTogglePublish = async (id: string) => {
    await dispatch(togglePublishGallery({ id })).unwrap();
    onUpdate();
  };

  const getLocalized = (obj?: Record<string, string>) =>
    obj?.[lang] ||
    obj?.en ||
    SUPPORTED_LOCALES.map((l) => obj?.[l as SupportedLocale]).find(Boolean) ||
    "";

  return (
    <>
      {/* Filter / Count Bar */}
      <TopBar>
        <Chips role="tablist" aria-label={t("filter.categories", "Filter by category")}>
          <Chip
            role="tab"
            aria-selected={selectedCategory === ""}
            $active={selectedCategory === ""}
            onClick={() => setSelectedCategory("")}
          >
            {t("form.all", "All")}
            <CountBadge aria-label={t("count", "count")}>{totalCount}</CountBadge>
          </Chip>

          {categories.map((cat) => {
            const active = selectedCategory === cat._id;
            const label = getLocalized(cat.name) || (cat as any).slug || "—";
            const countForCat = items.filter((x) =>
              typeof x.category === "string" ? x.category === cat._id : x.category?._id === cat._id
            ).length;

            return (
              <Chip
                key={cat._id}
                role="tab"
                aria-selected={active}
                $active={active}
                onClick={() => setSelectedCategory(cat._id)}
                title={label}
              >
                {label}
                <CountBadge>{countForCat}</CountBadge>
              </Chip>
            );
          })}
        </Chips>

        <TotalText>
          {t("list.count", "{n} items").replace("{n}", String(filteredCount))}
        </TotalText>
      </TopBar>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <EmptyMessage>{t("empty", "No gallery items found.")}</EmptyMessage>
      ) : (
        <Grid>
          {filteredItems.map((item) => {
            const firstImg = (item.images || [])[0];
            const imageUrl = firstImg?.thumbnail || firstImg?.url || "";
            const title = getLocalized(item.title) || t("noTitle", "No title");

            const categoryObj =
              typeof item.category === "string"
                ? categories.find((c) => c._id === item.category)
                : item.category;

            const categoryTitle =
              (categoryObj && getLocalized(categoryObj.name)) ||
              (categoryObj as any)?.slug ||
              t("noCategory", "No category");

            return (
              <Card key={item._id}>
                <Media aria-label={title}>
                  {imageUrl ? (
                    <Thumb src={imageUrl} alt={title} />
                  ) : (
                    <NoThumb>{t("noImage", "No image")}</NoThumb>
                  )}

                  <Badges>
                    <TypeBadge $type={item.type}>{item.type}</TypeBadge>

                    {/* ⬇️ Yayın durumu toggle: tıklanabilir badge */}
                    <StateBadge
                      as="button"
                      type="button"
                      $on={item.isPublished}
                      aria-pressed={item.isPublished}
                      title={
                        item.isPublished
                          ? t("unpublish", "Click to unpublish")
                          : t("publish", "Click to publish")
                      }
                      onClick={() => handleTogglePublish(item._id)}
                    >
                      {item.isPublished ? t("published", "Published") : t("draft", "Draft")}
                    </StateBadge>
                  </Badges>
                </Media>

                <Body>
                  <Title>{title}</Title>
                  <MetaRow>
                    <Meta>
                      <MetaKey>{t("form.category", "Category")}:</MetaKey>
                      <MetaVal title={categoryTitle}>{categoryTitle}</MetaVal>
                    </Meta>
                    <Meta>
                      <MetaKey>{t("form.order", "Order")}:</MetaKey>
                      <MetaVal>{item.order ?? 0}</MetaVal>
                    </Meta>
                  </MetaRow>
                </Body>

                <Actions>
                  {/* Ayrı bir toggle butonu da ekliyoruz */}
                  <ToggleBtn onClick={() => handleTogglePublish(item._id)}>
                    {item.isPublished ? t("unpublish", "Unpublish") : t("publish", "Publish")}
                  </ToggleBtn>

                  <Primary onClick={() => handleOpenEdit(item)}>
                    {t("edit.button", "Edit")}
                  </Primary>

                  <Danger onClick={() => handleDelete(item._id)}>
                    {t("delete.button", "Delete")}
                  </Danger>
                </Actions>
              </Card>
            );
          })}
        </Grid>
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

/* ================= Styles (UI standartları) ================= */

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  flex-wrap: wrap;
`;

const Chips = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  flex-wrap: wrap;
`;

const Chip = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.backgroundSecondary};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.buttonText : theme.colors.textSecondary};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.button : "none")};

  &:hover,
  &:focus-visible {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primaryHover : theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.buttonText};
    outline: none;
  }
`;

const CountBadge = styled.span`
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const TotalText = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

const Card = styled.article`
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform .12s ease, box-shadow .18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  @media ${({ theme }) => theme.media.mobile} {
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

const Media = styled.div`
  position: relative;
`;

const Thumb = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  background: ${({ theme }) => theme.colors.backgroundAlt};
`;

const NoThumb = styled.div`
  width: 100%;
  height: 140px;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Badges = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 6px;
`;

const TypeBadge = styled.span<{ $type: "image" | "video" }>`
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  background: ${({ $type, theme }) =>
    $type === "video" ? theme.colors.warning : theme.colors.successBg};
  color: ${({ $type, theme }) =>
    $type === "video" ? theme.colors.warning : theme.colors.success};
  border: ${({ theme }) => theme.borders.thin}
    ${({ $type, theme }) => ($type === "video" ? theme.colors.warning : theme.colors.success)};
`;

// ⬇️ Badge'ı tıklanabilir yaptık
const StateBadge = styled.span<{ $on: boolean }>`
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  background: ${({ $on, theme }) => ($on ? theme.colors.successBg : theme.colors.dangerBg)};
  color: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.danger)};
  border: ${({ theme }) => theme.borders.thin}
    ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.danger)};
  cursor: pointer;
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.title};
  line-height: 1.2;
`;

const MetaRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.md};
  align-items: center;
  flex-wrap: wrap;
`;

const Meta = styled.div`
  display: inline-flex; gap: 6px; align-items: baseline;
`;

const MetaKey = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

const MetaVal = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  padding: ${({ theme }) => theme.spacings.md};
  padding-top: 0;
  justify-content: flex-end;
`;

const BaseBtn = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: ${({ theme }) => theme.fonts.body};
  box-shadow: ${({ theme }) => theme.shadows.button};

  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.colors.shadowHighlight}; }
`;

const ToggleBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border-color: ${({ theme }) => theme.buttons.secondary.background};
  &:hover { background: ${({ theme }) => theme.buttons.secondary.backgroundHover}; }
`;

const Primary = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border-color: ${({ theme }) => theme.buttons.primary.background};
  &:hover { background: ${({ theme }) => theme.buttons.primary.backgroundHover}; color: ${({ theme }) => theme.buttons.primary.textHover}; }
`;

const Danger = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};
  border-color: ${({ theme }) => theme.buttons.danger.background};
  &:hover { background: ${({ theme }) => theme.buttons.danger.backgroundHover}; color: ${({ theme }) => theme.buttons.danger.textHover}; }
`;

const EmptyMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  text-align: center;
  margin: ${({ theme }) => theme.spacings.xl} 0;
  font-family: ${({ theme }) => theme.fonts.body};
`;
