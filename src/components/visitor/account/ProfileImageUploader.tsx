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
      toast.success(t("form.success"));
      setFile(null);
    } catch (err: any) {
      toast.error(err?.message || t("form.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Image src={getImageSrc(imageUrl)} alt="Profile" />
      <Input type="file" onChange={handleChange} />
      <Button onClick={handleUpload} disabled={!file || loading}>
        {loading ? t("form.loading") : t("form.upload")}
      </Button>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Image = styled.img`
  max-width: 120px;
  border-radius: 50%;
  margin-bottom: 1rem;
  border: 2px solid ${({ theme }) => theme.border || "#ccc"};
`;

const Input = styled.input`
  padding: 0.5rem 0;
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
