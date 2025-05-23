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
import KeyInputSection from "@/modules/settings/admin/components/KeyInputSection";
import ValueInputSection from "@/modules/settings/admin/components/ValueInputSection";
import { getImageSrc } from "@/utils/getImageSrc";

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
  const { t } = useTranslation("adminSettings");

  const [key, setKey] = useState("");
  const [value, setValue] = useState<any>(editingSetting?.value ?? "");
  const [isNestedObject, setIsNestedObject] = useState(false);
  const [isMultiLang, setIsMultiLang] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [lightFile, setLightFile] = useState<File | null>(null);
  const [darkFile, setDarkFile] = useState<File | null>(null);

  useEffect(() => {
    if (editingSetting) {
      setKey(editingSetting.key || "");
      setValue(editingSetting.value ?? "");

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
      setLightFile(null);
      setDarkFile(null);
    } else {
      setKey("");
      setValue(null);
      setIsMultiLang(false);
      setIsNestedObject(false);
      setIsImage(false);
      setFile(null);
      setLightFile(null);
      setDarkFile(null);
    }
  }, [editingSetting]);

  const isLogoUpload = key === "navbar_logos" || key === "footer_logos";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
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

      if (isImage) {
        if (!file) {
          toast.error(t("pleaseSelectFile", "Please select an image file."));
          return;
        }
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
        return;
      }

      if (!key.trim()) {
        toast.error(t("keyRequired", "Key is required."));
        return;
      }

      let normalizedValue: any = value;

      if (isNestedObject && (!value || Object.keys(value).length === 0)) {
        toast.error(t("noFields", "Please add at least one field."));
        return;
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

      {isLogoUpload ? (
        <LogoInputGroup>
          <div>
            <Label>Light Logo *</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setLightFile(e.target.files ? e.target.files[0] : null)
              }
            />
          </div>
          <div>
            <Label>Dark Logo</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setDarkFile(e.target.files ? e.target.files[0] : null)
              }
            />
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

      {isLogoUpload && value && typeof value === "object" && (
        <LogoPreviewWrapper>
          <div>
            <strong>Light:</strong>
            {value.light ? (
              <img src={getImageSrc(value.light, "setting")} alt="Light Logo" />
            ) : (
              <span>No light logo.</span>
            )}
          </div>
          <div>
            <strong>Dark:</strong>
            {value.dark ? (
              <img src={getImageSrc(value.dark, "setting")} alt="Dark Logo" />
            ) : (
              <span>No dark logo.</span>
            )}
          </div>
        </LogoPreviewWrapper>
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

const LogoPreviewWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  div {
    flex: 1 1 200px;
    text-align: center;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: ${({ theme }) => theme.radii.sm};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;
