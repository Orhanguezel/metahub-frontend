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
import type { ISetting, ISettingValue, ISettingsImage } from "../../types";
import { completeLocales } from "@/utils/completeLocales";

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

  // State
  const [key, setKey] = useState("");
  const [value, setValue] = useState<any>("");
  const [files, setFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isMultiLang, setIsMultiLang] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isNestedObject, setIsNestedObject] = useState(false);

  // On edit, fill form
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
      setRemovedImages([]);
    } else {
      setKey("");
      setValue("");
      setIsMultiLang(false);
      setIsImage(false);
      setIsNestedObject(false);
      setRemovedImages([]);
    }
    setFiles([]);
  }, [editingSetting]);

  // Key türüne göre inputlar
  const isTheme = THEMES_KEYS.includes(key);
  const isImageKey = IMAGE_KEYS.includes(key);

  // Görseli sil (mevcut image array’den)
  const handleRemoveImage = (img: ISettingsImage) => {
    setRemovedImages((prev) =>
      img.publicId ? [...prev, img.publicId] : prev
    );
  };

  // Yeni dosya eklendiğinde
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files ? Array.from(e.target.files) : []);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isImageKey) {
        // Sıfırdan yeni image array ekleniyor (mevcut görsel yok ve yeni dosya eklendi)
        if ((!editingSetting?.images || editingSetting.images.length === 0) && files.length > 0) {
          await dispatch(upsertSettingsImage({ key, files })).unwrap();
          toast.success(t("settingSaved", "Images uploaded successfully."));
          onSave();
          return;
        }
        // Var olan görsellerde update (silinen ve/veya yeni eklenen varsa)
        if (editingSetting?.images && (removedImages.length > 0 || files.length > 0)) {
          await dispatch(updateSettingsImage({ key, files, removedImages })).unwrap();
          toast.success(t("settingSaved", "Images updated successfully."));
          onSave();
          return;
        }
        // Sadece silinen görseller varsa (hiç yeni dosya yüklenmedi)
        if (removedImages.length > 0 && !files.length) {
          await dispatch(updateSettingsImage({ key, files: [], removedImages })).unwrap();
          toast.success(t("settingSaved", "Images updated successfully."));
          onSave();
          return;
        }
        // Dosya da kaldırılmadıysa hiçbir şey yapma
        toast.info(t("noChanges", "No changes to save."));
        return;
      }

      // THEMES normalize (array olarak gönder)
      let normalizedValue: ISettingValue = value;
      if (isTheme && typeof value === "string") {
        normalizedValue = value
          .split(",")
          .map((v: string) => v.trim())
          .filter(Boolean);
      }

      // Multi-lang normalize (object/string → completeLocales)
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

  // --- Render
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

      {isImageKey ? (
        <FileInputGroup>
          <Label>
            {t("images", "Images")} *
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </Label>
          <ImagePreviews>
            {/* Varolan mevcut görseller (silinebilir) */}
            {editingSetting?.images?.filter(img => !removedImages.includes(img.publicId || "")).map((img, idx) => (
              <PreviewBox key={img.publicId || img.url || idx}>
                <PreviewImg src={img.url} alt={img.publicId || `img-${idx}`} />
                <RemoveImgBtn type="button" onClick={() => handleRemoveImage(img)}>×</RemoveImgBtn>
              </PreviewBox>
            ))}
            {/* Yeni yüklenen dosyalar (henüz kaydedilmemiş) */}
            {files.map((file, idx) => (
              <PreviewBox key={file.name + idx}>
                <PreviewImg src={URL.createObjectURL(file)} alt={file.name} />
              </PreviewBox>
            ))}
          </ImagePreviews>
        </FileInputGroup>
      ) : (
        <ValueInputSection
          keyValue={key}
          value={value}
          setValue={setValue}
          availableThemes={availableThemes}
          isMultiLang={isMultiLang}
          isNestedObject={isNestedObject}
          isImage={isImage}
          // 👇 burada prop'u kaldırıyoruz!
          // isEditing={!!editingSetting}  ← Bunu kaldır!
          supportedLocales={SUPPORTED_LOCALES}
          files={files}
          setFiles={setFiles}
          removedImages={removedImages}
          setRemovedImages={setRemovedImages}
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

const FileInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

const ImagePreviews = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
`;

const PreviewBox = styled.div`
  position: relative;
  display: inline-block;
`;

const PreviewImg = styled.img`
  margin-top: ${({ theme }) => theme.spacings.xs};
  max-width: 120px;
  max-height: 80px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  object-fit: contain;
`;

const RemoveImgBtn = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.11);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  &:hover {
    background: #f5222d;
  }
`;

