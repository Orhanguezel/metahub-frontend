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
} from "@/modules/settings/slice/settingSlice";
import { toast } from "react-toastify";
import { KeyInputSection, ValueInputSection } from "@/modules/settings";

const LANGS = ["tr", "en", "de"];

// 👇 Cloudinary veya localde url key'i olup olmadığını kontrol eden yardımcı
const extractLogoUrl = (logoObj: any) =>
  typeof logoObj === "string"
    ? logoObj
    : logoObj?.url
    ? logoObj.url
    : undefined;

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
  const { t } = useTranslation("settings");

  // STATE
  const [key, setKey] = useState("");
  const [value, setValue] = useState<any>(editingSetting?.value ?? "");
  const [isNestedObject, setIsNestedObject] = useState(false);
  const [isMultiLang, setIsMultiLang] = useState(false);
  const [isImage, setIsImage] = useState(false);

  // LOGO STATE
  const [file, setFile] = useState<File | null>(null);
  const [lightFile, setLightFile] = useState<File | null>(null);
  const [darkFile, setDarkFile] = useState<File | null>(null);

  // --- Type Detection for Edit Mode
  useEffect(() => {
    if (editingSetting) {
      setKey(editingSetting.key || "");
      setValue(editingSetting.value ?? "");

      const v = editingSetting.value;
      const isObj = v && typeof v === "object" && !Array.isArray(v);

      const isReallyNested: boolean =
        !!isObj &&
        Object.values(v).length > 0 &&
        Object.values(v).every(
          (sub: any) =>
            typeof sub === "object" &&
            sub !== null &&
            LANGS.every((lng) => lng in sub)
        );

      const isReallyMultiLang: boolean =
        !!isObj && !isReallyNested && LANGS.every((lng) => lng in v);

      setIsNestedObject(isReallyNested);
      setIsMultiLang(isReallyMultiLang);
      setIsImage(false);
      setFile(null);
      setLightFile(null);
      setDarkFile(null);
    } else {
      setKey("");
      setValue("");
      setIsMultiLang(false);
      setIsNestedObject(false);
      setIsImage(false);
      setFile(null);
      setLightFile(null);
      setDarkFile(null);
    }
  }, [editingSetting]);

  const isLogoUpload = key === "navbar_logos" || key === "footer_logos";

  // 👇 LOGO PREVIEW
  const lightLogoUrl = extractLogoUrl(value?.light);
  const darkLogoUrl = extractLogoUrl(value?.dark);

  // SUBMIT LOGIC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // LOGO YÜKLEME (light/dark)
      if (isLogoUpload) {
        if (!lightFile && !darkFile) {
          toast.error(
            t("pleaseSelectFile", "Please select at least one logo file.")
          );
          return;
        }
        await dispatch(
          upsertSettingImage({
            key,
            lightFile: lightFile || undefined,
            darkFile: darkFile || undefined,
          })
        ).unwrap();
        toast.success(t("settingSaved", "Logos updated successfully."));
        onSave();
        return;
      }

      // TEKİL IMAGE
      if (isImage) {
        if (!file) {
          toast.error(t("pleaseSelectFile", "Please select an image file."));
          return;
        }
        const action = editingSetting
          ? updateSettingImage({ key, darkFile: file })
          : upsertSettingImage({ key, darkFile: file });
        await dispatch(action).unwrap();
        toast.success(
          editingSetting
            ? t("imageUpdated", "Image updated successfully.")
            : t("imageUploaded", "Image uploaded successfully.")
        );
        onSave();
        return;
      }

      // STANDART ALANLAR (text, array, multi-lang)
      if (!key.trim()) {
        toast.error(t("keyRequired", "Key is required."));
        return;
      }

      let normalizedValue: any = value;

      if (isNestedObject && (!value || Object.keys(value).length === 0)) {
        toast.error(t("noFields", "Please add at least one field."));
        return;
      }

      if (
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
        isNestedObject={isNestedObject}
        setIsNestedObject={setIsNestedObject}
        isEditing={!!editingSetting}
      />

      {/* LOGO YÜKLEME: footer_logos / navbar_logos */}
      {isLogoUpload ? (
        <LogoInputGroup>
          <div>
            <Label>{t("lightLogo", "Light Logo")} *</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setLightFile(e.target.files ? e.target.files[0] : null)
              }
            />
            {lightLogoUrl && (
              <LogoPreviewImg src={lightLogoUrl} alt="Light Logo" />
            )}
          </div>
          <div>
            <Label>{t("darkLogo", "Dark Logo")}</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setDarkFile(e.target.files ? e.target.files[0] : null)
              }
            />
            {darkLogoUrl && (
              <LogoPreviewImg src={darkLogoUrl} alt="Dark Logo" />
            )}
          </div>
        </LogoInputGroup>
      ) : (
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
      )}

      <SaveButton type="submit">{t("save", "Save")}</SaveButton>
    </FormWrapper>
  );
}

// 🎨 Styled Components
const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
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
  transition: background ${({ theme }) => theme.transition.normal};
  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const LogoInputGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
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
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const LogoPreviewImg = styled.img`
  margin-top: ${({ theme }) => theme.spacing.xs};
  max-width: 120px;
  max-height: 80px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  object-fit: contain;
`;
