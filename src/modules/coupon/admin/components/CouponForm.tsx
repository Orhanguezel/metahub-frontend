"use client";

import React from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/coupon";
import { SUPPORTED_LOCALES } from "@/types/common";
import type { Coupon, TranslatedField } from "../../types";

interface CouponFormProps {
  editing?: Coupon | null;
  loading?: boolean;
  onSubmit: (data: Coupon) => void;
  onCancel?: () => void;
}

export default function CouponForm({
  editing,
  loading,
  onSubmit,
  onCancel,
}: CouponFormProps) {
  const { t } = useI18nNamespace("coupon", translations);

  const expiresAtValue =
  editing?.expiresAt
    ? typeof editing.expiresAt === "string"
      ? (editing.expiresAt as string).slice(0, 10)
      : editing.expiresAt instanceof Date
        ? editing.expiresAt.toISOString().slice(0, 10)
        : ""
    : "";

  // Tüm diller için dinamik initial değerler
  const defaultValues: Record<string, string | number> = {
  code: editing?.code || "",
  discount: editing?.discount || "",
  expiresAt: expiresAtValue,
  ...Object.fromEntries(
    SUPPORTED_LOCALES.flatMap((lang) => [
      [`title.${lang}`, editing?.title?.[lang] || ""],
      [`description.${lang}`, editing?.description?.[lang] || ""],
    ])
  ),
};

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues,
  });

  // Dinamik alanları Coupon tipine uygun şekilde derle
  const submitHandler = (data: any) => {
    data.discount = parseFloat(data.discount);
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);

    // Dinamik TranslatedField için toplayıcı
    const title: TranslatedField = {};
    const description: TranslatedField = {};
    SUPPORTED_LOCALES.forEach((lang) => {
      title[lang] = (data[`title.${lang}`] || "").trim();
      description[lang] = (data[`description.${lang}`] || "").trim();
      delete data[`title.${lang}`];
      delete data[`description.${lang}`];
    });
    data.title = title;
    data.description = description;

    // Boş alan kontrolü
    const missingFields: string[] = [];
    if (!data.code) missingFields.push("code");
    if (!data.discount) missingFields.push("discount");
    if (!data.expiresAt) missingFields.push("expiresAt");
    SUPPORTED_LOCALES.forEach((lang) => {
      if (!title[lang]) missingFields.push(`title.${lang}`);
      if (!description[lang]) missingFields.push(`description.${lang}`);
    });
    if (missingFields.length) {
      alert(
        t("form.required_fields", "Please fill in all required fields:") +
          " " +
          missingFields.join(", ")
      );
      return;
    }

    onSubmit(data as Coupon);
    reset();
  };

  return (
    <Form onSubmit={handleSubmit(submitHandler)} autoComplete="off">
      <Row>
        <Input
          {...register("code", { required: true })}
          placeholder={t("form.code", "Code")}
        />
        <Input
          type="number"
          step={1}
          min={1}
          max={100}
          {...register("discount", { required: true })}
          placeholder={t("form.discount", "Discount %")}
        />
        <Input
          type="date"
          {...register("expiresAt", { required: true })}
          placeholder={t("form.expiresAt", "Expiration")}
        />
      </Row>

      {/* Dinamik dil inputları */}
      {SUPPORTED_LOCALES.map((lang) => (
        <Row key={lang}>
          <Input
            {...register(`title.${lang}`, { required: true })}
            placeholder={`${t("form.title", "Title")} (${lang.toUpperCase()})`}
          />
          <Input
            {...register(`description.${lang}`, { required: true })}
            placeholder={`${t("form.description", "Description")} (${lang.toUpperCase()})`}
          />
        </Row>
      ))}

      <Row>
        <Button type="submit" disabled={loading}>
          {editing ? t("form.update", "Update") : t("form.create", "Create")}
        </Button>
        {editing && onCancel && (
          <Button type="button" onClick={onCancel} $secondary>
            {t("form.cancel", "Cancel")}
          </Button>
        )}
      </Row>
      {/* Simple frontend error display */}
      {formState.errors && Object.keys(formState.errors).length > 0 && (
        <div style={{ color: "red", marginTop: 10 }}>
          {Object.values(formState.errors)
            .map((err: any) => err?.message)
            .join(" | ")}
        </div>
      )}
    </Form>
  );
}

// Styled Components ... (değişmedi)
const Form = styled.form`
  margin-bottom: 36px;
  padding: ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1 1 180px;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 1rem;
`;

const Button = styled.button<{ $secondary?: boolean }>`
  background: ${({ theme, $secondary }) =>
    $secondary ? theme.colors.backgroundAlt : theme.colors.primary};
  color: ${({ theme, $secondary }) =>
    $secondary ? theme.colors.text : "#fff"};
  padding: 10px 26px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: none;
  font-weight: 700;
  font-size: 1.09rem;
  margin-left: ${({ $secondary }) => ($secondary ? "12px" : "0")};
  cursor: pointer;
  &:hover {
    background: ${({ theme, $secondary }) =>
      $secondary ? theme.colors.background : theme.colors.primaryHover};
  }
  transition: background 0.2s;
`;
