"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/apartment";
import { ApartmentCategory, IApartment } from "@/modules/apartment/types";
import { ImageUploadWithPreview } from "@/shared";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IApartment | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
  loading?: boolean;
}

type AddressState = {
  street?: string;
  number?: string;
  district?: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  fullText?: string;
};

type ContactState = {
  name: string;
  phone?: string;
  email?: string;
  role?: string;
  customerRef?: string;
  userRef?: string;
};

export default function FormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  loading = false,
}: Props) {
  const { i18n, t } = useI18nNamespace("apartment", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const categories = useAppSelector((s) => s.apartmentCategory.categories);
  const successMessage = useAppSelector((s) => s.apartment.successMessage);
  const error = useAppSelector((s) => s.apartment.error);

  // --- i18n fields ---
  const [titles, setTitles] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce(
      (acc, lng) => ({ ...acc, [lng]: "" }),
      {} as Record<SupportedLocale, string>
    )
  );
  const [contents, setContents] = useState<Record<SupportedLocale, string>>(() =>
    SUPPORTED_LOCALES.reduce(
      (acc, lng) => ({ ...acc, [lng]: "" }),
      {} as Record<SupportedLocale, string>
    )
  );

  // --- core fields ---
  const [category, setCategory] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // --- address/contact (backend: create -> zorunlu) ---
  const [address, setAddress] = useState<AddressState>({
    city: "",
    country: "",
    street: "",
    number: "",
    district: "",
    state: "",
    zip: "",
    fullText: "",
  });

  const [contact, setContact] = useState<ContactState>({ name: "" });

  // --- optional location (lng, lat) ---
  const [lng, setLng] = useState<string>("");
  const [lat, setLat] = useState<string>("");

  // --- images ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Prefill on edit / reset on open
  useEffect(() => {
    if (editingItem) {
      setTitles(
        SUPPORTED_LOCALES.reduce((acc, lng) => {
          acc[lng] = editingItem.title?.[lng] || "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setContents(
        SUPPORTED_LOCALES.reduce((acc, lng) => {
          acc[lng] = editingItem.content?.[lng] || "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setCategory(
        typeof editingItem.category === "string"
          ? editingItem.category
          : editingItem.category?._id || ""
      );
      // publish
      setIsPublished(Boolean(editingItem.isPublished));

      // address/contact
      setAddress({
        city: editingItem.address?.city || "",
        country: editingItem.address?.country || "",
        street: editingItem.address?.street || "",
        number: editingItem.address?.number || "",
        district: editingItem.address?.district || "",
        state: editingItem.address?.state || "",
        zip: editingItem.address?.zip || "",
        fullText: editingItem.address?.fullText || "",
      });
      setContact({
        name: (editingItem as any).contact?.name || "",
        phone: (editingItem as any).contact?.phone || "",
        email: (editingItem as any).contact?.email || "",
        role: (editingItem as any).contact?.role || "",
        customerRef: (editingItem as any).contact?.customerRef || "",
        userRef: (editingItem as any).contact?.userRef || "",
      });

      // location -> coordinates: [lng, lat]
      const coords = (editingItem as any).location?.coordinates;
      setLng(
        Array.isArray(coords) && typeof coords[0] === "number"
          ? String(coords[0])
          : ""
      );
      setLat(
        Array.isArray(coords) && typeof coords[1] === "number"
          ? String(coords[1])
          : ""
      );

      // images
      setExistingImages(editingItem.images?.map((img) => img.url) || []);
      setSelectedFiles([]);
      setRemovedImages([]);
    } else {
      // reset
      setTitles(
        SUPPORTED_LOCALES.reduce(
          (acc, lng) => ({ ...acc, [lng]: "" }),
          {} as Record<SupportedLocale, string>
        )
      );
      setContents(
        SUPPORTED_LOCALES.reduce(
          (acc, lng) => ({ ...acc, [lng]: "" }),
          {} as Record<SupportedLocale, string>
        )
      );
      setCategory("");
      setIsPublished(true);
      setAddress({
        city: "",
        country: "",
        street: "",
        number: "",
        district: "",
        state: "",
        zip: "",
        fullText: "",
      });
      setContact({ name: "" });
      setLng("");
      setLat("");
      setExistingImages([]);
      setSelectedFiles([]);
      setRemovedImages([]);
    }
  }, [editingItem, isOpen]);

  // Toast feedback
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      onClose();
    } else if (error) {
      toast.error(error);
    }
  }, [successMessage, error, onClose]);

  // Image handler (selected, removed, current)
  const handleImagesChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current);
    },
    []
  );

  // Basic client validation mirroring backend rules
  const validateBeforeSubmit = () => {
    if (!category) {
      toast.error(t("validation.requiredCategory", "Kategori zorunlu"));
      return false;
    }
    // Create'te en az 1 görsel zorunlu
    if (!editingItem && selectedFiles.length === 0) {
      toast.error(t("validation.requiredImages", "En az bir görsel yükleyin"));
      return false;
    }
    if (!address.city || !address.country) {
      toast.error(
        t("validation.addressRequired", "Şehir ve ülke zorunludur")
      );
      return false;
    }
    if (!contact.name || contact.name.trim().length < 2) {
      toast.error(
        t("validation.contactRequired", "Sorumlu kişi adı zorunludur")
      );
      return false;
    }
    // location opsiyonel; varsa sayısal olmalı
    if ((lng && isNaN(Number(lng))) || (lat && isNaN(Number(lat)))) {
      toast.error(t("validation.locationInvalid", "Konum geçersiz"));
      return false;
    }
    return true;
  };


  const isHex24 = (v?: string) => !!v && /^[a-f\d]{24}$/i.test(v);

