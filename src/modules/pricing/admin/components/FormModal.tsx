"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/pricing/locales";
import type { IPricing } from "@/modules/pricing/types";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData: IPricing | null;
  onSubmit: (payload: Partial<IPricing>, id?: string) => Promise<void>;
}

export default function FormModal({ isOpen, onClose, initialData, onSubmit }: Props) {
  const { t } = useI18nNamespace("pricing", translations);

  const successMessage = useAppSelector((s) => s.pricing.successMessage);
  const error = useAppSelector((s) => s.pricing.error);

  // Çok dilli alanlar
  const [titles, setTitles] = useState<Record<SupportedLocale, string>>(
    () => SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>)
  );
  const [descriptions, setDescriptions] = useState<Record<SupportedLocale, string>>(
    () => SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>)
  );
  const [features, setFeatures] = useState<Record<SupportedLocale, string[]>>(
    () => SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: [] }), {} as Record<SupportedLocale, string[]>)
  );

  // Diğer alanlar
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "TRY">("EUR");
  const [period, setPeriod] = useState<"monthly" | "yearly" | "once">("monthly");
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPublished, setIsPublished] = useState<boolean>(false);

  // Edit doldurma
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setTitles(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: initialData.title?.[lng] || "" }), {} as any));
      setDescriptions(
        SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: initialData.description?.[lng] || "" }), {} as any)
      );
      setFeatures(
        SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: initialData.features?.[lng] || [] }), {} as any)
      );
      setCategory(initialData.category || "");
      setPrice(initialData.price != null ? String(initialData.price) : "");
      setCurrency(initialData.currency);
      setPeriod(initialData.period);
      setIsPopular(Boolean(initialData.isPopular));
      setOrder(initialData.order || 0);
      setIsActive(Boolean(initialData.isActive));
      setIsPublished(Boolean(initialData.isPublished));
    } else {
      setTitles(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as any));
      setDescriptions(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as any));
      setFeatures(SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: [] }), {} as any));
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

  // Toast
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      onClose();
    } else if (error) {
      toast.error(error);
    }
  }, [successMessage, error, onClose]);

  // Özellikler (features) handler’ları
  const handleFeatureChange = (lng: SupportedLocale, idx: number, value: string) => {
    setFeatures((prev) => ({ ...prev, [lng]: prev[lng].map((f, i) => (i === idx ? value : f)) }));
  };
  const handleAddFeature = (lng: SupportedLocale) => setFeatures((prev) => ({ ...prev, [lng]: [...prev[lng], ""] }));
  const handleRemoveFeature = (lng: SupportedLocale, idx: number) =>
    setFeatures((prev) => ({ ...prev, [lng]: prev[lng].filter((_, i) => i !== idx) }));

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<IPricing> = {
      title: titles,
      description: descriptions,
      features,
      category: category.trim() || undefined,
      price: price.trim() !== "" ? Number(price) : undefined,
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
    <Form onSubmit={handleSubmit}>
      <h2>{initialData ? t("admin.pricing.edit", "Edit Pricing") : t("admin.pricing.create", "Create New Pricing")}</h2>

      {/* Üst satır — temel alanlar */}
      <Row>
        <Col>
          <Label>{t("admin.pricing.category", "Category")}</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t("admin.pricing.category_placeholder", "Type a category (optional)")}
          />
        </Col>
        <Col>
          <Label>{t("admin.pricing.price", "Price")}</Label>
          <Input
            id="price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Col>
        <Col>
          <Label>{t("admin.pricing.currency", "Currency")}</Label>
          <Select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as any)}>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="TRY">TRY (₺)</option>
          </Select>
        </Col>
        <Col>
          <Label>{t("admin.pricing.period", "Period")}</Label>
          <Select id="period" value={period} onChange={(e) => setPeriod(e.target.value as any)}>
            <option value="monthly">{t("admin.pricing.monthly", "Monthly")}</option>
            <option value="yearly">{t("admin.pricing.yearly", "Yearly")}</option>
            <option value="once">{t("admin.pricing.once", "One-Time")}</option>
          </Select>
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("admin.pricing.order", "Order")}</Label>
          <Input id="order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value) || 0)} />
        </Col>
        <Col>
          <Label>{t("admin.pricing.isPopular", "Popular")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} />
            <span>{isPopular ? t("yes", "Yes") : t("no", "No")}</span>
          </CheckRow>
        </Col>
        <Col>
          <Label>{t("admin.pricing.isActive", "Active")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>{isActive ? t("yes", "Yes") : t("no", "No")}</span>
          </CheckRow>
        </Col>
        <Col>
          <Label>{t("admin.pricing.isPublished", "Published")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            <span>{isPublished ? t("yes", "Yes") : t("no", "No")}</span>
          </CheckRow>
        </Col>
      </Row>

      {/* Çok dilli alanlar */}
      {SUPPORTED_LOCALES.map((lng) => (
        <Row key={lng}>
          <Col style={{ gridColumn: "span 2" }}>
            <Label>
              {t("admin.pricing.title", "Title")} ({lng.toUpperCase()})
            </Label>
            <Input
              id={`title-${lng}`}
              value={titles[lng]}
              onChange={(e) => setTitles({ ...titles, [lng]: e.target.value })}
              required={lng === "tr"}
            />
          </Col>
          <Col style={{ gridColumn: "span 2" }}>
            <Label>
              {t("admin.pricing.description", "Description")} ({lng.toUpperCase()})
            </Label>
            <TextArea
              id={`desc-${lng}`}
              rows={2}
              value={descriptions[lng]}
              onChange={(e) => setDescriptions({ ...descriptions, [lng]: e.target.value })}
            />
          </Col>
          <Col style={{ gridColumn: "span 4" }}>
            <Label>
              {t("admin.pricing.features", "Features")} ({lng.toUpperCase()})
            </Label>
            <Features>
              {features[lng].map((feature, idx) => (
                <FeatureRow key={`${lng}-${idx}`}>
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(lng, idx, e.target.value)}
                    placeholder={t("admin.pricing.feature_placeholder", `Feature in ${lng.toUpperCase()}`)}
                  />
                  <Danger type="button" onClick={() => handleRemoveFeature(lng, idx)}>&times;</Danger>
                </FeatureRow>
              ))}
              <Small type="button" onClick={() => handleAddFeature(lng)}>
                + {t("admin.pricing.add_feature", "Add Feature")}
              </Small>
            </Features>
          </Col>
        </Row>
      ))}

      <Actions>
        <Secondary type="button" onClick={onClose}>{t("admin.cancel", "Cancel")}</Secondary>
        <Primary type="submit">{initialData ? t("admin.update", "Update") : t("admin.create", "Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled (About/Services form paternine uyumlu) ---- */
const Form = styled.form`
  display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.md};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;

const Row = styled.div`
  display:grid; grid-template-columns:repeat(4,1fr); gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{ grid-template-columns:repeat(2,1fr); }
  ${({theme})=>theme.media.mobile}{ grid-template-columns:1fr; }
`;
const Col = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.xs}; min-width:0;`;

const Label = styled.label`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
`;

const Input = styled.input`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  min-width:0;
`;
const TextArea = styled.textarea`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
  resize:vertical;
`;
const Select = styled.select`
  padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;

const CheckRow = styled.label`display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center;`;

const Features = styled.div`display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.xs};`;
const FeatureRow = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center;`;

const Small = styled.button`
  align-self:flex-start;
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;

const Actions = styled.div`display:flex; gap:${({theme})=>theme.spacings.sm}; justify-content:flex-end;`;
const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const Danger = styled.button`
  padding:6px 10px; border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.colors.dangerBg};
  color:${({theme})=>theme.colors.danger};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.danger};
  cursor:pointer;
`;
