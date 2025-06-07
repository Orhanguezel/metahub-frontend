"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

type MultiLangValue = { tr: string; en: string; de: string };
type MultiLangObjectValue = Record<string, MultiLangValue>;

interface Props {
  value: MultiLangObjectValue;
  setValue: (val: MultiLangObjectValue) => void;
}

export default function MultiLangObjectEditor({ value, setValue }: Props) {
  const { t } = useTranslation("settings");
  const [newField, setNewField] = useState("");

  // Alan ekleme
  const handleAddField = () => {
    const trimmed = newField.trim();
    if (!trimmed) return;
    if (Object.keys(value).includes(trimmed)) return;
    setValue({
      ...value,
      [trimmed]: { tr: "", en: "", de: "" },
    });
    setNewField("");
  };

  // Alan silme
  const handleRemoveField = (fieldKey: string) => {
    const v = { ...value };
    delete v[fieldKey];
    setValue(v);
  };

  // Alan güncelleme
  const handleChange = (
    fieldKey: string,
    lang: keyof MultiLangValue,
    newVal: string
  ) => {
    setValue({
      ...value,
      [fieldKey]: {
        ...value[fieldKey],
        [lang]: newVal,
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
          onKeyDown={(e) => e.key === "Enter" && handleAddField()}
        />
        <AddFieldButton type="button" onClick={handleAddField}>
          ➕ {t("add", "Add")}
        </AddFieldButton>
      </AddFieldRow>

      {Object.entries(value).length === 0 && (
        <EmptyInfo>{t("noFields", "No fields added yet.")}</EmptyInfo>
      )}

      {Object.entries(value).map(([fieldKey, fieldValue]) => (
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
          <LangInput>
            <Label>TR:</Label>
            <Input
              type="text"
              value={fieldValue.tr || ""}
              placeholder={t("trValue", "Türkçe...")}
              onChange={(e) => handleChange(fieldKey, "tr", e.target.value)}
            />
          </LangInput>
          <LangInput>
            <Label>EN:</Label>
            <Input
              type="text"
              value={fieldValue.en || ""}
              placeholder={t("enValue", "English...")}
              onChange={(e) => handleChange(fieldKey, "en", e.target.value)}
            />
          </LangInput>
          <LangInput>
            <Label>DE:</Label>
            <Input
              type="text"
              value={fieldValue.de || ""}
              placeholder={t("deValue", "Deutsch...")}
              onChange={(e) => handleChange(fieldKey, "de", e.target.value)}
            />
          </LangInput>
        </FieldBlock>
      ))}
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

const AddFieldButton = styled.button`
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

const EmptyInfo = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
  font-style: italic;
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
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
  margin-left: ${({ theme }) => theme.spacing.sm};
  opacity: 0.8;
  transition: opacity 0.15s;
  &:hover {
    opacity: 1;
  }
`;

const LangInput = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.xs} 0;
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
