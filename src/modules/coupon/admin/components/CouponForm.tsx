"use client";
import React from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface CouponFormProps {
  editing?: any | null;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export default function CouponForm({
  editing,
  onSubmit,
  onCancel,
}: CouponFormProps) {
  const { t } = useTranslation("coupon");

  // HER DİL ZORUNLU → boş değer girilmeye izin verme
  const defaultValues = {
    code: editing?.code || "",
    discount: editing?.discount || "",
    expiresAt: editing?.expiresAt?.slice?.(0, 10) || "",
    "label.title.tr": editing?.label?.title?.tr || "",
    "label.title.en": editing?.label?.title?.en || "",
    "label.title.de": editing?.label?.title?.de || "",
    "label.description.tr": editing?.label?.description?.tr || "",
    "label.description.en": editing?.label?.description?.en || "",
    "label.description.de": editing?.label?.description?.de || "",
  };

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues,
  });

  const submitHandler = (data: any) => {
  data.discount = parseFloat(data.discount);
  if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);

  data.label = {
    title: {
      tr: data["label.title.tr"].trim(),
      en: data["label.title.en"].trim(),
      de: data["label.title.de"].trim(),
    },
    description: {
      tr: data["label.description.tr"].trim(),
      en: data["label.description.en"].trim(),
      de: data["label.description.de"].trim(),
    },
  };

  // Temizle
  Object.keys(data).forEach((k) => {
    if (k.startsWith("label.")) delete data[k];
  });

  // Boş alan kontrolü
  const missingFields = [];
  if (!data.code) missingFields.push("code");
  if (!data.discount) missingFields.push("discount");
  if (!data.expiresAt) missingFields.push("expiresAt");
  ["tr", "en", "de"].forEach((lang) => {
    if (!data.label.title[lang]) missingFields.push(`title.${lang}`);
    if (!data.label.description[lang]) missingFields.push(`desc.${lang}`);
  });
  if (missingFields.length) {
    alert(
      t("form.required_fields", "Please fill in all required fields:") +
        " " +
        missingFields.join(", ")
    );
    return;
  }

  onSubmit(data);
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
      <Row>
        <Input
          {...register("label.title.tr", { required: true })}
          placeholder="Başlık (TR)"
        />
        <Input
          {...register("label.title.en", { required: true })}
          placeholder="Title (EN)"
        />
        <Input
          {...register("label.title.de", { required: true })}
          placeholder="Titel (DE)"
        />
      </Row>
      <Row>
        <Input
          {...register("label.description.tr", { required: true })}
          placeholder="Açıklama (TR)"
        />
        <Input
          {...register("label.description.en", { required: true })}
          placeholder="Description (EN)"
        />
        <Input
          {...register("label.description.de", { required: true })}
          placeholder="Beschreibung (DE)"
        />
      </Row>
      <Row>
        <Button type="submit">
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

// Styled Components ... (değişmedi, senin kodun aynen kullanılabilir)
const Form = styled.form`
  margin-bottom: 36px;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
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
