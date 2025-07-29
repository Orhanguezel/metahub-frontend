"use client";
import React from "react";
import { useAppDispatch } from "@/store/hooks";
import { updateProfileImage } from "@/modules/users/slice/accountSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { accountTranslations } from "@/modules/users";
import { toast } from "react-toastify";
import SingleImageUploadWithPreview from "@/shared/SingleImageUploadWithPreview";

interface Props {
  imageUrl?: string;
}

const ProfileImageUploader: React.FC<Props> = ({ imageUrl }) => {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("account", accountTranslations);

  const handleImageChange = async (file: File | null) => {
    if (file) {
      try {
        await dispatch(updateProfileImage(file)).unwrap();
        toast.success(t("form.imageSuccess"));
      } catch (err: any) {
        toast.error(err?.message || t("form.imageError"));
      }
    }
    // Silme vb. işlem istersen burada genişletirsin.
  };

  return (
    <SingleImageUploadWithPreview
      defaultImage={imageUrl}
      onChange={handleImageChange}
      folder="profile"
    />
  );
};

export default ProfileImageUploader;
