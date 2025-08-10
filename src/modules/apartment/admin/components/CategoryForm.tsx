"use client";

import styled from "styled-components";
import { useState, useEffect, useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/apartment";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import type { ApartmentCategory } from "@/modules/apartment/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: ApartmentCategory | null;
  onSubmit: (
    data: {
      name: Record<SupportedLocale, string>;
      slug?: string;
      city?: string;
      district?: string;
      zip?: string;
      isActive?: boolean;
    },
    id?: string
  ) => Promise<void>;
  loading?: boolean;
}

export default function ApartmentCategoryForm({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  loading = false,
}: Props) {
  const { i18n, t } = useI18nNamespace("apartment", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // Boş i18n obje
  const emptyLabel = useMemo(
    () =>
      SUPPORTED_LOCALES.reduce(
        (acc, lng) => ({ ...acc, [lng]: "" }),
        {} as Record<SupportedLocale, string>
      ),
    []
  );

  // Form state
  const [name, setName] = useState<Record<SupportedLocale, string>>(emptyLabel);
  const [slug, setSlug] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [zip, setZip] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Edit doldurma
  useEffect(() => {
    if (editingItem) {
      setName({ ...emptyLabel, ...editingItem.name });
      setSlug(editingItem.slug || "");
      setCity(editingItem.city || "");
      setDistrict(editingItem.district || "");
      setZip(editingItem.zip || "");
      setIsActive(!!editingItem.isActive);
    } else {
      setName(emptyLabel);
      setSlug("");
      setCity("");
      setDistrict("");
      setZip("");
      setIsActive(true);
    }
  }, [editingItem, isOpen, emptyLabel]);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // En az bir dil zorunlu (tercihen aktif dil)
    const mainName = name[lang] || Object.values(name).find((v) => v?.trim()) || "";
    if (!mainName.trim()) {
      alert(t("admin.apartmentcategory.name_required", "Category name required"));
      return;
    }

    // Eksik dillere ana ismi doldur
    const filledName = { ...name };
    SUPPORTED_LOCALES.forEach((lng) => {
      if (!filledName[lng]) filledName[lng] = mainName;
    });

    const payload = {
      name: filledName,
      slug: slug.trim() || undefined, // boşsa backend name'den üretecek
      city: city.trim() || undefined,
      district: district.trim() || undefined,
      zip: zip.trim() || undefined,
      isActive,
    };

    await onSubmit(payload, editingItem?._id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.apartmentcategory.edit", "Edit Apartment Category")
          : t("admin.apartmentcategory.create", "Add New Apartment Category")}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* i18n isim alanları */}
        {SUPPORTED_LOCALES.map((lng) => (
          <div key={lng}>
            <label>
              {t("admin.apartmentcategory.name", "Category Name")} ({lng.toUpperCase()})
            </label>
            <input
              type="text"
              value={name[lng]}
              onChange={(e) => setName({ ...name, [lng]: e.target.value })}
              required={lng === lang}
              placeholder={t("admin.apartmentcategory.name_placeholder", "Enter name")}
              autoFocus={lng === lang}
            />
          </div>
        ))}

        {/* slug (opsiyonel) */}
        <label>
          {t("admin.apartmentcategory.slug", "Slug")}{" "}
          <small style={{ fontWeight: 400 }}>
            ({t("admin.optional", "optional")} — {t("admin.apartmentcategory.slug_hint", "leave empty to auto-generate")})
          </small>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="bursa-gemlik-cumhuriyet-mahallesi"
        />

        {/* adres alanları (opsiyonel filtre amaçlı) */}
        <Row>
          <div>
            <label>{t("city", "City")}</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Bursa"
            />
          </div>
          <div>
            <label>{t("district", "District")}</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Gemlik"
            />
          </div>
          <div>
            <label>{t("zip", "ZIP")}</label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="16600"
            />
          </div>
        </Row>

        {/* aktiflik */}
        <CheckboxRow>
          <label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            {t("admin.active", "Active")}
          </label>
        </CheckboxRow>

        <ButtonGroup>
          <button type="submit">
            {editingItem ? t("admin.update", "Update") : t("admin.create", "Create")}
          </button>
          <button type="button" onClick={onClose}>
            {t("admin.cancel", "Cancel")}
          </button>
        </ButtonGroup>
      </form>
    </FormWrapper>
  );
}

/* --- styles --- */

const FormWrapper = styled.div`
  max-width: 640px;
  margin: auto;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};

  h2 { margin-bottom: 1rem; }

  label {
    display: block;
    margin-top: 1rem;
    font-weight: 600;
  }

  input, textarea {
    width: 100%;
    margin-top: 0.25rem;
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: .8rem;

  > div {
    display: flex;
    flex-direction: column;
  }
`;

const CheckboxRow = styled.div`
  margin-top: 1rem;
  label {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    font-weight: 500;
  }
  input[type="checkbox"] {
    width: 1.05em;
    height: 1.05em;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
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
    &:hover { opacity: 0.9; }
  }
`;
