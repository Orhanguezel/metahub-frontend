"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { SUPPORTED_LOCALES } from "@/i18n";

// --- Helper: Eksik locale'leri tamamla
function completeLocales(
  obj: Record<string, any> | undefined,
  fallback: string = ""
): Record<string, string> {
  if (!obj || typeof obj !== "object") return {};
  const keys = Object.keys(obj).filter((lng) => !!obj[lng]);
  const primary = keys.includes("en") ? "en" : keys[0] || null;
  return SUPPORTED_LOCALES.reduce((acc, lng) => {
    acc[lng] =
      obj[lng] !== undefined && obj[lng] !== null
        ? obj[lng]
        : primary
        ? obj[primary]
        : fallback;
    return acc;
  }, {} as Record<string, string>);
}

interface MultiLangObjectEditorProps {
  value: Record<string, { label: Record<string, string>; url?: string }>;
  setValue: (val: Record<string, { label: Record<string, string>; url?: string }>) => void;
  supportedLocales?: readonly string[];
}

const MultiLangObjectEditor: React.FC<MultiLangObjectEditorProps> = ({
  value,
  setValue,
  supportedLocales = SUPPORTED_LOCALES,
}) => {
  const { t } = useI18nNamespace("settings", translations);
  const [newField, setNewField] = useState<string>("");

  // --- Field ekleme ---
  const handleAddField = () => {
    const trimmed = newField.trim();
    if (!trimmed || value[trimmed]) return;
    setValue({
      ...value,
      [trimmed]: { label: completeLocales({}, "") },
    });
    setNewField("");
  };

  // --- Field sil ---
  const handleRemoveField = (fieldKey: string) => {
    const newVal = { ...value };
    delete newVal[fieldKey];
    setValue(newVal);
  };

  // --- Dil değeri değiştir ---
  const handleLabelChange = (fieldKey: string, lang: string, newVal: string) => {
    setValue({
      ...value,
      [fieldKey]: {
        ...value[fieldKey],
        label: {
          ...completeLocales(value[fieldKey]?.label),
          [lang]: newVal,
        },
      },
    });
  };

  // --- URL/href değiştir ---
  const handleUrlChange = (fieldKey: string, newUrl: string) => {
    setValue({
      ...value,
      [fieldKey]: {
        ...value[fieldKey],
        url: newUrl,
      },
    });
  };

  return (
    <Wrapper>
      <AddFieldRow>
        <NewFieldInput
          type="text"
          placeholder={t("addField", "Add new field (key)...")}
          value={newField}
          onChange={(e) => setNewField(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddField();
            }
          }}
        />
        <AddFieldButton type="button" onClick={handleAddField}>
          ➕ {t("add", "Add")}
        </AddFieldButton>
      </AddFieldRow>

      {!value || Object.keys(value).length === 0 ? (
        <EmptyInfo>{t("noFields", "No fields added yet.")}</EmptyInfo>
      ) : (
        Object.entries(value).map(([fieldKey, fieldObj]) => {
          const label = fieldObj.label || {};
          const url = fieldObj.url || "";
          const completed = completeLocales(label);
          return (
            <FieldBlock key={fieldKey}>
              <FieldHeader>
                <FieldTitle>{fieldKey}</FieldTitle>
                <RemoveButton
                  type="button"
                  onClick={() => handleRemoveField(fieldKey)}
                  title={t("removeField", "Remove field")}
                >
                  ❌
                </RemoveButton>
              </FieldHeader>
              {supportedLocales.map((lng) => (
                <LangInput key={lng}>
                  <Label>{lng.toUpperCase()}:</Label>
                  <Input
                    type="text"
                    value={completed[lng] || ""}
                    placeholder={t("valueLang", { lng })}
                    onChange={(e) =>
                      handleLabelChange(fieldKey, lng, e.target.value)
                    }
                  />
                </LangInput>
              ))}
              <LangInput>
                <Label>URL:</Label>
                <Input
                  type="text"
                  value={url}
                  placeholder="https://..."
                  onChange={(e) =>
                    handleUrlChange(fieldKey, e.target.value)
                  }
                />
              </LangInput>
            </FieldBlock>
          );
        })
      )}
    </Wrapper>
  );
};

export default MultiLangObjectEditor;

// --- Styled Components (aynen kalabilir) ---
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const AddFieldRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const NewFieldInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacings.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const AddFieldButton = styled.button`
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
  }
`;

const EmptyInfo = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  font-style: italic;
`;

const FieldBlock = styled.div`
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacings.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

const FieldHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

const FieldTitle = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  margin-left: ${({ theme }) => theme.spacings.sm};
  opacity: 0.8;
  transition: opacity 0.15s;
  &:hover {
    opacity: 1;
  }
`;

const LangInput = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  margin: ${({ theme }) => theme.spacings.xs} 0;
`;

const Label = styled.label`
  width: 40px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacings.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryTransparent};
  }
`;
