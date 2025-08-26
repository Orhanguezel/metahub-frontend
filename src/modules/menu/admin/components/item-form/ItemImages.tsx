"use client";
import { BlockTitle } from "./ItemForm.styles";
import { ImageUploader } from "@/shared";

type UploadImage = { url: string; thumbnail?: string; webp?: string; publicId?: string };

type Props = {
  t: (k: string, d?: string)=>string;
  existingUploads: UploadImage[];
  setExistingUploads: (v: UploadImage[]) => void;
  removedExisting: UploadImage[];
  setRemovedExisting: (v: UploadImage[]) => void;
  newFiles: File[];
  setNewFiles: (v: File[]) => void;
};

export default function ItemImages({
  t, existingUploads, setExistingUploads, removedExisting, setRemovedExisting, newFiles, setNewFiles
}: Props) {
  return (
    <>
      <BlockTitle>{t("images","Images")}</BlockTitle>
      <ImageUploader
        existing={existingUploads}
        onExistingChange={setExistingUploads}
        removedExisting={removedExisting}
        onRemovedExistingChange={setRemovedExisting}
        files={newFiles}
        onFilesChange={setNewFiles}
        maxFiles={8}
        accept="image/*"
        sizeLimitMB={15}
        helpText={t("uploader.help","jpg/png/webp • keeps order")}
      />
    </>
  );
}
