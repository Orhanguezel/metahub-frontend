"use client";

import React from "react";
import styled from "styled-components";

interface Props {
  lang: "tr" | "en" | "de";
  setLang: (lang: "tr" | "en" | "de") => void;
}

const LanguageSelector: React.FC<Props> = ({ lang, setLang }) => {
  return (
    <Select value={lang} onChange={(e) => setLang(e.target.value as "tr" | "en" | "de")}>
      <option value="tr">🇹🇷 Türkçe</option>
      <option value="en">🇬🇧 English</option>
      <option value="de">🇩🇪 Deutsch</option>
    </Select>
  );
};

export default LanguageSelector;

// 💅 Styles
const Select = styled.select`
  padding: 0.4rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
`;
