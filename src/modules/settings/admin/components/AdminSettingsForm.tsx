"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { useAppDispatch } from "@/store/hooks";
import {
  upsertSettings,
  upsertSettingsImage,
  updateSettingsImage,
} from "@/modules/settings/slice/settingsSlice";
import { toast } from "react-toastify";
import { KeyInputSection, ValueInputSection } from "../..";
import { SUPPORTED_LOCALES } from "@/i18n";
import type { ISetting, ISettingValue } from "../../types";
import { completeLocales } from "@/utils/completeLocales";

// --- Helper: Sadece çoklu dil nesnesi için çalışsın
function isTranslatedLabel(val: unknown): val is Record<string, string> {
  return (
    val != null &&
    typeof val === "object" &&
    !Array.isArray(val) &&
    SUPPORTED_LOCALES.some((lng) =>
      Object.prototype.hasOwnProperty.call(val, lng)
    )
  );
}

const LOGO_KEYS = ["navbar_logos", "footer_logos"];
const THEMES_KEYS = ["available_themes", "site_template"];

interface AdminSettingsFormProps {
  editingSetting: ISetting | null;
  availableThemes: string[];
  onSave: () => void;
}

const AdminSettingsForm: React.FC<AdminSettingsFormProps> = ({
  editingSetting,
  availableThemes,
  onSave,
}) => {
  const dispatch = useAppDispatch();
  const { i18n, t } = useI18nNamespace("settings", translations);

  const [key, setKey] = useState("");
  const [value, setValue] = useState<any>("");
  const [file, setFile] = useState<File | null>(null);
  const [lightFile, setLightFile] = useState<File | null>(null);
  const [darkFile, setDarkFile] = useState<File | null>(null);
  const [isMultiLang, setIsMultiLang] = useState(false);
const [isNestedObject, setIsNestedObject] = useState(false);
const [isImage, setIsImage] = useState(false);

useEffect(() => {
  if (editingSetting) {
    setKey(editingSetting.key || "");
    setValue(editingSetting.value ?? "");
    setIsMultiLang(isTranslatedLabel(editingSetting.value));
    setIsNestedObject(false);
    setIsImage(false);
  } else {
    setKey("");
    setValue("");
    setIsMultiLang(false);
    setIsNestedObject(false);
    setIsImage(false);
  }
  setFile(null);
  setLightFile(null);
  setDarkFile(null);
}, [editingSetting]);

// Sonra, derive edilen const'lar OLMASIN!



  // Value tipi tespiti
  const isLogoUpload = LOGO_KEYS.includes(key);
  const isThemes = THEMES_KEYS.includes(key);
    isTranslatedLabel(value) && !isThemes;

  // Logo url extract
  const extractLogoUrl = (logoObj: any) =>
    typeof logoObj === "string" ? logoObj : logoObj?.url || undefined;
  const lightLogoUrl = extractLogoUrl(value?.light);
  const darkLogoUrl = extractLogoUrl(value?.dark);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // LOGO upload
      if (isLogoUpload) {
        if (!lightFile && !darkFile) {
          toast.error(t("pleaseSelectFile", "Please select at least one logo file."));
          return;
        }
        await dispatch(
          upsertSettingsImage({
            key,
            lightFile: lightFile || undefined,
            darkFile: darkFile || undefined,
          })
        ).unwrap();
        toast.success(t("settingSaved", "Logos updated successfully."));
        onSave();
        return;
      }
      // IMAGE upload
      if (isImage && !isLogoUpload) {
        if (!file) {
          toast.error(t("pleaseSelectFile", "Please select an image file."));
          return;
        }
        const action = editingSetting
          ? updateSettingsImage({ key, darkFile: file })
          : upsertSettingsImage({ key, darkFile: file });
        await dispatch(action).unwrap();
        toast.success(t("settingSaved", "Image updated successfully."));
        onSave();
        return;
      }
      // Validation
      if (!key.trim()) {
        toast.error(t("keyRequired", "Key is required."));
        return;
      }

      // THEMES normalize
      let normalizedValue: ISettingValue = value;
      if (isThemes && typeof value === "string") {
        normalizedValue = value.split(",").map((v: string) => v.trim()).filter(Boolean);
      }

      // Multi-lang normalize (hem string hem object için)
      if (isMultiLang && typeof value === "object") {
        normalizedValue = completeLocales(value);
      }
      if (isMultiLang && typeof value === "string") {
        normalizedValue = SUPPORTED_LOCALES.reduce(
          (obj, lng) => ({ ...obj, [lng]: value }),
          {} as Record<string, string>
        );
      }

      // Tema validation
      if (
        key === "site_template" &&
        typeof value === "string" &&
        availableThemes &&
        !availableThemes.includes(value)
      ) {
        toast.error(t("invalidTheme", "Invalid theme selected."));
        return;
      }

      await dispatch(upsertSettings({ key, value: normalizedValue })).unwrap();
      toast.success(t("settingSaved", "Setting saved successfully."));
      onSave();
    } catch (error: any) {
      toast.error(error?.message || t("saveError", "An error occurred while saving."));
    }
  };

  // Render
  return (
    <FormWrapper onSubmit={handleSubmit}>
     <KeyInputSection
  keyValue={key}
  setKey={setKey}
  isMultiLang={isMultiLang}
  setIsMultiLang={setIsMultiLang}
  isImage={isImage}
  setIsImage={setIsImage}
  isNestedObject={isNestedObject}
  setIsNestedObject={setIsNestedObject}
  isEditing={!!editingSetting}
  supportedLocales={SUPPORTED_LOCALES}
/>

      {isLogoUpload ? (
        <LogoInputGroup>
          <div>
            <Label>{t("lightLogo", "Light Logo")} *</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLightFile(e.target.files?.[0] || null)}
            />
            {lightLogoUrl && <LogoPreviewImg src={lightLogoUrl} alt="Light Logo" />}
          </div>
          <div>
            <Label>{t("darkLogo", "Dark Logo")}</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setDarkFile(e.target.files?.[0] || null)}
            />
            {darkLogoUrl && <LogoPreviewImg src={darkLogoUrl} alt="Dark Logo" />}
          </div>
        </LogoInputGroup>
      ) : (
        <ValueInputSection
  keyValue={key}
  value={value}
  setValue={setValue}
  availableThemes={availableThemes}
  isMultiLang={isMultiLang}
  isNestedObject={isNestedObject}
  isImage={isImage}
  file={file}
  setFile={setFile}
  lightFile={lightFile}
  setLightFile={setLightFile}
  darkFile={darkFile}
  setDarkFile={setDarkFile}
  isEditing={!!editingSetting}
  supportedLocales={SUPPORTED_LOCALES}
/>

      )}
      <SaveButton type="submit">{t("save", "Save")}</SaveButton>
    </FormWrapper>
  );
};

export default AdminSettingsForm;

// --- Styled Components ---
const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
  width: 100%;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
`;

const SaveButton = styled.button`
  margin-top: ${({ theme }) => theme.spacings.md};
  padding: ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.normal};
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const LogoInputGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacings.md};
  > div {
    flex: 1 1 200px;
  }
  input {
    width: 100%;
  }
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

const LogoPreviewImg = styled.img`
  margin-top: ${({ theme }) => theme.spacings.xs};
  max-width: 120px;
  max-height: 80px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  object-fit: contain;
`;

