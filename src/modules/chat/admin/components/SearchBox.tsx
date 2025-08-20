"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";

type Props = {
  placeholder?: string;
  onSearch: (term: string) => void;
  delayMs?: number;
};

export default function SearchBox({ placeholder, onSearch, delayMs = 300 }: Props) {
  const { t } = useI18nNamespace("chat", translations);
  const [val, setVal] = useState("");

  useEffect(() => {
    const tm = setTimeout(() => onSearch(val), delayMs);
    return () => clearTimeout(tm);
  }, [val, delayMs, onSearch]);

  const finalPlaceholder =
    placeholder ?? t("admin.search_placeholder", "Mesajlarda ara...");

  return (
    <Form role="search" aria-label={t("admin.search_aria", "Sohbet arama")}>
      <InputWrap>
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={finalPlaceholder}
          aria-label={finalPlaceholder}
        />
      </InputWrap>
    </Form>
  );
}

const Form = styled.form`
  margin: 0;
`;

const InputWrap = styled.div`
  display:flex; align-items:center; gap:${({theme})=>theme.spacings.xs};
  background:${({theme})=>theme.colors.inputBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  border-radius:${({theme})=>theme.radii.md};
  padding: 6px 10px;
  &:focus-within{
    border-color:${({theme})=>theme.colors.inputBorderFocus};
    box-shadow:${({theme})=>theme.colors.shadowHighlight};
    background:${({theme})=>theme.colors.inputBackgroundFocus};
  }
`;

const Input = styled.input`
  width:100%; border:none; outline:none;
  font-size:${({theme})=>theme.fontSizes.sm};
  background:transparent; color:${({theme})=>theme.colors.text};
  &::placeholder{ color:${({theme})=>theme.colors.placeholder}; }
`;
