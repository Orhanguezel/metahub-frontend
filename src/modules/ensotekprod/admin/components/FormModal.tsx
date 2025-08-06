"use client";

import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import type { IEnsotekprod, EnsotekCategory } from "@/modules/ensotekprod/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/ensotekprod";
import ImageUploadWithPreview from "@/shared/ImageUploadWithPreview";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";

const LANGUAGES = SUPPORTED_LOCALES;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IEnsotekprod | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

export default function EnsotekprodFormModal({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: Props) {
  const { i18n, t } = useI18nNamespace("ensotekprod", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const emptyLabel = SUPPORTED_LOCALES.reduce(
    (acc, lng) => ({ ...acc, [lng]: "" }),
    {} as Record<SupportedLocale, string>
  );

  const categories = useAppSelector((state) => state.ensotekCategory.categories);
  const successMessage = useAppSelector((state) => state.ensotekprod.successMessage);
  const error = useAppSelector((state) => state.ensotekprod.error);

  // --- State: HER ZAMAN DEEP CLONE! ---
  const [name, setName] = useState<Record<SupportedLocale, string>>({ ...emptyLabel });
  const [description, setDescription] = useState<Record<SupportedLocale, string>>({ ...emptyLabel });
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState<string>("");

  // Teknik ve opsiyonel state
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState(""); // "," ile ayır (string[] olarak gidecek)
  const [weightKg, setWeightKg] = useState("");
  const [size, setSize] = useState("");
  const [powerW, setPowerW] = useState("");
  const [voltageV, setVoltageV] = useState("");
  const [flowRateM3H, setFlowRateM3H] = useState("");
  const [coolingCapacityKw, setCoolingCapacityKw] = useState("");
  const [isElectric, setIsElectric] = useState(false);
  const [batteryRangeKm, setBatteryRangeKm] = useState("");
  const [motorPowerW, setMotorPowerW] = useState("");
  const [stockThreshold, setStockThreshold] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Görsel
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Her zaman referansları sıfırla!
  useEffect(() => {
    if (editingItem) {
      setName({ ...emptyLabel, ...editingItem.name });
      setDescription({ ...emptyLabel, ...editingItem.description });
      setBrand(editingItem.brand || "");
      setTags(Array.isArray(editingItem.tags) ? editingItem.tags.join(", ") : "");
      setPrice(editingItem.price?.toString() ?? "");
      setStock(editingItem.stock?.toString() ?? "");
      setCategory(
        typeof editingItem.category === "string"
          ? editingItem.category
          : editingItem.category?._id || ""
      );
      setMaterial(editingItem.material ?? "");
      setColor(Array.isArray(editingItem.color) ? editingItem.color.join(", ") : "");
      setWeightKg(editingItem.weightKg?.toString() ?? "");
      setSize(editingItem.size ?? "");
      setPowerW(editingItem.powerW?.toString() ?? "");
      setVoltageV(editingItem.voltageV?.toString() ?? "");
      setFlowRateM3H(editingItem.flowRateM3H?.toString() ?? "");
      setCoolingCapacityKw(editingItem.coolingCapacityKw?.toString() ?? "");
      setIsElectric(Boolean(editingItem.isElectric));
      setBatteryRangeKm(editingItem.batteryRangeKm?.toString() ?? "");
      setMotorPowerW(editingItem.motorPowerW?.toString() ?? "");
      setStockThreshold(editingItem.stockThreshold?.toString() ?? "");
      setIsActive(editingItem.isActive ?? true);
      setExistingImages(editingItem.images?.map((img) => img.url) || []);
      setSelectedFiles([]);
      setRemovedImages([]);
    } else {
      setName({ ...emptyLabel });
      setDescription({ ...emptyLabel });
      setBrand("");
      setTags("");
      setPrice("");
      setStock("");
      setCategory("");
      setMaterial("");
      setColor("");
      setWeightKg("");
      setSize("");
      setPowerW("");
      setVoltageV("");
      setFlowRateM3H("");
      setCoolingCapacityKw("");
      setIsElectric(false);
      setBatteryRangeKm("");
      setMotorPowerW("");
      setStockThreshold("");
      setIsActive(true);
      setExistingImages([]);
      setSelectedFiles([]);
      setRemovedImages([]);
    }
    // eslint-disable-next-line
  }, [editingItem, isOpen]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      onClose();
    } else if (error) {
      toast.error(error);
    }
  }, [successMessage, error, onClose]);

  const handleImagesChange = useCallback(
    (files: File[], removed: string[], current: string[]) => {
      setSelectedFiles(files);
      setRemovedImages(removed);
      setExistingImages(current);
    },
    []
  );

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Çoklu dil auto-fill
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
    formData.append("price", price || "0");
    formData.append("stock", stock || "0");
    formData.append("category", category);
    formData.append("isElectric", String(isElectric));
    formData.append("isActive", String(isActive));
    if (stockThreshold) formData.append("stockThreshold", stockThreshold);

    formData.append(
      "tags",
      JSON.stringify(
        (typeof tags === "string" ? tags : "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      )
    );
    formData.append(
      "color",
      JSON.stringify(
        (typeof color === "string" ? color : "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      )
    );
    // --- TEKNİK ALANLARDA BOŞ OLANLARI DA GÖNDER! ---
formData.append("material", material ?? "");
formData.append("weightKg", weightKg ?? "");
formData.append("size", size ?? "");
formData.append("powerW", powerW ?? "");
formData.append("voltageV", voltageV ?? "");
formData.append("flowRateM3H", flowRateM3H ?? "");
formData.append("coolingCapacityKw", coolingCapacityKw ?? "");
formData.append("batteryRangeKm", batteryRangeKm ?? "");
formData.append("motorPowerW", motorPowerW ?? "");


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
          ? t("admin.ensotekprod.edit", "Edit Ensotekprod")
          : t("admin.ensotekprod.create", "Add New Ensotekprod")}
      </h2>
      <form onSubmit={handleSubmit}>

        {/* Çoklu dil alanları */}
        {LANGUAGES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`name-${lng}`}>
              {t("admin.ensotekprod.name", "Ensotekprod Name")} ({lng.toUpperCase()})
            </label>
            <input
              id={`name-${lng}`}
              type="text"
              value={name[lng] || ""}
              onChange={(e) => setName(prev => ({ ...prev, [lng]: e.target.value }))}
              required={lng === lang}
              autoComplete="off"
            />

            <label htmlFor={`desc-${lng}`}>
              {t("admin.ensotekprod.description", "Description")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`desc-${lng}`}
              value={description[lng] || ""}
              onChange={(e) => setDescription(prev => ({ ...prev, [lng]: e.target.value }))}
              required={lng === lang}
              autoComplete="off"
            />
          </div>
        ))}

        <label htmlFor="brand">{t("admin.ensotekprod.brand", "Brand")}</label>
        <input
          id="brand"
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          required
          autoComplete="off"
        />

        <label htmlFor="price">{t("admin.ensotekprod.price", "Price")}</label>
        <input
          id="price"
          type="number"
          min={0}
          step={0.01}
          value={price || ""}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <label htmlFor="stock">{t("admin.ensotekprod.stock", "Stock")}</label>
        <input
          id="stock"
          type="number"
          min={0}
          value={stock || ""}
          onChange={(e) => setStock(e.target.value)}
          required
        />

        <label htmlFor="tags">{t("admin.ensotekprod.tags", "Tags")}</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="kule, fan, motor"
          autoComplete="off"
        />

        <label htmlFor="category">{t("admin.ensotekprod.category", "Category")}</label>
        <select
          id="category"
          value={category || ""}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            {t("admin.ensotekprod.select_category", "Select category")}
          </option>
          {categories.map((cat: EnsotekCategory) => (
            <option key={cat._id} value={cat._id}>
              {cat.name[lang]} ({cat.slug})
            </option>
          ))}
        </select>

        {/* Görseller */}
        <label>{t("admin.ensotekprod.image", "Images")}</label>
        <ImageUploadWithPreview
          max={5}
          defaultImages={existingImages}
          onChange={handleImagesChange}
          folder="ensotekprod"
        />

        {/* Zorunlu boolean alanlar */}
        <label>
          <input
            type="checkbox"
            checked={isElectric}
            onChange={() => setIsElectric((prev) => !prev)}
          />{" "}
          {t("admin.ensotekprod.isElectric", "Electric?")}
        </label>

        <label>
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => setIsActive((prev) => !prev)}
          />{" "}
          {t("admin.ensotekprod.isActive", "Active?")}
        </label>

        {/* Opsiyonel Teknik Özellikler */}
        <fieldset style={{ marginTop: "1.3rem", border: "1px solid #eee", borderRadius: 6, padding: 12 }}>
          <legend>{t("admin.ensotekprod.advanced", "Advanced (Optional)")}</legend>

          <label htmlFor="material">{t("admin.ensotekprod.material", "Material")}</label>
          <input id="material" type="text" value={material} onChange={(e) => setMaterial(e.target.value)} autoComplete="off" />

          <label htmlFor="color">{t("admin.ensotekprod.color", "Color (comma separated)")}</label>
          <input id="color" type="text" value={color} onChange={(e) => setColor(e.target.value)} autoComplete="off" />

          <label htmlFor="weightKg">{t("admin.ensotekprod.weightKg", "Weight (kg)")}</label>
          <input id="weightKg" type="number" min={0} step={0.01} value={weightKg || ""} onChange={(e) => setWeightKg(e.target.value)} />

          <label htmlFor="size">{t("admin.ensotekprod.size", "Size/Dimensions")}</label>
          <input id="size" type="text" value={size} onChange={(e) => setSize(e.target.value)} autoComplete="off" />

          <label htmlFor="powerW">{t("admin.ensotekprod.powerW", "Power (W)")}</label>
          <input id="powerW" type="number" min={0} value={powerW || ""} onChange={(e) => setPowerW(e.target.value)} />

          <label htmlFor="voltageV">{t("admin.ensotekprod.voltageV", "Voltage (V)")}</label>
          <input id="voltageV" type="number" min={0} value={voltageV || ""} onChange={(e) => setVoltageV(e.target.value)} />

          <label htmlFor="flowRateM3H">{t("admin.ensotekprod.flowRateM3H", "Flow Rate (m³/h)")}</label>
          <input id="flowRateM3H" type="number" min={0} value={flowRateM3H || ""} onChange={(e) => setFlowRateM3H(e.target.value)} />

          <label htmlFor="coolingCapacityKw">{t("admin.ensotekprod.coolingCapacityKw", "Cooling Capacity (kW)")}</label>
          <input id="coolingCapacityKw" type="number" min={0} value={coolingCapacityKw || ""} onChange={(e) => setCoolingCapacityKw(e.target.value)} />

          <label htmlFor="batteryRangeKm">{t("admin.ensotekprod.batteryRangeKm", "Battery Range (km)")}</label>
          <input id="batteryRangeKm" type="number" min={0} value={batteryRangeKm || ""} onChange={(e) => setBatteryRangeKm(e.target.value)} />

          <label htmlFor="motorPowerW">{t("admin.ensotekprod.motorPowerW", "Motor Power (W)")}</label>
          <input id="motorPowerW" type="number" min={0} value={motorPowerW || ""} onChange={(e) => setMotorPowerW(e.target.value)} />

          <label htmlFor="stockThreshold">{t("admin.ensotekprod.stockThreshold", "Stock Threshold")}</label>
          <input id="stockThreshold" type="number" min={0} value={stockThreshold || ""} onChange={(e) => setStockThreshold(e.target.value)} />
        </fieldset>

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
  h2 { margin-bottom: 1rem; }
  label { display: block; margin-top: 1rem; margin-bottom: 0.25rem; font-weight: 600; }
  input, textarea, select {
    width: 100%; padding: 0.5rem; border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px; background-color: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text}; font-size: 0.95rem;
  }
  textarea { min-height: 100px; resize: vertical; }
`;
const ButtonGroup = styled.div`
  margin-top: 1.5rem; display: flex; gap: 1rem;
  button {
    padding: 0.5rem 1rem; font-weight: 500; border: none; border-radius: 4px; cursor: pointer;
    &:first-child { background: ${({ theme }) => theme.colors.primary}; color: #fff; }
    &:last-child { background: ${({ theme }) => theme.colors.danger}; color: #fff; }
    &:hover { opacity: 0.9; }
  }
`;
