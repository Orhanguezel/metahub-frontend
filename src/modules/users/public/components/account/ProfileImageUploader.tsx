"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateProfileImage,removeProfileImage } from "@/modules/users/slice/accountSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import accountTranslations from "@/modules/users/locales/account";
import { toast } from "react-toastify";
import { Wrapper, ImagePreview, FileInput, Button } from "@/modules/users/styles/AccountStyles";
import { resolveProfileImage } from "@/shared/resolveProfileImage";
import type { ProfileImageObj } from "@/modules/users/types/user";

interface Props {
  imageUrl?: string | ProfileImageObj | null;
}

const fallbackThumbnail = "/defaults/profile-thumbnail.png";

const ProfileImageUploader: React.FC<Props> = ({ imageUrl }) => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("account", accountTranslations);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State: gerçek yüklü resim (backend’den gelen/varsayılan)
  const [originalImage, setOriginalImage] = useState<string>(resolveProfileImage(imageUrl));
  // State: preview (henüz yüklenmemiş, sadece seçilmiş dosya)
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // imageUrl dışarıdan güncellenirse resetle
  useEffect(() => {
    setOriginalImage(resolveProfileImage(imageUrl));
    setPreview(null);
    setFile(null);
  }, [imageUrl]);

  // Dosya seçilince preview oluştur
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // Fotoğrafı yükle (dispatch)
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await dispatch(updateProfileImage(file)).unwrap();
      toast.success(t("form.imageSuccess"));
      // Güncel yüklenmiş resmi state’e ata, preview’i sıfırla
      setOriginalImage(resolveProfileImage(res?.profileImage));
      setPreview(null);
      setFile(null);
    } catch (err: any) {
      toast.error(err?.message || t("form.imageError"));
    } finally {
      setLoading(false);
    }
  };

  // Preview veya yüklenmiş fotoğrafı kaldır
  const handleRemove = async () => {
  setLoading(true);
  try {
    await dispatch(removeProfileImage()).unwrap();
    toast.success(t("form.imageRemoveSuccess", "Profil fotoğrafı silindi."));
    setOriginalImage(fallbackThumbnail);
    setPreview(null);
    setFile(null);
  } catch (err: any) {
    toast.error(err?.message || t("form.imageError"));
  } finally {
    setLoading(false);
  }
};
  // Hangi resmi gösterelim?
  const showImage = useMemo(
    () => preview || originalImage || fallbackThumbnail,
    [preview, originalImage]
  );

  // --- Render ---
  return (
    <Wrapper style={{ alignItems: "center" }}>
      <ImagePreview src={showImage} alt="Profile" />
      <FileInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}>
        {t("form.chooseImage", "Fotoğraf Seç")}
      </Button>
      {file && (
        <Button
          onClick={handleUpload}
          disabled={loading}
          style={{ marginLeft: 8 }}
        >
          {loading ? t("form.loading", "Yükleniyor...") : t("form.upload", "Yükle")}
        </Button>
      )}
      {(preview || originalImage !== fallbackThumbnail) && (
        <Button
          type="button"
          onClick={handleRemove}
          disabled={loading}
          style={{ marginLeft: 8, background: "#f55" }}
        >
          {t("form.remove", "Sil")}
        </Button>
      )}
    </Wrapper>
  );
};

export default ProfileImageUploader;
