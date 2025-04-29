"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { upsertSetting } from "@/store/settingSlice";
import { Setting } from "@/store/settingSlice";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { toast } from "react-toastify";

interface AdminSettingsFormProps {
  editingSetting: Setting | null;
  onSave: () => void;
}

export default function AdminSettingsForm({ editingSetting, onSave }: AdminSettingsFormProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("admin-settings");

  const [key, setKey] = useState("");
  const [value, setValue] = useState<string | { tr: string; en: string; de: string }>("");
  const [isMultiLang, setIsMultiLang] = useState(false);

  useEffect(() => {
    if (editingSetting) {
      setKey(editingSetting.key);
      setValue(editingSetting.value);
      setIsMultiLang(typeof editingSetting.value === "object"); // mevcut kayıt çok dilli mi?
    } else {
      setKey("");
      setValue("");
      setIsMultiLang(false);
    }
  }, [editingSetting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const normalizedValue =
      typeof value === "string"
        ? { tr: value, en: value, de: value }
        : value;
  
    try {
      await dispatch(upsertSetting({ key, value: normalizedValue })).unwrap();
      toast.success(t("settingSaved", "Setting saved successfully."));
      onSave();
    } catch (error: any) {
      console.error("❌ Save Setting Error:", error);
      if (error?.response?.status === 422) {
        toast.error(t("keyAlreadyExists", "This key already exists."));
      } else {
        toast.error(error?.message || t("saveError", "An error occurred while saving."));
      }
    }
  };
  

  const handleMultiLangToggle = () => {
    setIsMultiLang(!isMultiLang);
    setValue(!isMultiLang ? { tr: "", en: "", de: "" } : ""); // Tür değişimi yap
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

      <CheckboxWrapper>
        <input
          type="checkbox"
          checked={isMultiLang}
          onChange={handleMultiLangToggle}
          id="multiLang"
        />
        <label htmlFor="multiLang">{t("multiLanguage", "Multi-Language?")}</label>
      </CheckboxWrapper>

      {isMultiLang ? (
        <>
          <Label>{t("valueTr", "Value (Turkish)")}</Label>
          <Input
            type="text"
            value={(value as any).tr}
            onChange={(e) => setValue((prev) => ({ ...(prev as any), tr: e.target.value }))}
            placeholder={t("valueTrPlaceholder", "Enter Turkish value")}
            required
          />

          <Label>{t("valueEn", "Value (English)")}</Label>
          <Input
            type="text"
            value={(value as any).en}
            onChange={(e) => setValue((prev) => ({ ...(prev as any), en: e.target.value }))}
            placeholder={t("valueEnPlaceholder", "Enter English value")}
            required
          />

          <Label>{t("valueDe", "Value (German)")}</Label>
          <Input
            type="text"
            value={(value as any).de}
            onChange={(e) => setValue((prev) => ({ ...(prev as any), de: e.target.value }))}
            placeholder={t("valueDePlaceholder", "Enter German value")}
            required
          />
        </>
      ) : (
        <>
          <Label>{t("value", "Value")}</Label>
          <Input
            type="text"
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("valuePlaceholder", "Enter value")}
            required
          />
        </>
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
  transition: border ${({ theme }) => theme.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.sm} 0;

  label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: pointer;
  }
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
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;