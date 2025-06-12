"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/store/hooks";
import {
  fetchBikeCategories,
  clearCategoryMessages,
} from "@/modules/bikes/slice/bikeCategorySlice";
import type { IBike, BikeCategory } from "@/modules/bikes/types";
import { useTranslation } from "react-i18next";
import ImageUploadWithPreview from "@/shared/ImageUploadWithPreview";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";

// Tüm desteklenen diller için
const LANGUAGES = SUPPORTED_LOCALES;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IBike | null;
  categories: BikeCategory[];
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

export default function BikeFormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  categories,
}: Props) {
  const { t, i18n } = useTranslation("bike");
  const currentLang = (
    SUPPORTED_LOCALES.includes(i18n.language as SupportedLocale)
      ? i18n.language
      : "en"
  ) as SupportedLocale;

  const dispatch = useAppDispatch();

  // Çok dilli state
  const emptyLabel = SUPPORTED_LOCALES.reduce(
    (acc, lang) => ({ ...acc, [lang]: "" }),
    {} as Record<SupportedLocale, string>
  );

  const [name, setName] = useState<Record<SupportedLocale, string>>(emptyLabel);
  const [description, setDescription] = useState<Record<SupportedLocale, string>>(emptyLabel);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState<string>("");

  // Görsel state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Kategorileri yükle
  useEffect(() => {
    dispatch(fetchBikeCategories());
    return () => {
      dispatch(clearCategoryMessages());
    };
  }, [dispatch]);

  // Düzenleme modunda varsayılan değerler
  useEffect(() => {
    if (editingItem) {
      setName({ ...emptyLabel, ...editingItem.name });
      setDescription({ ...emptyLabel, ...editingItem.description });
      setBrand(editingItem.brand || "");
      setTags(editingItem.tags?.join(", ") || "");
      setPrice(editingItem.price?.toString() || "");
      setStock(editingItem.stock?.toString() || "");
      setCategory(
        typeof editingItem.category === "string"
          ? editingItem.category
          : editingItem.category?._id || ""
      );
      setExistingImages(editingItem.images?.map((img) => img.url) || []);
      setSelectedFiles([]);
      setRemovedImages([]);
    } else {
      setName(emptyLabel);
      setDescription(emptyLabel);
      setBrand("");
      setTags("");
      setPrice("");
      setStock("");
      setCategory("");
      setExistingImages([]);
      setSelectedFiles([]);
      setRemovedImages([]);
    }
  }, [editingItem, isOpen]); // isOpen değişince de resetle!

  // Çoklu görsel bileşeninden değişiklikleri al
  const handleImagesChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current);
    },
    []
  );

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Eğer sadece bir dilde veri girilmişse diğer dillere kopyala (ilk doldurulanı kullan)
    const filledName = { ...name };
    const firstNameValue = Object.values(name).find((v) => v.trim());
    if (firstNameValue)
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledName[lng]) filledName[lng] = firstNameValue;
      });

    const filledDesc = { ...description };
    const firstDescValue = Object.values(description).find((v) => v.trim());
    if (firstDescValue)
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledDesc[lng]) filledDesc[lng] = firstDescValue;
      });

    const formData = new FormData();
    formData.append("name", JSON.stringify(filledName));
    formData.append("description", JSON.stringify(filledDesc));
    formData.append("brand", brand.trim());
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append(
      "tags",
      JSON.stringify(
        tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      )
    );
    formData.append("category", category);
    formData.append("isPublished", "true");

    for (const file of selectedFiles) {
      formData.append("images", file);
    }
    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }

    await onSubmit(formData, editingItem?._id);
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.bike.edit", "Edit Bike")
          : t("admin.bike.create", "Add New Bike")}
      </h2>
      <form onSubmit={handleSubmit}>
        {LANGUAGES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`name-${lng}`}>
              {t("admin.bike.name", "Bike Name")} ({lng.toUpperCase()})
            </label>
            <input
              id={`name-${lng}`}
              type="text"
              value={name[lng]}
              onChange={(e) => setName({ ...name, [lng]: e.target.value })}
              required={lng === currentLang}
              // Sadece aktif dil zorunlu, diğerleri opsiyonel
            />

            <label htmlFor={`desc-${lng}`}>
              {t("admin.bike.description", "Description")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`desc-${lng}`}
              value={description[lng]}
              onChange={(e) => setDescription({ ...description, [lng]: e.target.value })}
              required={lng === currentLang}
            />
          </div>
        ))}

        <label htmlFor="brand">{t("admin.bike.brand", "Brand")}</label>
        <input
          id="brand"
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
        />

        <label htmlFor="price">{t("admin.bike.price", "Price")}</label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <label htmlFor="stock">{t("admin.bike.stock", "Stock")}</label>
        <input
          id="stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />

        <label htmlFor="tags">{t("admin.bike.tags", "Tags")}</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="bike, offroad, carbon"
        />

        <label>{t("admin.bike.image", "Images")}</label>
        <ImageUploadWithPreview
          max={5}
          defaultImages={existingImages}
          onChange={handleImagesChange}
          folder="bike"
        />

        <label htmlFor="category">{t("admin.bike.category", "Category")}</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            {t("admin.bike.select_category", "Select category")}
          </option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name[currentLang]} ({cat.slug})
            </option>
          ))}
        </select>

        <ButtonGroup>
          <button type="submit">
            {editingItem
              ? t("admin.update", "Update")
              : t("admin.create", "Create")}
          </button>
          <button type="button" onClick={onClose}>
            {t("admin.cancel", "Cancel")}
          </button>
        </ButtonGroup>
      </form>
    </FormWrapper>
  );
}

// --- Styled Components ---

const FormWrapper = styled.div`
  max-width: 600px;
  margin: auto;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};

  h2 {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const ButtonGroup = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;

  button {
    padding: 0.5rem 1rem;
    font-weight: 500;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:first-child {
      background: ${({ theme }) => theme.colors.primary};
      color: #fff;
    }

    &:last-child {
      background: ${({ theme }) => theme.colors.danger};
      color: #fff;
    }

    &:hover {
      opacity: 0.9;
    }
  }
`;
