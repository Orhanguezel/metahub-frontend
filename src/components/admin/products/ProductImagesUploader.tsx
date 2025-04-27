"use client";

import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface Props {
  onImageSelect: (file: File) => void;
  initialUrl?: string;
}

export default function ProductImagesUploader({ onImageSelect, initialUrl }: Props) {
  const { t } = useTranslation("admin");
  const [preview, setPreview] = useState<string | null>(initialUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
    onImageSelect(file);
  };

  return (
    <Wrapper>
      <Label>{t("products.imageLabel")}</Label>
      <Input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && <ImagePreview src={preview} alt="Preview" />}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
`;

const ImagePreview = styled.img`
  max-width: 200px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  margin-top: 0.5rem;
`;

