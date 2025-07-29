"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { getImageSrc } from "@/shared/getImageSrc";
import type { ImageType } from "@/types/image";

interface ProfileImageObj {
  url?: string;
  thumbnail?: string;
  webp?: string;
  publicId?: string;
  [key: string]: any;
}

interface Props {
  defaultImage?: string | ProfileImageObj;
  onChange?: (
    file: File | null,
    removedImage: string | null,
    currentImage: string | null
  ) => void;
  folder?: ImageType; // "profile", "product", "company" vs.
}

const fallbackThumbnail = "/defaults/profile-thumbnail.png";

const SingleImageUploadWithPreview: React.FC<Props> = ({
  defaultImage = "",
  onChange,
  folder = "profile",
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | ProfileImageObj>(
    defaultImage || ""
  );
  const [removedImage, setRemovedImage] = useState<string | null>(null);

  // Eğer props değişirse, güncelle!
  useEffect(() => {
    setExistingImage(defaultImage || "");
  }, [defaultImage]);

  useEffect(() => {
    if (onChange) {
      onChange(file, removedImage, file ? null : (typeof existingImage === "string" ? existingImage : existingImage?.url || null));
    }
    // eslint-disable-next-line
  }, [file, removedImage, existingImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setRemovedImage(typeof existingImage === "string"
      ? existingImage
      : (existingImage as ProfileImageObj)?.url || "");
    setExistingImage(""); // Geçici olarak sıfırla, upload bitince backend'den tekrar gelecek!
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    setRemovedImage(
      typeof existingImage === "string"
        ? existingImage
        : (existingImage as ProfileImageObj)?.url || ""
    );
    setExistingImage("");
    if (onChange) onChange(null, (existingImage as any)?.url || null, null);
  };

  // --- Profile Görseli Çözümleyici (her ihtimali kapsar) ---
  const resolvedProfileImage = useMemo(() => {
    const img = existingImage;

    if (!img) return fallbackThumbnail;

    if (typeof img === "object" && img !== null) {
      if (
        img.thumbnail &&
        typeof img.thumbnail === "string" &&
        img.thumbnail.startsWith("http")
      )
        return img.thumbnail;
      if (
        img.url &&
        typeof img.url === "string" &&
        img.url.startsWith("http")
      )
        return img.url;
      // backend local ise relative path
      return getImageSrc(img.thumbnail || img.url || "", folder);
    }

    if (typeof img === "string") {
      if (!img.trim()) return fallbackThumbnail;
      if (img.startsWith("http")) return img;
      return getImageSrc(img, folder);
    }

    return fallbackThumbnail;
  }, [existingImage, folder]);

  return (
    <Wrapper>
      <FileInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />
      <UploadButton
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={!!file || !!preview}
      >
        {(!preview && !existingImage) ? "+ 1/1" : "Değiştir"}
      </UploadButton>
      <PreviewGrid>
        {(preview || existingImage) && (
          <PreviewBox>
            <RemoveBtn type="button" onClick={removeImage}>
              ×
            </RemoveBtn>
            <ImagePreview
              src={preview ? preview : resolvedProfileImage}
              alt="profile-preview"
            />
          </PreviewBox>
        )}
      </PreviewGrid>
    </Wrapper>
  );
};

export default SingleImageUploadWithPreview;

// --- Styled Components (Aynı Kalabilir) ---
const Wrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacings.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;
const FileInput = styled.input``;
const UploadButton = styled.button<{ disabled?: boolean }>`
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.disabled : theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  padding: ${({ theme }) => theme.spacings.sm}
    ${({ theme }) => theme.spacings.md};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: ${({ theme }) => theme.transition.normal};
  &:hover {
    background: ${({ theme, disabled }) =>
      disabled ? theme.colors.disabled : theme.buttons.primary.backgroundHover};
  }
`;
const PreviewGrid = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
`;
const PreviewBox = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: ${({ theme }) => theme.radii.sm};
  overflow: hidden;
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
const RemoveBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.circle};
  width: 24px;
  height: 24px;
  font-weight: bold;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  &:hover {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
  }
`;
const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
