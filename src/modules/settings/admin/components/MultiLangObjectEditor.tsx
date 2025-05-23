"use client";

import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

type MultiLangValue = { tr: string; en: string; de: string };
type MultiLangObjectValue = Record<string, MultiLangValue>;

interface Props {
  value: MultiLangObjectValue;
  setValue: (val: MultiLangObjectValue) => void;
}

export default function MultiLangObjectEditor({ value, setValue }: Props) {
  
  const { t } = useTranslation("adminSettings");

  const handleChange = (
    fieldKey: string,
    lang: keyof MultiLangValue,
    newVal: string
  ) => {
    const existing = value[fieldKey] ?? { tr: "", en: "", de: "" };
    setValue({
      ...value,
      [fieldKey]: {
        ...existing,
        [lang]: newVal,
      },
    });
  };

  return (
    <Wrapper>
      {Object.entries(value).map(([fieldKey, fieldValue]) => (
        <FieldBlock key={fieldKey}>
          <FieldTitle>{fieldKey}</FieldTitle>
          <LangInput>
            <Label>TR:</Label>
            <Input
              type="text"
              value={fieldValue.tr || ""}
              onChange={(e) => handleChange(fieldKey, "tr", e.target.value)}
            />
          </LangInput>
          <LangInput>
            <Label>EN:</Label>
            <Input
              type="text"
              value={fieldValue.en || ""}
              onChange={(e) => handleChange(fieldKey, "en", e.target.value)}
            />
          </LangInput>
          <LangInput>
            <Label>DE:</Label>
            <Input
              type="text"
              value={fieldValue.de || ""}
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

const FieldBlock = styled.div`
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
`;

const FieldTitle = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
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