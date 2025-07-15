"use client";

import { useState, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateProfileImage } from "@/modules/users/slice/accountSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import {accountTranslations} from "@/modules/users";
import { toast } from "react-toastify";
import { getImageSrc } from "@/shared/getImageSrc";
import type { ProfileImageObj } from "@/modules/users/types/auth";
import {
  Wrapper,
  ImagePreview, 
  FileInput,
  Button,
} from "@/modules/users/styles/AccountStyles";

interface Props {
  imageUrl?: string | ProfileImageObj;
}

export default function ProfileImageUploader({ imageUrl }: Props) {
  const dispatch = useAppDispatch();
 const { t } = useI18nNamespace("account", accountTranslations);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (filePreview) return filePreview;
    if (!imageUrl) return getImageSrc(undefined, "profile");
    if (typeof imageUrl === "object" && imageUrl !== null) {
      if (imageUrl.thumbnail && imageUrl.thumbnail.startsWith("http"))
        return imageUrl.thumbnail;
      if (imageUrl.url && imageUrl.url.startsWith("http")) return imageUrl.url;
      if (imageUrl.thumbnail && imageUrl.thumbnail.startsWith("/"))
        return getImageSrc(imageUrl.thumbnail, "profile");
      if (imageUrl.url && imageUrl.url.startsWith("/"))
        return getImageSrc(imageUrl.url, "profile");
      return getImageSrc(undefined, "profile");
    }
    if (typeof imageUrl === "string") {
      if (imageUrl.startsWith("http")) return imageUrl;
      return getImageSrc(imageUrl, "profile");
    }
    return getImageSrc(undefined, "profile");
  }, [imageUrl, filePreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setFilePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await dispatch(updateProfileImage(file)).unwrap();
      toast.success(t("form.imageSuccess"));
      setFile(null);
      setFilePreview(null);
    } catch (err: any) {
      toast.error(err?.message || t("form.imageError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper style={{ alignItems: "center" }}>
      <ImagePreview src={previewUrl} alt="Profile" />
      <FileInput type="file" accept="image/*" onChange={handleChange} />
      <Button onClick={handleUpload} disabled={!file || loading}>
        {loading ? t("form.loading") : t("form.upload")}
      </Button>
    </Wrapper>
  );
}
