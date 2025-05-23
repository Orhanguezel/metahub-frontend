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
    const newKey = prompt(
      t("enterSocialName", "Enter social platform name (e.g., facebook)")
    );
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
        <EmptyMessage>
          {t("noSocialLinks", "No social links added yet.")}
        </EmptyMessage>
      )}

      {Object.entries(value).map(([fieldKey, { url, icon }]) => (
        <FieldBlock key={fieldKey}>
          <FieldHeader>
            <FieldTitle>{fieldKey}</FieldTitle>
            <RemoveButton
              type="button"
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
              onChange={(e) => handleChange(fieldKey, "url", e.target.value)}
              placeholder={t("urlPlaceholder", "https://...")}
            />
          </InputGroup>

          <InputGroup>
            <Label>{t("icon", "Icon")}:</Label>
            <Input
              type="text"
              value={icon}
              onChange={(e) => handleChange(fieldKey, "icon", e.target.value)}
              placeholder={t("iconPlaceholder", "e.g., facebook, twitter")}
            />
          </InputGroup>
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
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
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
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
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

const InputGroup = styled.div`
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
  width: 60px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
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
