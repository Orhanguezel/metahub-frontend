"use client";
import ImageUploader from "../../ImageUploader";
import { Row, Label, Req } from "../FormUI";
import type { IApartmentImage } from "@/modules/apartment/types";

export default function MediaSection({
  t, isEdit, existingImages, setExistingImages, removedExisting, setRemovedExisting, newFiles, setNewFiles,
}: {
  t: (k: string, d?: string) => string;
  isEdit: boolean;
  existingImages: IApartmentImage[];
  setExistingImages: (arr: IApartmentImage[]) => void;
  removedExisting: IApartmentImage[];
  setRemovedExisting: (arr: IApartmentImage[]) => void;
  newFiles: File[];
  setNewFiles: (arr: File[]) => void;
}) {
  return (
    <Row>
      <Label>{t("form.images", "Images")} {!isEdit && <Req>*</Req>}</Label>
      <ImageUploader
        existing={existingImages}
        onExistingChange={setExistingImages}
        removedExisting={removedExisting}
        onRemovedExistingChange={setRemovedExisting}
        files={newFiles}
        onFilesChange={setNewFiles}
        accept="image/*"
        maxFiles={10}
      />
    </Row>
  );
}
