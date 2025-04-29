"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { Setting, upsertSetting } from "@/store/settingSlice";
import { toast } from "react-toastify";
import AdminSiteTemplateSelector from "./AdminSiteTemplateSelector";

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
  const [value, setValue] = useState<string | string[] | { tr: string; en: string; de: string }>("");
  const [isMultiLang, setIsMultiLang] = useState(false);

  useEffect(() => {
    if (editingSetting) {
      setKey(editingSetting.key);
      setValue(editingSetting.value);
      setIsMultiLang(typeof editingSetting.value === "object" && !Array.isArray(editingSetting.value));
    } else {
      setKey("");
      setValue("");
      setIsMultiLang(false);
    }
  }, [editingSetting]);

  const handleMultiLangToggle = () => {
    setIsMultiLang((prev) => !prev);
    setValue(!isMultiLang ? { tr: "", en: "", de: "" } : "");
  };

  const handleDeleteTheme = (themeToDelete: string) => {
    const updatedThemes = availableThemes.filter((theme) => theme !== themeToDelete);
    onAvailableThemesUpdate(updatedThemes);

    if (key === "site_template" && value === themeToDelete) {
      setValue("");
    }

    dispatch(upsertSetting({ key: "available_themes", value: updatedThemes }));
  };

  const handleAddTheme = (newTheme: string) => {
    const trimmed = newTheme.trim();
    if (!trimmed || availableThemes.includes(trimmed)) return;

    const updatedThemes = [...availableThemes, trimmed];
    onAvailableThemesUpdate(updatedThemes);
    dispatch(upsertSetting({ key: "available_themes", value: updatedThemes }));

    if (key === "site_template") setValue(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let normalizedValue = value;

    if (!isMultiLang && typeof value === "string" && !["site_template", "available_themes"].includes(key)) {
      normalizedValue = { tr: value, en: value, de: value };
    }

    if (key === "available_themes" && typeof value === "string") {
      normalizedValue = value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }

    if (key === "site_template" && typeof value === "string" && !availableThemes.includes(value)) {
      toast.error(t("invalidTheme", "Invalid theme selected."));
      return;
    }

    try {
      await dispatch(upsertSetting({ key, value: normalizedValue })).unwrap();
      toast.success(t("settingSaved", "Setting saved successfully."));
      onSave();
    } catch (error: any) {
      toast.error(error?.message || t("saveError", "An error occurred while saving."));
    }
  };

  const renderValueInput = () => {
    if (key === "available_themes") {
      return (
        <>
          <Label>{t("themeList", "Theme List (comma separated)")}</Label>
          <Input
            type="text"
            value={Array.isArray(value) ? value.join(", ") : (value as string)}
            onChange={(e) => setValue(e.target.value)}
            placeholder="classic, modern, minimal"
          />
        </>
      );
    }

    if (key === "site_template") {
      return (
        <>
          <Label>{t("selectTheme", "Select Theme")}</Label>
          <AdminSiteTemplateSelector
            availableThemes={availableThemes}
            selectedTheme={value as string}
            onChange={setValue}
            onAddTheme={handleAddTheme}
            onDeleteTheme={handleDeleteTheme}
          />
        </>
      );
    }

    if (isMultiLang) {
      const val = value as { tr: string; en: string; de: string };
      return (
        <>
          <Label>{t("valueTr", "Value (Turkish)")}</Label>
          <Input value={val.tr || ""} onChange={(e) => setValue({ ...val, tr: e.target.value })} />
          <Label>{t("valueEn", "Value (English)")}</Label>
          <Input value={val.en || ""} onChange={(e) => setValue({ ...val, en: e.target.value })} />
          <Label>{t("valueDe", "Value (German)")}</Label>
          <Input value={val.de || ""} onChange={(e) => setValue({ ...val, de: e.target.value })} />
        </>
      );
    }

    return (
      <>
        <Label>{t("value", "Value")}</Label>
        <Input
          type="text"
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("valuePlaceholder", "Enter value")}
        />
      </>
    );
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <Label>{t("key", "Key")}</Label>
      <Input
        type="text"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder={t("keyPlaceholder", "Enter key")}
        required
        disabled={!!editingSetting}
      />

      {key !== "available_themes" && key !== "site_template" && (
        <CheckboxWrapper>
          <input type="checkbox" checked={isMultiLang} onChange={handleMultiLangToggle} id="multiLang" />
          <label htmlFor="multiLang">{t("multiLanguage", "Multi-Language?")}</label>
        </CheckboxWrapper>
      )}

      {renderValueInput()}

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

const Label = styled.label`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
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

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;
