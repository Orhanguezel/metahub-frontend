"use client";
import React from "react";
import { BlockTitle, Divider, Actions, Primary, Secondary } from "../styled";
import { ImageUploader } from "@/shared";
import type { UploadImage } from "@/modules/recipes/types";

type Props = {
  t: (k: string, d?: string) => string;
  existingUploads: UploadImage[];
  setExistingUploads: (v: UploadImage[]) => void;
  removedExisting: UploadImage[];
  setRemovedExisting: (v: UploadImage[]) => void;
  newFiles: File[];
  setNewFiles: (v: File[]) => void;
  isEdit: boolean;
  onCancel: () => void;
};

export default function ImagesAndActions({
  t, existingUploads, setExistingUploads, removedExisting, setRemovedExisting, newFiles, setNewFiles, isEdit, onCancel
}: Props) {
  return (
    <>
      <Divider />
      <BlockTitle>{t("images", "Images")}</BlockTitle>
      <ImageUploader
        existing={existingUploads}
        onExistingChange={setExistingUploads}
        removedExisting={removedExisting}
        onRemovedExistingChange={setRemovedExisting}
        files={newFiles}
        onFilesChange={setNewFiles}
        maxFiles={10}
        accept="image/*"
        sizeLimitMB={15}
        helpText={t("uploader.help", "jpg/png/webp • sıra korunur")}
      />
      <Actions>
        <Secondary type="button" onClick={onCancel}>{t("cancel","Cancel")}</Secondary>
        <Primary type="submit">{isEdit ? t("update","Update") : t("create","Create")}</Primary>
      </Actions>
    </>
  );
}
