"use client";

import styled from "styled-components";
import { useState, useEffect, useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/services";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";
import type { ServicesCategory } from "@/modules/services/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: ServicesCategory | null;
  onSubmit: (
    data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
    id?: string
  ) => Promise<void>;
}

export default function ServicesCategoryForm({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
}: Props) {
  const { i18n, t } = useI18nNamespace("services", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  // tek seferlik boş objeler
  const emptyLabel = useMemo(
    () =>
      SUPPORTED_LOCALES.reduce(
        (acc, lng) => ({ ...acc, [lng]: "" }),
        {} as Record<SupportedLocale, string>
      ),
    []
  );

  const [name, setName] = useState<Record<SupportedLocale, string>>(emptyLabel);
  const [description, setDescription] = useState<Record<SupportedLocale, string>>(emptyLabel);

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setName({ ...emptyLabel, ...(editingItem.name || {}) });
      setDescription(editingItem.description ? { ...emptyLabel, ...editingItem.description } : emptyLabel);
    } else {
      setName(emptyLabel);
      setDescription(emptyLabel);
    }
  }, [editingItem, isOpen, emptyLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // seçili dil öncelikli doldurma
    const mainName = (name[lang] || Object.values(name).find((v) => v?.trim()) || "").trim();
    if (!mainName) {
      alert(t("admin.servicescategory.name_required", "Category name required"));
      return;
    }

    const filledName = { ...name };
    SUPPORTED_LOCALES.forEach((lng) => {
      if (!filledName[lng]) filledName[lng] = mainName;
    });

    const mainDesc = (description[lang] || Object.values(description).find((v) => v?.trim()) || "").trim();
    const filledDescription = { ...description };
    if (mainDesc) {
      SUPPORTED_LOCALES.forEach((lng) => {
        if (!filledDescription[lng]) filledDescription[lng] = mainDesc;
      });
    }

    await onSubmit({ name: filledName, description: filledDescription }, editingItem?._id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Form onSubmit={handleSubmit}>
      <h2>
        {editingItem
          ? t("admin.servicescategory.edit", "Edit Services Category")
          : t("admin.servicescategory.create", "Add New Services Category")}
      </h2>

      {SUPPORTED_LOCALES.map((lng) => (
        <FieldGroup key={lng}>
          <Label>
            {t("admin.servicescategory.name", "Category Name")} ({lng.toUpperCase()})
          </Label>
          <Input
            value={name[lng]}
            onChange={(e) => setName({ ...name, [lng]: e.target.value })}
            required={lng === lang}
            autoFocus={lng === lang}
            placeholder={t("admin.servicescategory.name_placeholder", "Enter name")}
          />

          <Label>
            {t("admin.servicescategory.description", "Description")} ({lng.toUpperCase()})
          </Label>
          <TextArea
            value={description[lng]}
            onChange={(e) => setDescription({ ...description, [lng]: e.target.value })}
            placeholder={t("admin.servicescategory.desc_placeholder", "Optional")}
          />
        </FieldGroup>
      ))}

      <Actions>
        <Secondary type="button" onClick={onClose}>
          {t("admin.cancel", "Cancel")}
        </Secondary>
        <Primary type="submit">
          {editingItem ? t("admin.update", "Update") : t("admin.create", "Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* styled — about/category form patern */
const Form = styled.form`
  max-width: 720px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.lg};
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
  h2 { margin: 0; }
`;

const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacings.xs};
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
`;

const TextArea = styled.textarea`
  min-height: 90px;
  resize: vertical;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const BaseBtn = styled.button`
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  border: ${({ theme }) => theme.borders.thin} transparent;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const Primary = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  &:hover { background: ${({ theme }) => theme.buttons.primary.backgroundHover}; }
`;

const Secondary = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
`;
