"use client";

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

type SocialLinkItem = { url: string; icon: string };
type SocialLinksValue = Record<string, SocialLinkItem>;

interface Props {
  value: SocialLinksValue;
  setValue: (val: SocialLinksValue) => void;
}

export default function NestedSocialLinksEditor({ value, setValue }: Props) {
  const { t } = useTranslation("adminSettings");

  const handleAddField = () => {
    const newKey = prompt(t("enterSocialName", "Enter social platform name (e.g., facebook)"));
    if (!newKey) return;
    if (value[newKey]) {
      alert(t("fieldExists", "This field already exists."));
      return;
    }
    setValue({
      ...value,
      [newKey]: {
        url: "",
        icon: "",
      },
    });
  };

  const handleRemoveField = (fieldKey: string) => {
    const updated = { ...value };
    delete updated[fieldKey];
    setValue(updated);
  };

  const handleChange = (
    fieldKey: string,
    field: keyof SocialLinkItem,
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
      <AddButton type="button" onClick={handleAddField}>
        ➕ {t("addSocial", "Add Social Link")}
      </AddButton>

      {Object.keys(value).length === 0 && (
        <EmptyMessage>{t("noSocialLinks", "No social links added yet.")}</EmptyMessage>
      )}

      {Object.entries(value).map(([fieldKey, { url, icon }]) => (
        <FieldBlock key={fieldKey}>
          <FieldHeader>
            <strong>{fieldKey}</strong>
            <RemoveButton type="button" onClick={() => handleRemoveField(fieldKey)}>
              ❌
            </RemoveButton>
          </FieldHeader>

          <LangInput>
            <label>{t("url", "URL")}:</label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleChange(fieldKey, "url", e.target.value)}
              placeholder={t("urlPlaceholder", "https://...")}
            />
          </LangInput>

          <LangInput>
            <label>{t("icon", "Icon")}:</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => handleChange(fieldKey, "icon", e.target.value)}
              placeholder={t("iconPlaceholder", "e.g., facebook, twitter")}
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
    width: 60px;
  }

  input {
    flex: 1;
    padding: ${({ theme }) => theme.spacing.sm};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.sm};
  }
`;
