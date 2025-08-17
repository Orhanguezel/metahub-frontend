// CouponForm.tsx (sadece mantık kısmı değişti)
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/coupon";
import { SUPPORTED_LOCALES } from "@/types/common";
import type { Coupon, TranslatedField } from "@/modules/coupon/types";
import { Button, JSONEditor } from "@/shared";

type CouponBody = Omit<Coupon, "tenant" | "_id" | "createdAt" | "updatedAt">;
type Mode = "form" | "json";

export default function CouponForm({
  editing,
  loading,
  onSubmit,
  onCancel,
}: {
  editing?: Coupon | null;
  loading?: boolean;
  onSubmit: (data: CouponBody) => void;
  onCancel?: () => void;
}) {
  const { t } = useI18nNamespace("coupon", translations);
  const [mode, setMode] = useState<Mode>("form");

  const toDateInput = (val: unknown): string => {
    if (!val) return "";
    const d =
      val instanceof Date ? val : typeof val === "string" ? new Date(val) : new Date(String(val));
    return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  };
  const expiresAtValue = useMemo(() => toDateInput(editing?.expiresAt), [editing?.expiresAt]);

  // ✅ Nested defaultValues (title/description objeleri)
  const defaultValues = useMemo(
    () => ({
      code: editing?.code || "",
      discount: editing?.discount ?? "",
      expiresAt: expiresAtValue,
      isPublished: editing?.isPublished ?? false,
      isActive: editing?.isActive ?? true,
      title: Object.fromEntries(
        SUPPORTED_LOCALES.map((lng) => [lng, editing?.title?.[lng] || ""])
      ) as Record<string, string>,
      description: Object.fromEntries(
        SUPPORTED_LOCALES.map((lng) => [lng, editing?.description?.[lng] || ""])
      ) as Record<string, string>,
    }),
    [editing, expiresAtValue]
  );

  const { register, handleSubmit, reset, formState } = useForm<{ 
    code: string; discount: any; expiresAt: string; isPublished: boolean; isActive: boolean;
    title: Record<string, string>; description: Record<string, string>;
  }>({ defaultValues });

  // JSON mode default’u
  const buildJsonFromEditing = useCallback(
    () => ({
      code: editing?.code || "",
      discount: editing?.discount ?? 0,
      expiresAt: expiresAtValue,
      isPublished: editing?.isPublished ?? false,
      isActive: editing?.isActive ?? true,
      title: Object.fromEntries(
        SUPPORTED_LOCALES.map((lng) => [lng, editing?.title?.[lng] || ""])
      ),
      description: Object.fromEntries(
        SUPPORTED_LOCALES.map((lng) => [lng, editing?.description?.[lng] || ""])
      ),
    }),
    [editing, expiresAtValue]
  );

  const [jsonValue, setJsonValue] = useState<any>(buildJsonFromEditing());
  useEffect(() => {
    reset(defaultValues);
    setJsonValue(buildJsonFromEditing());
  }, [defaultValues, reset, buildJsonFromEditing]);

  const validateAndNormalize = (data: any): CouponBody | null => {
    const discountNum = Number(data.discount);
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    // ⚠️ data.title / data.description zaten obje
    const titleSrc = data.title ?? {};
    const descSrc = data.description ?? {};

    const title: TranslatedField = {};
    const description: TranslatedField = {};
    SUPPORTED_LOCALES.forEach((lng) => {
      title[lng] = String(titleSrc[lng] ?? "").trim();
      description[lng] = String(descSrc[lng] ?? "").trim();
    });

    const missing: string[] = [];
    if (!data.code) missing.push("code");
    if (!discountNum) missing.push("discount");
    if (!expiresAt) missing.push("expiresAt");
    SUPPORTED_LOCALES.forEach((lng) => {
      if (!title[lng]) missing.push(`title.${lng}`);
      if (!description[lng]) missing.push(`description.${lng}`);
    });
    if (missing.length) {
      alert(t("form.required_fields", "Please fill in all required fields:") + " " + missing.join(", "));
      return null;
    }

    return {
      code: String(data.code).trim(),
      title,
      description,
      discount: discountNum,
      expiresAt: expiresAt as Date,
      isPublished: Boolean(data.isPublished),
      isActive: Boolean(data.isActive),
    };
  };

  // ✅ RHF dot paths: formData.title?.[lng] ile oku
  const submitHandler = (formData: any) => {
    const compact = {
      ...formData,
      // dot path fallback'ı da bırakıyoruz (çok nadir durumlar için)
      title: Object.fromEntries(
        SUPPORTED_LOCALES.map((lng) => [
          lng,
          (formData?.title?.[lng] ??
            formData?.[`title.${lng}`] ??
            "").toString().trim(),
        ])
      ),
      description: Object.fromEntries(
        SUPPORTED_LOCALES.map((lng) => [
          lng,
          (formData?.description?.[lng] ??
            formData?.[`description.${lng}`] ??
            "").toString().trim(),
        ])
      ),
    };

    const normalized = validateAndNormalize(compact);
    if (!normalized) return;
    onSubmit(normalized);
    reset();
  };

  const submitJson = () => {
    const normalized = validateAndNormalize(jsonValue);
    if (!normalized) return;
    onSubmit(normalized);
  };

/* styled kısımlarınız aynı kalabilir */


  return (
    <Form onSubmit={handleSubmit(submitHandler)} autoComplete="off">
      {/* Mode Tabs */}
      <Tabs>
        <Tab $active={mode === "form"} type="button" onClick={() => setMode("form")}>
          {t("form.mode.form", "Form")}
        </Tab>
        <Tab $active={mode === "json"} type="button" onClick={() => setMode("json")}>
          {t("form.mode.json", "JSON Editor")}
        </Tab>
      </Tabs>

      {mode === "form" ? (
        <>
          <Row>
            <Col span={2}>
              <Label htmlFor="code">{t("form.code", "Code")}</Label>
              <Input id="code" {...register("code", { required: true })} />
            </Col>
            <Col>
              <Label htmlFor="discount">{t("form.discount", "Discount %")}</Label>
              <Input id="discount" type="number" step={1} min={1} max={100} {...register("discount", { required: true })} />
            </Col>
            <Col>
              <Label htmlFor="expiresAt">{t("form.expiresAt", "Expiration")}</Label>
              <Input id="expiresAt" type="date" {...register("expiresAt", { required: true })} />
            </Col>
          </Row>

          {/* Yayın / Aktif */}
          <Row>
            <Col>
              <CheckboxRow>
                <input id="isPublished" type="checkbox" {...register("isPublished")} defaultChecked={Boolean(defaultValues.isPublished)} />
                <label htmlFor="isPublished">{t("form.isPublished", "Published?")}</label>
              </CheckboxRow>
            </Col>
            <Col>
              <CheckboxRow>
                <input id="isActive" type="checkbox" {...register("isActive")} defaultChecked={Boolean(defaultValues.isActive)} />
                <label htmlFor="isActive">{t("form.isActive", "Active?")}</label>
              </CheckboxRow>
            </Col>
          </Row>

          {/* Çok dilli alanlar */}
          {SUPPORTED_LOCALES.map((lang) => (
            <Row key={lang}>
              <Col>
                <Label htmlFor={`title.${lang}`}>
                  {t("form.title", "Title")} ({lang.toUpperCase()})
                </Label>
                <Input id={`title.${lang}`} {...register(`title.${lang}`, { required: true })} />
              </Col>
              <Col>
                <Label htmlFor={`description.${lang}`}>
                  {t("form.description", "Description")} ({lang.toUpperCase()})
                </Label>
                <Input id={`description.${lang}`} {...register(`description.${lang}`, { required: true })} />
              </Col>
            </Row>
          ))}

          <Actions>
            <Button type="submit" disabled={loading}>
              {editing ? t("form.update", "Update") : t("form.create", "Create")}
            </Button>
            {editing && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("form.cancel", "Cancel")}
              </Button>
            )}
          </Actions>

          {formState.errors && Object.keys(formState.errors).length > 0 && (
            <ErrorText>
              {Object.values(formState.errors)
                .map((err: any) => err?.message)
                .filter(Boolean)
                .join(" | ")}
            </ErrorText>
          )}
        </>
      ) : (
        <>
          <EditorBlock>
            <JSONEditor
              label={t("form.jsonEditor", "Coupon JSON")}
              value={jsonValue}
              onChange={(v: any) => setJsonValue(v || {})}
              placeholder={JSON.stringify(
                {
                  code: "",
                  discount: 10,
                  expiresAt: "2025-12-31",
                  isPublished: false,
                  isActive: true,
                  title: SUPPORTED_LOCALES.reduce<Record<string, string>>((a, l) => ({ ...a, [l]: "" }), {}),
                  description: SUPPORTED_LOCALES.reduce<Record<string, string>>((a, l) => ({ ...a, [l]: "" }), {}),
                },
                null,
                2
              )}
            />
            <Hint>
              {t(
                "form.jsonHint",
                "Required keys: code, discount, expiresAt (YYYY-MM-DD), isPublished, isActive, title{[locale]}, description{[locale]}."
              )}
            </Hint>
          </EditorBlock>

          <Actions>
            <Button type="button" onClick={submitJson} disabled={loading}>
              {editing ? t("form.update", "Update") : t("form.create", "Create")}
            </Button>
            {editing && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("form.cancel", "Cancel")}
              </Button>
            )}
          </Actions>
        </>
      )}
    </Form>
  );
}

/* styled */
const Form = styled.form`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.md};
`;
const Tabs = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacings.xs};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;
const Tab = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $active, theme }) => ($active ? theme.colors.primaryLight : theme.colors.cardBackground)};
  color: ${({ theme }) => theme.colors.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor: pointer;
`;
const Row = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.tablet} { grid-template-columns: repeat(2, 1fr); }
  ${({ theme }) => theme.media.small} { grid-template-columns: 1fr; }
`;
const Col = styled.div<{ span?: number }>`
  grid-column: span ${({ span }) => span || 1};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacings.xs};
`;
const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  min-width: 0;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
  }
`;
const CheckboxRow = styled.div`
  display:flex; align-items:center; gap:8px;
  input{ width:18px; height:18px; accent-color:${({theme})=>theme.colors.primary}; }
`;
const Actions = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacings.sm}; justify-content: flex-end;
`;
const EditorBlock = styled.div`
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacings.md};
`;
const Hint = styled.div`
  margin-top: ${({ theme }) => theme.spacings.xs};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;
