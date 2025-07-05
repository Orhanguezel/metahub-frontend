"use client";

import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../locales";

// Social link alanı tipi
interface SocialLinkField {
  url: string;
  icon: string;
}

// Props tipi
interface NestedSocialLinksEditorProps {
  value: Record<string, SocialLinkField>;
  setValue: (val: Record<string, SocialLinkField>) => void;
}

const NestedSocialLinksEditor: React.FC<NestedSocialLinksEditorProps> = ({
  value,
  setValue,
}) => {
  const { i18n, t } = useI18nNamespace("settings", translations);
  const [newField, setNewField] = useState<string>("");

  // Add new social link field
  const handleAddField = () => {
    const trimmed = newField.trim();
    if (!trimmed) return;
    if (value?.[trimmed]) {
      alert(t("fieldExists", "This field already exists."));
      return;
    }
    setValue({
      ...value,
      [trimmed]: { url: "", icon: "" },
    });
    setNewField("");
  };

  // Remove a social link field
  const handleRemoveField = (fieldKey: string) => {
    const updated = { ...value };
    delete updated[fieldKey];
    setValue(updated);
  };

  // Update social link field value
  const handleChange = (
    fieldKey: string,
    field: keyof SocialLinkField,
    val: string
  ) => {
    setValue({
      ...value,
      [fieldKey]: {
        ...value[fieldKey],
        [field]: val,
      },
    });
  };

  return (
    <Wrapper>
      <AddFieldRow>
        <NewFieldInput
          type="text"
          value={newField}
          placeholder={t("enterSocialName", "Platform name (e.g. facebook)")}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setNewField(e.target.value)
          }
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              handleAddField();
            }
          }}
        />
        <AddFieldButton
          type="button"
          onClick={handleAddField}
          disabled={!newField.trim()}
        >
          ➕ {t("addSocial", "Add Social Link")}
        </AddFieldButton>
      </AddFieldRow>

      {(!value || Object.keys(value).length === 0) && (
        <EmptyMessage>
          {t("noSocialLinks", "No social links added yet.")}
        </EmptyMessage>
      )}

      {Object.entries(value || {}).map(([fieldKey, { url, icon }]) => (
        <FieldBlock key={fieldKey}>
          <FieldHeader>
            <FieldTitle>{fieldKey}</FieldTitle>
            <RemoveButton
              type="button"
              title={t("removeField", "Remove field")}
              onClick={() => handleRemoveField(fieldKey)}
            >
              ❌
            </RemoveButton>
          </FieldHeader>

          <InputGroup>
            <Label>{t("url", "URL")}:</Label>
            <Input
              type="text"
              value={url}
              autoComplete="off"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange(fieldKey, "url", e.target.value)
              }
              placeholder={t("urlPlaceholder", "https://...")}
            />
          </InputGroup>

          <InputGroup>
            <Label>{t("icon", "Icon")}:</Label>
            <Input
              type="text"
              value={icon}
              autoComplete="off"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange(fieldKey, "icon", e.target.value)
              }
              placeholder={t("iconPlaceholder", "e.g. facebook, twitter")}
            />
          </InputGroup>
        </FieldBlock>
      ))}
    </Wrapper>
  );
};

export default NestedSocialLinksEditor;

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

interface AddFieldButtonProps {
  disabled?: boolean;
}

const AddFieldButton = styled.button<AddFieldButtonProps>`
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  &:hover:not(:disabled) {
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

const InputGroup = styled.div`
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
  width: 60px;
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
