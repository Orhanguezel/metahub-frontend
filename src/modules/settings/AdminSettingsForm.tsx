"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import {
  Setting,
  upsertSetting,
  upsertSettingImage,
  updateSettingImage,
} from "@/store/settingSlice";
import { toast } from "react-toastify";
import KeyInputSection from "@/modules/settings/KeyInputSection";
import ValueInputSection from "@/modules/settings/ValueInputSection";


type BaseSettingValue = string | string[] | null;
type MultiLangValue = { tr: string; en: string; de: string };
type NestedMultiLangLinkValue = Record<
  string,
  { label: { tr: string; en: string; de: string }; url: string }
>;

type SettingValue =
  | BaseSettingValue
  | MultiLangValue
  | NestedMultiLangLinkValue;

interface AdminSettingsFormProps {
  editingSetting: Setting | null;
  availableThemes: string[];
  onSave: () => void;
  onAvailableThemesUpdate: (newThemes: string[]) => void;
}

export default function AdminSettingsForm({
  editingSetting,
  availableThemes,
  onSave,
  onAvailableThemesUpdate,
}: AdminSettingsFormProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("admin-settings");

  const [key, setKey] = useState("");
  const [value, setValue] = useState<SettingValue>({});
  const [isNestedObject, setIsNestedObject] = useState<boolean>(false);
  const [isMultiLang, setIsMultiLang] = useState<boolean>(false);
  const [isImage, setIsImage] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);

  // ✅ Fill initial data
  useEffect(() => {
    if (editingSetting) {
      setKey(editingSetting.key || "");
      setValue((editingSetting.value as SettingValue) ?? null);

      const isObj =
        editingSetting.value &&
        typeof editingSetting.value === "object" &&
        !Array.isArray(editingSetting.value);

      const isNested =
        !!isObj &&
        Object.values(editingSetting.value || {}).some(
          (v) =>
            typeof v === "object" &&
            v !== null &&
            ("tr" in v || "en" in v || "de" in v)
        );

      setIsMultiLang(Boolean(isObj) && !isNested);
      setIsNestedObject(isNested);
      setIsImage(false);
      setFile(null);
    } else {
      setKey("");
      setValue(null);
      setIsMultiLang(false);
      setIsNestedObject(false);
      setIsImage(false);
      setFile(null);
    }
  }, [editingSetting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (isImage) {
      if (!file) {
        toast.error(t("pleaseSelectFile", "Please select an image file."));
        return;
      }
  
      try {
        const action = editingSetting
          ? updateSettingImage({ key, file })
          : upsertSettingImage({ key, file });
  
        await dispatch(action).unwrap();
        toast.success(
          editingSetting
            ? t("imageUpdated", "Image updated successfully.")
            : t("imageUploaded", "Image uploaded successfully.")
        );
        onSave();
      } catch (error: any) {
        toast.error(
          error?.message || t("saveError", "An error occurred while saving.")
        );
      }
      return;
    }
  
    if (!key.trim()) {
      toast.error(t("keyRequired", "Key is required."));
      return;
    }
  
    let normalizedValue: any = value;

// ✅ Nested object gönderiyorsak ama boşsa hata verelim
if (isNestedObject) {
  if (!value || Object.keys(value).length === 0) {
    toast.error(t("noFields", "Please add at least one field."));
    return;
  }
  // burada olduğu gibi gönderiyoruz
} else if (
  !isMultiLang &&
  typeof value === "string" &&
  !["site_template", "available_themes"].includes(key)
) {
  normalizedValue = { tr: value, en: value, de: value };
}

  
    if (key === "available_themes" && typeof value === "string") {
      normalizedValue = value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
  
    if (
      key === "site_template" &&
      typeof value === "string" &&
      !availableThemes.includes(value)
    ) {
      toast.error(t("invalidTheme", "Invalid theme selected."));
      return;
    }
  
    try {
      await dispatch(upsertSetting({ key, value: normalizedValue })).unwrap();
      toast.success(t("settingSaved", "Setting saved successfully."));
      onSave();
    } catch (error: any) {
      toast.error(
        error?.message || t("saveError", "An error occurred while saving.")
      );
    }
  };
  

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <KeyInputSection
        keyValue={key}
        setKey={setKey}
        isMultiLang={isMultiLang}
        setIsMultiLang={setIsMultiLang}
        isImage={isImage}
        setIsImage={setIsImage}
        isNestedObject={isNestedObject}                 // ✅ EKLENDİ
        setIsNestedObject={setIsNestedObject}           // ✅ EKLENDİ
        isEditing={!!editingSetting}
      />

      <ValueInputSection
        keyValue={key}
        value={value}
        setValue={setValue}
        availableThemes={availableThemes}
        onAvailableThemesUpdate={onAvailableThemesUpdate}
        dispatch={dispatch}
        isMultiLang={isMultiLang}
        isNestedObject={isNestedObject}
        isImage={isImage}
        file={file}
        setFile={setFile}
      />

      <SaveButton type="submit">{t("save", "Save")}</SaveButton>
    </FormWrapper>
  );
}

// 🎨 Styled Components
const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SaveButton = styled.button`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
`;
