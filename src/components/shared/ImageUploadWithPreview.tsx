"use client";

import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { getImageSrc } from "@/utils/getImageSrc";

interface Props {
  max?: number;
  defaultImages?: string[];
  onChange?: (files: File[], removedImages: string[]) => void;
}

const ImageUploadWithPreview: React.FC<Props> = ({
  max = 5,
  defaultImages = [],
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(defaultImages);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  useEffect(() => {
    if (onChange) {
      onChange(files, removedImages);
    }
  }, [files, removedImages, onChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const total = files.length + newFiles.length;
    if (total > max) return;

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    const updatedFiles = [...files];
    const updatedPreviews = [...previews];
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  return (
    <Wrapper>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFileChange}
      />
      <UploadButton
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={files.length + existingImages.length >= max}
      >
        + {files.length + existingImages.length}/{max}
      </UploadButton>

      <PreviewGrid>
        {existingImages.map((url, i) => (
          <PreviewBox key={`existing-${i}`}>
            <RemoveBtn onClick={() => removeExistingImage(url)}>×</RemoveBtn>
            <ImagePreview src={getImageSrc(url, "blog")} alt={`image-${i}`} />
          </PreviewBox>
        ))}

        {previews.map((src, i) => (
          <PreviewBox key={`preview-${i}`}>
            <RemoveBtn onClick={() => removeNewImage(i)}>×</RemoveBtn>
            <ImagePreview src={src} alt={`preview-${i}`} />
          </PreviewBox>
        ))}
      </PreviewGrid>
    </Wrapper>
  );
};

export default ImageUploadWithPreview;

const Wrapper = styled.div`
  margin-top: 1rem;
`;

const UploadButton = styled.button<{ disabled?: boolean }>`
  background: ${({ theme, disabled }) => (disabled ? "#aaa" : theme.primary)};
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  margin-bottom: 1rem;
`;

const PreviewGrid = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const PreviewBox = styled.div`
  position: relative;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-weight: bold;
  cursor: pointer;
`;

const ImagePreview = styled.img`
  width: 100px;
  height: auto;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
`;

