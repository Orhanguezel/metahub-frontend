"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import type { ISetting, ISettingValue, ISettingsImage } from "../../types";
import { completeLocales } from "@/utils/completeLocales";
import { ImageUploader } from "@/shared";
import type { UploadImage as UploaderImage } from "@/shared/ImageUploader";
import type { ImageType } from "@/types/image";

const IMAGE_KEYS = ["navbar_images", "footer_images", "logo_images", "images"];
const THEMES_KEYS = ["available_themes", "site_template"];

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
  const { t } = useI18nNamespace("settings", translations);

  // === base state ===
  const [key, setKey] = useState("");
  const [value, setValue] = useState<any>("");
  const [isMultiLang, setIsMultiLang] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isNestedObject, setIsNestedObject] = useState(false);

  // === image uploader state (ortak pattern) ===
  const [existing, setExisting] = useState<UploaderImage[]>([]);
  const [removedExisting, setRemovedExisting] = useState<UploaderImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  // derive
  const isTheme = useMemo(() => THEMES_KEYS.includes(key), [key]);
  const isImageKey = useMemo(() => IMAGE_KEYS.includes(key), [key]);

  // Fill on edit
  useEffect(() => {
    if (editingSetting) {
      setKey(editingSetting.key || "");
      setValue(editingSetting.value ?? "");
      setIsMultiLang(isTranslatedLabel(editingSetting.value));
      setIsImage(IMAGE_KEYS.includes(editingSetting.key));
      setIsNestedObject(
        typeof editingSetting.value === "object" &&
          !Array.isArray(editingSetting.value) &&
          !isTranslatedLabel(editingSetting.value)
      );

      // Map settings images -> ImageUploader format
      const mapped: UploaderImage[] =
        editingSetting.images?.map((img: ISettingsImage) => ({
          url: img.url,
          thumbnail: (img as any)?.thumbnail,
          webp: (img as any)?.webp,
          publicId: img.publicId,
          type: "settings" as ImageType,
        })) || [];
      setExisting(mapped);
      setRemovedExisting([]);
      setFiles([]);
    } else {
      setKey("");
      setValue("");
      setIsMultiLang(false);
      setIsImage(false);
      setIsNestedObject(false);
      setExisting([]);
      setRemovedExisting([]);
      setFiles([]);
    }
  }, [editingSetting]);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isImageKey) {
        const removedPublicIds = removedExisting
          .map((x) => x.publicId)
          .filter(Boolean) as string[];

        // hiç mevcut yok + yeni dosya yüklendi → upsertSettingsImage
        if ((!editingSetting?.images || editingSetting.images.length === 0) && files.length > 0) {
          await dispatch(upsertSettingsImage({ key, files })).unwrap();
          toast.success(t("settingSaved", "Images uploaded successfully."));
          onSave();
          return;
        }

        // mevcut var ve (silinen ya da yeni dosya) → updateSettingsImage
        if (editingSetting?.images && (removedPublicIds.length > 0 || files.length > 0)) {
          await dispatch(updateSettingsImage({ key, files, removedImages: removedPublicIds })).unwrap();
          toast.success(t("settingSaved", "Images updated successfully."));
          onSave();
          return;
        }

        toast.info(t("noChanges", "No changes to save."));
        return;
      }

      // THEMES normalize (array)
      let normalizedValue: ISettingValue = value;
      if (isTheme && typeof value === "string") {
        normalizedValue = value
          .split(",")
          .map((v: string) => v.trim())
          .filter(Boolean);
      }

      // Multi-lang normalize
      if (isMultiLang && typeof value === "object") {
        normalizedValue = completeLocales(value);
      }
      if (isMultiLang && typeof value === "string") {
        normalizedValue = SUPPORTED_LOCALES.reduce(
          (obj, lng) => ({ ...obj, [lng]: value }),
          {} as Record<string, string>
        );
      }

      // Theme validation
      if (
        key === "site_template" &&
        typeof normalizedValue === "string" &&
        availableThemes &&
        !availableThemes.includes(normalizedValue)
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

  return (
    <Form onSubmit={handleSubmit}>
      <h2>{editingSetting ? t("editSetting", "Edit Setting") : t("createSetting", "Create Setting")}</h2>

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

      {isImageKey ? (
        <Block>
          <BlockTitle>{t("images", "Images")}</BlockTitle>
          <ImageUploader
            existing={existing}
            onExistingChange={setExisting}
            removedExisting={removedExisting}
            onRemovedExistingChange={setRemovedExisting}
            files={files}
            onFilesChange={setFiles}
            maxFiles={12}
            accept="image/*"
            sizeLimitMB={15}
            helpText={t("uploader.help", "jpg/png/webp • keeps order")}
          />
        </Block>
      ) : (
        <ValueInputSection
          keyValue={key}
          value={value}
          setValue={setValue}
          availableThemes={availableThemes}
          isMultiLang={isMultiLang}
          isNestedObject={isNestedObject}
          isImage={isImage}
          supportedLocales={SUPPORTED_LOCALES}
          // aşağıdaki props’lar image modülü içindi; non-image’da gerek yok
          files={files}
          setFiles={setFiles}
          removedImages={[]} // kullanılmıyor
          setRemovedImages={() => {}}
        />
      )}

      <Actions>
        <Primary type="submit">{t("save", "Save")}</Primary>
      </Actions>
    </Form>
  );
};

export default AdminSettingsForm;

/* ================= styles (ortak form patern) ================= */

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
  width: 100%;
  max-width: ${({ theme }) => theme.layout.containerWidth};
`;

const Block = styled.section`
  padding: ${({ theme }) => theme.spacings.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.cardBackground};
`;

const BlockTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacings.sm} 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.title};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Primary = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: filter .15s;
  &:hover { filter: brightness(0.98); }
`;
