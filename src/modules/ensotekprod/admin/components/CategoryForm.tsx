"use client";

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import type { EnsotekCategory } from "@/modules/ensotekprod/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/ensotekprod";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { JSONEditor, ImageUploader } from "@/shared";

type TL = Partial<Record<SupportedLocale, string>>;
type UploadImage = { url: string; thumbnail?: string; webp?: string; publicId?: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: EnsotekCategory | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

const setTL = (obj: TL | undefined, l: SupportedLocale, val: string): TL => ({ ...(obj || {}), [l]: val });
const getTLStrict = (obj?: TL, l?: SupportedLocale) => (l ? (obj?.[l] ?? "") : "");
const toTL = (v: any, lang: SupportedLocale): TL =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as TL) : v ? ({ [lang]: String(v) } as TL) : {};

export default function EnsotekprodCategoryFormModal({ isOpen, onClose, editingItem, onSubmit }: Props) {
  const { i18n, t } = useI18nNamespace("ensotekprod", translations);
  const lang = (i18n.language?.slice(0, 2)) as SupportedLocale;

  const [editMode, setEditMode] = useState<"simple" | "json">("simple");

  const emptyTL = useMemo(
    () => SUPPORTED_LOCALES.reduce((a, l) => ({ ...a, [l]: "" }), {} as TL),
    []
  );
  const [name, setName] = useState<TL>({});
  const [description, setDescription] = useState<TL>({});
  const [isActive, setIsActive] = useState(true);

  // images (ImageUploader)
  const originalExisting = useMemo<UploadImage[]>(
    () =>
      (editingItem?.images || []).map((img) => ({
        url: img.url,
        thumbnail: img.thumbnail,
        webp: img.webp,
        publicId: img.publicId,
      })),
    [editingItem?.images]
  );
  const [existingUploads, setExistingUploads] = useState<UploadImage[]>(originalExisting);
  const [removedExisting, setRemovedExisting] = useState<UploadImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setName({ ...emptyTL, ...(editingItem.name as TL) });
      setDescription({ ...emptyTL, ...(editingItem.description as TL) });
      setIsActive(editingItem.isActive ?? true);
      setExistingUploads(originalExisting);
      setRemovedExisting([]);
      setNewFiles([]);
    } else {
      setName({ ...emptyTL });
      setDescription({ ...emptyTL });
      setIsActive(true);
      setExistingUploads([]);
      setRemovedExisting([]);
      setNewFiles([]);
    }
  }, [editingItem, isOpen, emptyTL, originalExisting]);

  const combinedJSONValue = useMemo(() => ({ name, description }), [name, description]);
  const onCombinedJSONChange = (v: any) => {
    setName(toTL(v?.name, lang));
    setDescription(toTL(v?.description, lang));
  };

  const placeholderObj = useMemo(() => {
    const langs = SUPPORTED_LOCALES as SupportedLocale[];
    const empty = Object.fromEntries(langs.map((l) => [l, ""])) as TL;
    return JSON.stringify({ name: empty, description: empty }, null, 2);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // autofill boş diller
    const filledName = { ...emptyTL, ...name };
    const firstNameValue = Object.values(filledName).find((v) => (v || "").trim());
    if (firstNameValue) SUPPORTED_LOCALES.forEach((l) => (filledName[l] ||= firstNameValue as string));

    const filledDesc = { ...emptyTL, ...description };
    const firstDescValue = Object.values(filledDesc).find((v) => (v || "").trim());
    if (firstDescValue) SUPPORTED_LOCALES.forEach((l) => (filledDesc[l] ||= firstDescValue as string));

    const fd = new FormData();
    fd.append("name", JSON.stringify(filledName));
    fd.append("description", JSON.stringify(filledDesc));
    fd.append("isActive", String(isActive));

    newFiles.forEach((f) => fd.append("images", f));
    if (removedExisting.length) {
      fd.append(
        "removedImages",
        JSON.stringify(removedExisting.map((x) => ({ publicId: x.publicId, url: x.url })))
      );
    }
    if (existingUploads.length) {
      const orderSig = existingUploads.map((x) => x.publicId || x.url).filter(Boolean) as string[];
      fd.append("existingImagesOrder", JSON.stringify(orderSig));
    }

    await onSubmit(fd, editingItem?._id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <h2>
        {editingItem
          ? t("admin.ensotekprodcategory.edit", "Edit Ensotekprod Category")
          : t("admin.ensotekprodcategory.create", "Add New Ensotekprod Category")}
      </h2>

      <ModeRow role="radiogroup" aria-label={t("editMode","Edit Mode")}>
        <ModeBtn type="button" aria-pressed={editMode === "simple"} $active={editMode === "simple"} onClick={() => setEditMode("simple")}>
          {t("simpleMode", "Basit")}
        </ModeBtn>
        <ModeBtn type="button" aria-pressed={editMode === "json"} $active={editMode === "json"} onClick={() => setEditMode("json")}>
          {t("jsonMode", "JSON Editor")}
        </ModeBtn>
      </ModeRow>

      {editMode === "simple" ? (
        <>
          {SUPPORTED_LOCALES.map((lng) => (
            <div key={lng}>
              <Label>{t("admin.ensotekprodcategory.name", "Category Name")} ({lng.toUpperCase()})</Label>
              <Input value={getTLStrict(name, lng)} onChange={(e) => setName(setTL(name, lng, e.target.value))} required={lng === lang} />

              <Label>{t("admin.ensotekprodcategory.description", "Description")} ({lng.toUpperCase()})</Label>
              <TextArea value={getTLStrict(description, lng)} onChange={(e) => setDescription(setTL(description, lng, e.target.value))} required={lng === lang} />
            </div>
          ))}
        </>
      ) : (
        <JSONEditor
          label={t("multiLangJSON", "Name + Description (JSON)")}
          value={combinedJSONValue}
          onChange={onCombinedJSONChange}
          placeholder={placeholderObj}
        />
      )}

      <BlockTitle>{t("admin.ensotekprodcategory.image", "Images")}</BlockTitle>
      <ImageUploader
        existing={existingUploads}
        onExistingChange={setExistingUploads}
        removedExisting={removedExisting}
        onRemovedExistingChange={setRemovedExisting}
        files={newFiles}
        onFilesChange={setNewFiles}
        maxFiles={5}
        accept="image/*"
        sizeLimitMB={15}
        helpText={t("uploader.help", "jpg/png/webp • keeps order")}
      />

      <Check>
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span>{t("admin.ensotekprodcategory.isActive", "Category Active")}</span>
      </Check>

      <Buttons>
        <Primary type="submit">{editingItem ? t("admin.update", "Update") : t("admin.create", "Create")}</Primary>
        <Secondary type="button" onClick={onClose}>{t("admin.cancel", "Cancel")}</Secondary>
      </Buttons>
    </FormWrapper>
  );
}

/* styled */
const FormWrapper = styled.form`
  max-width: 640px; margin:auto; padding:${({theme})=>theme.spacings.lg};
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  display:flex; flex-direction:column; gap:${({theme})=>theme.spacings.sm};
`;
const Label = styled.label`display:block; margin-top:${({theme})=>theme.spacings.sm}; margin-bottom:4px; font-weight:600; font-size:${({theme})=>theme.fontSizes.sm}; color:${({theme})=>theme.colors.textSecondary};`;
const Input = styled.input`
  width:100%; padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;
const TextArea = styled.textarea`
  width:100%; min-height:100px; resize:vertical; padding:10px 12px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;
const Check = styled.label`margin-top:${({theme})=>theme.spacings.sm}; display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center;`;
const Buttons = styled.div`display:flex; gap:${({theme})=>theme.spacings.sm}; margin-top:${({theme})=>theme.spacings.md};`;
const Primary = styled.button`
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer; border:${({theme})=>theme.borders.thin} transparent;
  background:${({theme})=>theme.buttons.primary.background}; color:${({theme})=>theme.buttons.primary.text};
  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;
const Secondary = styled(Primary)`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;
const BlockTitle = styled.h3`font-size:${({theme})=>theme.fontSizes.md}; margin:${({theme})=>theme.spacings.sm} 0; color:${({theme})=>theme.colors.title};`;
const ModeRow = styled.div`display:flex; gap:${({theme})=>theme.spacings.xs}; align-items:center; margin-top:-6px;`;
const ModeBtn = styled.button<{ $active?: boolean }>`
  padding:8px 10px; border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({$active,theme})=>$active?theme.colors.primaryLight:theme.colors.cardBackground};
  color:${({theme})=>theme.colors.text};
  cursor:pointer;
`;
