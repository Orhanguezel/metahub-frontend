"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";

type Props = {
  placeholder?: string;
  onSearch: (term: string) => void;
  delayMs?: number;
};

export default function SearchBox({ placeholder = "Search...", onSearch, delayMs = 300 }: Props) {
  const [val, setVal] = useState("");

  useEffect(() => {
    const t = setTimeout(() => onSearch(val), delayMs);
    return () => clearTimeout(t);
  }, [val, delayMs, onSearch]);

  return (
    <InputWrap>
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
      />
    </InputWrap>
  );
}

const InputWrap = styled.div`
  display:flex; align-items:center;
  background:${({theme})=>theme.colors.inputBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  border-radius:${({theme})=>theme.radii.md};
  padding: 6px 10px;
`;

const Input = styled.input`
  width:100%; border:none; outline:none;
  font-size:${({theme})=>theme.fontSizes.sm};
  background:transparent; color:${({theme})=>theme.colors.text};
  &::placeholder{ color:${({theme})=>theme.colors.placeholder}; }
`;
