"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

type MultiLangValue = { tr: string; en: string; de: string };
type NestedLinkItem = { label: MultiLangValue; url: string };
type NestedMultiLangLinkValue = Record<string, NestedLinkItem>;

interface Props {
  value: NestedMultiLangLinkValue;
  setValue: (val: NestedMultiLangLinkValue) => void;
}

export default function NestedValueEditor({ value, setValue }: Props) {
  const { t } = useTranslation("settings");
  const [newField, setNewField] = useState("");

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
        label: { tr: "", en: "", de: "" },
        url: "",
      },
    });
    setNewField("");
  };

  const handleRemoveField = (fieldKey: string) => {
    const updated = { ...value };
    delete updated[fieldKey];
    setValue(updated);
  };

  const handleLabelChange = (
    fieldKey: string,
    lang: keyof MultiLangValue,
    val: string
  ) => {
    setValue({
      ...value,
      [fieldKey]: {
        ...value[fieldKey],
        label: {
          ...value[fieldKey].label,
          [lang]: val,
        },
      },
    });
  };

  const handleUrlChange = (fieldKey: string, val: string) => {
    setValue({
      ...value,
      [fieldKey]: {
        ...value[fieldKey],
        url: val,
      },
    });
  };

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
        const label =
          fieldValue.label && typeof fieldValue.label === "object"
            ? fieldValue.label
            : { tr: "", en: "", de: "" };
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

            <LangInput>
              <Label>TR:</Label>
              <Input
                type="text"
                value={label.tr}
                onChange={(e) =>
                  handleLabelChange(fieldKey, "tr", e.target.value)
                }
                placeholder={t("labelTr", "Label (Turkish)")}
              />
            </LangInput>
            <LangInput>
              <Label>EN:</Label>
              <Input
                type="text"
                value={label.en}
                onChange={(e) =>
                  handleLabelChange(fieldKey, "en", e.target.value)
                }
                placeholder={t("labelEn", "Label (English)")}
              />
            </LangInput>
            <LangInput>
              <Label>DE:</Label>
              <Input
                type="text"
                value={label.de}
                onChange={(e) =>
                  handleLabelChange(fieldKey, "de", e.target.value)
                }
                placeholder={t("labelDe", "Label (German)")}
              />
            </LangInput>
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
}

// 🎨 Styled Components

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AddFieldRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NewFieldInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const AddButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
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
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const FieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
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
  gap: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.xs} 0;

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
  padding: ${({ theme }) => theme.spacing.sm};
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
