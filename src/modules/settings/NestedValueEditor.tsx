"use client";

import React from "react";
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
  const { t } = useTranslation("adminSettings");

  const handleAddField = () => {
    const newKey = prompt(t("enterFieldName", "Enter field name"));
    if (!newKey) return;
    if (value[newKey]) {
      alert(t("fieldExists", "This field already exists."));
      return;
    }
    setValue({
      ...value,
      [newKey]: {
        label: { tr: "", en: "", de: "" },
        url: "",
      },
    });
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
      <AddButton type="button" onClick={handleAddField}>
        ➕ {t("addField", "Add Field")}
      </AddButton>

      {Object.keys(value).length === 0 && (
        <EmptyMessage>{t("noFields", "No fields added yet.")}</EmptyMessage>
      )}

      {Object.entries(value).map(([fieldKey, { label, url }]) => (
        <FieldBlock key={fieldKey}>
          <FieldHeader>
            <strong>{fieldKey}</strong>
            <RemoveButton type="button" onClick={() => handleRemoveField(fieldKey)}>
              ❌
            </RemoveButton>
          </FieldHeader>

          <LangInput>
            <label>TR:</label>
            <input
              type="text"
              value={label.tr}
              onChange={(e) => handleLabelChange(fieldKey, "tr", e.target.value)}
              placeholder={t("labelTr", "Label (Turkish)")}
            />
          </LangInput>
          <LangInput>
            <label>EN:</label>
            <input
              type="text"
              value={label.en}
              onChange={(e) => handleLabelChange(fieldKey, "en", e.target.value)}
              placeholder={t("labelEn", "Label (English)")}
            />
          </LangInput>
          <LangInput>
            <label>DE:</label>
            <input
              type="text"
              value={label.de}
              onChange={(e) => handleLabelChange(fieldKey, "de", e.target.value)}
              placeholder={t("labelDe", "Label (German)")}
            />
          </LangInput>

          <LangInput>
            <label>{t("url", "URL")}:</label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(fieldKey, e.target.value)}
              placeholder={t("urlPlaceholder", "/path")}
            />
          </LangInput>
        </FieldBlock>
      ))}
    </Wrapper>
  );
}



const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AddButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
`;

const EmptyMessage = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FieldBlock = styled.div`
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const FieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: red;
  font-size: 1.2rem;
  cursor: pointer;
`;

const LangInput = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.xs} 0;

  label {
    width: 30px;
  }

  input {
    flex: 1;
    padding: ${({ theme }) => theme.spacing.sm};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;
