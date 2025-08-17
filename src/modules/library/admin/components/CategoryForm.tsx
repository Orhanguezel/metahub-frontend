"use client";

import styled from "styled-components";
import { useState, useEffect, useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/library/locales";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import type { LibraryCategory } from "@/modules/library/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: LibraryCategory | null;
  onSubmit: (
    data: { name: Record<SupportedLocale, string>; description?: Record<SupportedLocale, string> },
    id?: string
  ) => Promise<void>;
}

export default function LibraryCategoryForm({ isOpen, onClose, editingItem, onSubmit }: Props) {
  const { i18n, t } = useI18nNamespace("library", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const emptyLabel = useMemo(
    () => SUPPORTED_LOCALES.reduce((acc, lng) => ({ ...acc, [lng]: "" }), {} as Record<SupportedLocale, string>),
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
    const mainName = name[lang] || Object.values(name).find((v) => v.trim()) || "";
    if (!mainName.trim()) {
      alert(t("admin.librarycategory.name_required", "Category name required"));
      return;
    }
    const filledName = { ...name };
    SUPPORTED_LOCALES.forEach((lng) => {
      if (!filledName[lng]) filledName[lng] = mainName;
    });

    const mainDesc = description[lang] || Object.values(description).find((v) => v.trim()) || "";
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
    <FormWrap>
      <h2>{editingItem ? t("admin.librarycategory.edit", "Edit Library Category") : t("admin.librarycategory.create", "Add New Library Category")}</h2>
      <form onSubmit={handleSubmit}>
        {SUPPORTED_LOCALES.map((lng) => (
          <div key={lng}>
            <Label>
              {t("admin.librarycategory.name", "Category Name")} ({lng.toUpperCase()})
            </Label>
            <Input
              value={name[lng]}
              onChange={(e) => setName({ ...name, [lng]: e.target.value })}
              required={lng === lang}
              placeholder={t("admin.librarycategory.name_placeholder", "Enter name")}
            />

            <Label>
              {t("admin.librarycategory.description", "Description")} ({lng.toUpperCase()})
            </Label>
            <TextArea
              value={description[lng]}
              onChange={(e) => setDescription({ ...description, [lng]: e.target.value })}
              placeholder={t("admin.librarycategory.desc_placeholder", "Optional")}
            />
          </div>
        ))}

        <Actions>
          <Primary type="submit">{editingItem ? t("admin.update", "Update") : t("admin.create", "Create")}</Primary>
          <Secondary type="button" onClick={onClose}>{t("admin.cancel", "Cancel")}</Secondary>
        </Actions>
      </form>
    </FormWrap>
  );
}

/* styled */
const FormWrap = styled.div`
  max-width: 640px; margin:0 auto;
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;
const Label = styled.label`
  display:block; margin-top:${({theme})=>theme.spacings.md};
  margin-bottom:${({theme})=>theme.spacings.xs};
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  color:${({theme})=>theme.colors.textSecondary};
`;
const Input = styled.input`
  width:100%; padding:10px 12px;
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.inputs.background};
  color:${({theme})=>theme.inputs.text};
`;
const TextArea = styled.textarea`
  width:100%; min-height:110px; resize:vertical;
  padding:10px 12px;
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  border-radius:${({theme})=>theme.radii.md};
  background:${({theme})=>theme.inputs.background};
  color:${({theme})=>theme.inputs.text};
`;
const Actions = styled.div`
  display:flex; gap:${({theme})=>theme.spacings.sm}; justify-content:flex-end;
  margin-top:${({theme})=>theme.spacings.lg};
`;
const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} transparent;
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
