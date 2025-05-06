"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateProfileImage } from "@/store/user/accountSlice";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getImageSrc } from "@/utils/getImageSrc";

interface Props {
  imageUrl?: string;
}

export default function ProfileImageUploader({ imageUrl }: Props) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("account");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await dispatch(updateProfileImage(file)).unwrap();
      toast.success(t("form.imageSuccess"));
      setFile(null);
    } catch (err: any) {
      toast.error(err?.message || t("form.imageError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Image src={getImageSrc(imageUrl)} alt="Profile" />
      <FileInput type="file" onChange={handleChange} />
      <Button onClick={handleUpload} disabled={!file || loading}>
        {loading ? t("form.loading") : t("form.upload")}
      </Button>
    </Wrapper>
  );
}

// 🎨 styled-components

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Image = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.circle};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    opacity: ${({ theme }) => theme.opacity.hover};
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.whiteColor};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;
