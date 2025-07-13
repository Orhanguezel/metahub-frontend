"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";
import { SUPPORTED_LOCALES } from "@/i18n";
import { completeLocales } from "@/utils/completeLocales"; // ← PROJENİN TEK FONKSİYONU

type NestedValue = {
  label: Record<string, string>;
  url: string;
};

interface NestedValueEditorProps {
  value: Record<string, any>;
  setValue: (val: Record<string, any>) => void;
  supportedLocales?: readonly string[];
}

const NestedValueEditor: React.FC<NestedValueEditorProps> = ({
  value,
  setValue,
  supportedLocales = SUPPORTED_LOCALES,
}) => {
  const { t } = useI18nNamespace("settings", translations);
  const [newField, setNewField] = useState<string>("");

  // Field ekleme
  const handleAddField = () => {
    const trimmed = newField.trim();
    if (!trimmed) return;
    if (value[trimmed]) {
      alert(t("fieldExists", "This field already exists."));
      return;
    }
    setValue({
      ...value,
      [trimmed]: {
        label: completeLocales({}),
        url: "",
      },
    });
    setNewField("");
  };

  // Field silme
  const handleRemoveField = (fieldKey: string) => {
    const updated = { ...value };
    delete updated[fieldKey];
    setValue(updated);
  };

  // Label değişimi
  const handleLabelChange = (fieldKey: string, lang: string, val: string) => {
    setValue({
      ...value,
      [fieldKey]: {
        ...value[fieldKey],
        label: {
          ...completeLocales(value[fieldKey]?.label),
          [lang]: val,
        },
      },
    });
  };

  // URL değişimi
  const handleUrlChange = (fieldKey: string, val: string) => {
    setValue({
      ...value,
      [fieldKey]: {
        ...value[fieldKey],
        url: val,
      },
    });
  };

  // Her field için label objesini tamamla
  function getLabelObj(fieldValue: NestedValue) {
    return completeLocales(fieldValue?.label)
;
  }

  return (
    <Wrapper>
      <AddFieldRow>
        <NewFieldInput
          type="text"
          value={newField}
          placeholder={t("enterFieldName", "Enter field name")}
          onChange={(e) => setNewField(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddField()}
        />
        <AddButton type="button" onClick={handleAddField}>
          ➕ {t("addField", "Add Field")}
        </AddButton>
      </AddFieldRow>

      {Object.keys(value).length === 0 && (
        <EmptyMessage>{t("noFields", "No fields added yet.")}</EmptyMessage>
      )}

      {Object.entries(value).map(([fieldKey, fieldValue]) => {
        const label = getLabelObj(fieldValue);
        const url = fieldValue.url || "";

        return (
          <FieldBlock key={fieldKey}>
            <FieldHeader>
              <FieldTitle>{fieldKey}</FieldTitle>
              <RemoveButton
                type="button"
                onClick={() => handleRemoveField(fieldKey)}
                title={t("removeField", "Remove Field")}
              >
                ❌
              </RemoveButton>
            </FieldHeader>

            {supportedLocales.map((lang) => (
              <LangInput key={lang}>
                <Label>{lang.toUpperCase()}:</Label>
                <Input
                  type="text"
                  value={label[lang]}
                  onChange={(e) => handleLabelChange(fieldKey, lang, e.target.value)}
                  placeholder={t(
                    `label${lang.toUpperCase()}`,
                    `Label (${lang})`
                  )}
                />
              </LangInput>
            ))}

            <LangInput>
              <Label>{t("url", "URL")}:</Label>
              <Input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(fieldKey, e.target.value)}
                placeholder={t("urlPlaceholder", "/path")}
              />
            </LangInput>
          </FieldBlock>
        );
      })}
    </Wrapper>
  );
};

export default NestedValueEditor;
// --- Styled Components ---

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

const AddButton = styled.button`
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

const EmptyMessage = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacings.sm};
`;

const FieldTitle = styled.strong`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 1.2rem;
  cursor: pointer;
  transition: opacity ${({ theme }) => theme.transition.fast};
  &:hover {
    opacity: 0.7;
  }
`;

const LangInput = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacings.sm};
  margin: ${({ theme }) => theme.spacings.xs} 0;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
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