const buildCleanContact = (c: ContactState) => {
  const out: Record<string, any> = {};
  if (c.name?.trim()) out.name = c.name.trim();
  if (c.phone?.trim()) out.phone = c.phone.trim();
  if (c.email?.trim()) out.email = c.email.trim();
  if (c.role?.trim()) out.role = c.role.trim();
  if (isHex24(c.customerRef)) out.customerRef = c.customerRef!;
  if (isHex24(c.userRef)) out.userRef = c.userRef!;
  return out;
};

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (loading) return;
  if (!validateBeforeSubmit()) return;

  const formData = new FormData();
  formData.append("title", JSON.stringify(titles));
  formData.append("content", JSON.stringify(contents));
  formData.append("category", category);

  formData.append("address", JSON.stringify(address));

  // 🔧 BOŞ/GEÇERSİZ REFERANSLARI GÖNDERME
  const cleanContact = buildCleanContact(contact);
  formData.append("contact", JSON.stringify(cleanContact));

  if (lng && lat) {
    const lngNum = Number(lng);
    const latNum = Number(lat);
    formData.append("location", JSON.stringify({ type: "Point", coordinates: [lngNum, latNum] }));
  }

  formData.append("isPublished", String(isPublished));

  for (const file of selectedFiles) formData.append("images", file);
  if (removedImages.length > 0)
    formData.append("removedImages", JSON.stringify(removedImages));

  await onSubmit(formData, editingItem?._id);
};

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {editingItem
          ? t("admin.apartment.edit", "Edit apartment")
          : t("admin.apartment.create", "Add apartment")}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* i18n fields */}
        {SUPPORTED_LOCALES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`title-${lng}`}>
              {t("admin.apartment.title", "Title")} ({lng.toUpperCase()})
            </label>
            <input
              id={`title-${lng}`}
              value={titles[lng]}
              onChange={(e) => setTitles({ ...titles, [lng]: e.target.value })}
            />

            <label htmlFor={`content-${lng}`}>
              {t("admin.apartment.content", "Content")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`content-${lng}`}
              value={contents[lng]}
              onChange={(e) =>
                setContents({ ...contents, [lng]: e.target.value })
              }
            />
          </div>
        ))}

        {/* Images */}
        <label>{t("admin.apartment.images", "Images")}</label>
        <ImageUploadWithPreview
          max={10}
          defaultImages={existingImages}
          onChange={handleImagesChange}
          folder="apartment"
        />

        {/* Category */}
        <label htmlFor="category">
          {t("admin.apartment.category", "Category")}
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            {t("admin.apartment.select_category", "Select a category")}
          </option>
          {categories.map((cat: ApartmentCategory) => (
            <option key={cat._id} value={cat._id}>
              {cat.name?.[lang] ||
                cat.name?.en ||
                Object.values(cat.name || {})[0] ||
                cat.slug}
            </option>
          ))}
        </select>

        {/* Address */}
        <Fieldset>
          <legend>{t("admin.apartment.address", "Address")}</legend>
          <Grid>
            <div>
              <label>{t("city", "City")} *</label>
              <input
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                required
              />
            </div>
            <div>
              <label>{t("country", "Country")} *</label>
              <input
                value={address.country}
                onChange={(e) =>
                  setAddress({ ...address, country: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>{t("street", "Street")}</label>
              <input
                value={address.street || ""}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
              />
            </div>
            <div>
              <label>{t("number", "Number")}</label>
              <input
                value={address.number || ""}
                onChange={(e) =>
                  setAddress({ ...address, number: e.target.value })
                }
              />
            </div>
            <div>
              <label>{t("district", "District")}</label>
              <input
                value={address.district || ""}
                onChange={(e) =>
                  setAddress({ ...address, district: e.target.value })
                }
              />
            </div>
            <div>
              <label>{t("state", "State")}</label>
              <input
                value={address.state || ""}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
              />
            </div>
            <div>
              <label>{t("zip", "Zip")}</label>
              <input
                value={address.zip || ""}
                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
              />
            </div>
            <div className="col-2">
              <label>{t("fullText", "Full address text")}</label>
              <input
                value={address.fullText || ""}
                onChange={(e) =>
                  setAddress({ ...address, fullText: e.target.value })
                }
                placeholder="Hansaring 12, 53111 Bonn, DE"
              />
            </div>
          </Grid>
        </Fieldset>

        {/* Contact */}
        <Fieldset>
          <legend>{t("admin.apartment.contact", "Contact (Responsible)")}</legend>
          <Grid>
            <div>
              <label>{t("name", "Name")} *</label>
              <input
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>{t("phone", "Phone")}</label>
              <input
                value={contact.phone || ""}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              />
            </div>
            <div>
              <label>{t("email", "Email")}</label>
              <input
                value={contact.email || ""}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
              />
            </div>
            <div>
              <label>{t("role", "Role")}</label>
              <input
                value={contact.role || ""}
                onChange={(e) => setContact({ ...contact, role: e.target.value })}
              />
            </div>
          </Grid>
        </Fieldset>

        {/* Location (optional) */}
        <Fieldset>
          <legend>{t("admin.apartment.location", "Location (optional)")}</legend>
          <Grid>
            <div>
              <label>Lng</label>
              <input value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
            <div>
              <label>Lat</label>
              <input value={lat} onChange={(e) => setLat(e.target.value)} />
            </div>
          </Grid>
        </Fieldset>

        {/* Publish */}
        <CheckboxRow>
          <input
            id="isPublished"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <label htmlFor="isPublished">
            {t("admin.apartment.isPublished", "Published")}
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

// --- Styled ---
const FormWrapper = styled.div`
  max-width: 900px;
  margin: auto;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.cardBackground || "#fff"};
  border: 1px solid ${({ theme }) => theme.colors.border || "#ccc"};
  border-radius: ${({ theme }) => theme.radii.md || "6px"};

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
    border: 1px solid ${({ theme }) => theme.colors.border || "#ccc"};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.inputBackground || "#fff"};
    color: ${({ theme }) => theme.colors.text || "#000"};
    font-size: 0.95rem;
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  .col-2 {
    grid-column: span 2;
  }
`;

const Fieldset = styled.fieldset`
  margin-top: 1.25rem;
  border: 1px dashed ${({ theme }) => theme.colors.border || "#ccc"};
  border-radius: 6px;
  padding: 1rem;

  legend {
    padding: 0 0.5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text || "#000"};
  }

  label {
    margin-top: 0.5rem;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  gap: 0.5rem;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }

  label {
    margin: 0;
    font-weight: 500;
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
      background: ${({ theme }) => theme.colors.primary || "#007bff"};
      color: #fff;
    }

    &:last-child {
      background: ${({ theme }) => theme.colors.danger || "#dc3545"};
      color: #fff;
    }

    &:hover {
      opacity: 0.9;
    }
  }
`;
