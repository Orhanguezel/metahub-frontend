"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/pricing/locales";
import { IPricing } from "@/modules/pricing/types";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData: IPricing | null;
  onSubmit: (payload: Partial<IPricing>, id?: string) => Promise<void>;
}

export default function FormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: Props) {
  const { t } = useI18nNamespace("pricing", translations);

  const successMessage = useAppSelector((state) => state.pricing.successMessage);
  const error = useAppSelector((state) => state.pricing.error);

  // --- Çoklu Dil Title & Description & Features
  const [titles, setTitles] = useState<Record<SupportedLocale, string>>(
    SUPPORTED_LOCALES.reduce((acc, lng) => {
      acc[lng] = "";
      return acc;
    }, {} as Record<SupportedLocale, string>)
  );
  const [descriptions, setDescriptions] = useState<Record<SupportedLocale, string>>(
    SUPPORTED_LOCALES.reduce((acc, lng) => {
      acc[lng] = "";
      return acc;
    }, {} as Record<SupportedLocale, string>)
  );
  // 🌟 Features çoklu dil array
  const [features, setFeatures] = useState<Record<SupportedLocale, string[]>>(
    SUPPORTED_LOCALES.reduce((acc, lng) => {
      acc[lng] = [];
      return acc;
    }, {} as Record<SupportedLocale, string[]>)
  );

  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "TRY">("EUR");
  const [period, setPeriod] = useState<"monthly" | "yearly" | "once">("monthly");
  const [isPopular, setIsPopular] = useState(false);
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [isPublished, setIsPublished] = useState(false);

  // --- EDIT Fill
  useEffect(() => {
    if (initialData) {
      setTitles(
        SUPPORTED_LOCALES.reduce((acc, lng) => {
          acc[lng] = initialData.title?.[lng] || "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setDescriptions(
        SUPPORTED_LOCALES.reduce((acc, lng) => {
          acc[lng] = initialData.description?.[lng] || "";
          return acc;
        }, {} as Record<SupportedLocale, string>)
      );
      setFeatures(
        SUPPORTED_LOCALES.reduce((acc, lng) => {
          acc[lng] = initialData.features?.[lng] || [];
          return acc;
        }, {} as Record<SupportedLocale, string[]>)
      );
      setCategory(initialData.category || "");
      setPrice(initialData.price?.toString() ?? "");
      setCurrency(initialData.currency);
      setPeriod(initialData.period);
      setIsPopular(!!initialData.isPopular);
      setOrder(initialData.order || 0);
      setIsActive(initialData.isActive);
      setIsPublished(initialData.isPublished);
    } else {
      // Sıfırla
      setTitles(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>));
      setDescriptions(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>));
      setFeatures(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: [] }), {} as Record<SupportedLocale, string[]>));
      setCategory("");
      setPrice("");
      setCurrency("EUR");
      setPeriod("monthly");
      setIsPopular(false);
      setOrder(0);
      setIsActive(true);
      setIsPublished(false);
    }
  }, [initialData, isOpen]);

  // --- TOAST Mesajları
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      onClose();
    } else if (error) {
      toast.error(error);
    }
  }, [successMessage, error, onClose]);

  // 🌟 Features input handler
  const handleFeatureChange = (lng: SupportedLocale, idx: number, value: string) => {
    setFeatures((prev) => ({
      ...prev,
      [lng]: prev[lng].map((f, i) => (i === idx ? value : f)),
    }));
  };

  const handleAddFeature = (lng: SupportedLocale) => {
    setFeatures((prev) => ({
      ...prev,
      [lng]: [...prev[lng], ""],
    }));
  };

  const handleRemoveFeature = (lng: SupportedLocale, idx: number) => {
    setFeatures((prev) => ({
      ...prev,
      [lng]: prev[lng].filter((_, i) => i !== idx),
    }));
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<IPricing> = {
      title: titles,
      description: descriptions,
      features,
      category: category.trim() || undefined,
      price: Number(price),
      currency,
      period,
      isPopular,
      order,
      isActive,
      isPublished,
    };
    await onSubmit(payload, initialData?._id);
  };

  if (!isOpen) return null;

  return (
    <FormWrapper>
      <h2>
        {initialData
          ? t("admin.pricing.edit", "Edit Pricing")
          : t("admin.pricing.create", "Create New Pricing")}
      </h2>
      <form onSubmit={handleSubmit}>
        {SUPPORTED_LOCALES.map((lng) => (
          <div key={lng}>
            <label htmlFor={`title-${lng}`}>
              {t("admin.pricing.title", "Title")} ({lng.toUpperCase()})
            </label>
            <input
              id={`title-${lng}`}
              value={titles[lng]}
              onChange={(e) => setTitles({ ...titles, [lng]: e.target.value })}
              placeholder={t("admin.pricing.title_placeholder", `Title in ${lng.toUpperCase()}`)}
              required={lng === "tr"} // En az bir dil zorunlu.
            />
            <label htmlFor={`desc-${lng}`}>
              {t("admin.pricing.description", "Description")} ({lng.toUpperCase()})
            </label>
            <textarea
              id={`desc-${lng}`}
              value={descriptions[lng]}
              onChange={(e) =>
                setDescriptions({ ...descriptions, [lng]: e.target.value })
              }
              placeholder={t("admin.pricing.description_placeholder", `Description in ${lng.toUpperCase()}`)}
            />

            {/* --- Çoklu Özellikler Alanı --- */}
            <label>
              {t("admin.pricing.features", "Features")} ({lng.toUpperCase()})
            </label>
            <FeatureList>
              {features[lng].map((feature, idx) => (
                <FeatureRow key={idx}>
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(lng, idx, e.target.value)}
                    placeholder={t("admin.pricing.feature_placeholder", `Feature in ${lng.toUpperCase()}`)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(lng, idx)}
                    title={t("admin.pricing.remove_feature", "Remove")}
                  >
                    &times;
                  </button>
                </FeatureRow>
              ))}
              <AddFeatureButton
                type="button"
                onClick={() => handleAddFeature(lng)}
              >
                {t("admin.pricing.add_feature", "Add Feature")}
              </AddFeatureButton>
            </FeatureList>
          </div>
        ))}

        {/* --- Kalan alanlar --- */}
        <label htmlFor="category">{t("admin.pricing.category", "Category")}</label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={t("admin.pricing.category_placeholder", "Type a category (optional)")}
        />

        <label htmlFor="price">{t("admin.pricing.price", "Price")}</label>
        <input
          id="price"
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <label htmlFor="currency">{t("admin.pricing.currency", "Currency")}</label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as any)}
          required
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="TRY">TRY (₺)</option>
        </select>

        <label htmlFor="period">{t("admin.pricing.period", "Period")}</label>
        <select
          id="period"
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          required
        >
          <option value="monthly">{t("admin.pricing.monthly", "Monthly")}</option>
          <option value="yearly">{t("admin.pricing.yearly", "Yearly")}</option>
          <option value="once">{t("admin.pricing.once", "One-Time")}</option>
        </select>

        <div style={{ display: "flex", gap: 16, margin: "10px 0" }}>
          <label>
            <input
              type="checkbox"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
            />
            {t("admin.pricing.isPopular", "Popular")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            {t("admin.pricing.isActive", "Active")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            {t("admin.pricing.isPublished", "Published")}
          </label>
        </div>

        <label htmlFor="order">{t("admin.pricing.order", "Order")}</label>
        <input
          id="order"
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
        />

        <ButtonGroup>
          <button type="submit">
            {initialData
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

// Features için:
const FeatureList = styled.div`
  margin-bottom: 0.5rem;
`;
const FeatureRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  input {
    flex: 1;
  }
  button {
    background: ${({ theme }) => theme.colors.danger || "#dc3545"};
    color: #fff;
    border: none;
    border-radius: 3px;
    width: 2rem;
    font-size: 1.2rem;
    cursor: pointer;
    height: 2rem;
    padding: 0;
  }
`;
const AddFeatureButton = styled.button`
  margin-top: 4px;
  background: ${({ theme }) => theme.colors.success || "#28a745"};
  color: #fff;
  border: none;
  border-radius: 3px;
  font-size: 0.95rem;
  padding: 0.25rem 0.7rem;
  cursor: pointer;
`;

