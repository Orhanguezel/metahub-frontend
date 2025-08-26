// src/modules/menu/admin/components/CategoryForm.tsx
"use client";
import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";

import type { SupportedLocale, TranslatedLabel as CommonTL } from "@/types/common";

import type {
  IMenuCategory,
  MenuCategoryCreatePayload,
  MenuCategoryUpdatePayload,
} from "@/modules/menu/types/menucategory";

import { ImageUploader, JSONEditor } from "@/shared";
import { getUILang, setTL, makeTL } from "@/i18n/getUILang";

/* ---------------- utils ---------------- */
const getTLStrict = (obj?: Partial<CommonTL>, l?: SupportedLocale) =>
  l ? obj?.[l] ?? "" : "";

type UploadImage = { url: string; thumbnail?: string; webp?: string; publicId?: string };

type Props = {
  isOpen: boolean;
  editingItem: IMenuCategory | null;
  onClose: () => void;
  onSubmit: (
    payload: MenuCategoryCreatePayload | MenuCategoryUpdatePayload | FormData,
    id?: string
  ) => Promise<void> | void;
};

export default function CategoryForm({
  isOpen,
  editingItem,
  onClose,
  onSubmit,
}: Props) {
  const { t, i18n } = useI18nNamespace("menu", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);
  const isEdit = Boolean(editingItem?._id);

  /* ---------- mode ---------- */
  const [editMode, setEditMode] = useState<"simple" | "json">("simple");

  /* ---------- basic fields (CommonTL: tüm diller zorunlu -> setTL uyumlu) ---------- */
  const [code, setCode] = useState<string>("");
  const [order, setOrder] = useState<number>(0);
  const [name, setName] = useState<CommonTL>(makeTL());
  const [description, setDescription] = useState<CommonTL>(makeTL());

  /* ---------- images ---------- */
  const [existingUploads, setExistingUploads] = useState<UploadImage[]>([]);
  const [removedExisting, setRemovedExisting] = useState<UploadImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  /* ---------- load on change ---------- */
  useEffect(() => {
    if (editingItem) {
      setCode(editingItem.code ?? "");
      setOrder(Number(editingItem.order ?? 0));
      // menucategory.TranslatedLabel (partial) -> CommonTL normalize
      setName(makeTL(editingItem.name as Partial<CommonTL>));
      setDescription(makeTL((editingItem.description as Partial<CommonTL>) || {}));
      setExistingUploads(((editingItem.images as any) || []) as UploadImage[]);
      setRemovedExisting([]);
      setNewFiles([]);
    } else {
      setCode(`CAT-${Date.now().toString(36).toUpperCase()}`);
      setOrder(0);
      setName(makeTL());
      setDescription(makeTL());
      setExistingUploads([]);
      setRemovedExisting([]);
      setNewFiles([]);
    }
  }, [editingItem]);

  /* ---------- JSON editor glue (hooks BEFORE any early return) ---------- */
  const emptyTL = useMemo<CommonTL>(() => makeTL(), []);

  const fullJSONValue = useMemo(() => {
    return {
      code,
      name,
      description,
      order,
      // images uploader ile yönetilir
    };
  }, [code, name, description, order]);

  const jsonPlaceholder = useMemo(() => {
    const base: any = {
      code: "CAT-XXXX",
      name: emptyTL,
      description: emptyTL,
      order: 0,
    };
    return JSON.stringify(base, null, 2);
  }, [emptyTL]);

  const onFullJSONChange = (v: any) => {
    if (!v || typeof v !== "object") return;
    if (!isEdit && typeof v.code !== "undefined") setCode(String(v.code || ""));
    setName(makeTL(v.name as Partial<CommonTL>));
    setDescription(makeTL((v.description as Partial<CommonTL>) || {}));
    setOrder(Number(v.order || 0));
  };

  /* ---------- submit ---------- */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit && !code.trim()) {
      alert(t("validation.code_required", "Code is required"));
      return;
    }

    const shouldUseFD = newFiles.length > 0 || removedExisting.length > 0;

    if (isEdit && editingItem?._id) {
      if (shouldUseFD) {
        const fd = new FormData();
        fd.append("name", JSON.stringify(name));
        fd.append("description", JSON.stringify(description));
        fd.append("order", String(Number(order) || 0));
        newFiles.forEach((f) => fd.append("images", f));
        if (removedExisting.length) {
          const urls = removedExisting.map((x) => x.url).filter(Boolean);
          if (urls.length) fd.append("removedImages", JSON.stringify(urls));
        }
        await onSubmit(fd, editingItem._id);
      } else {
        const payload: MenuCategoryUpdatePayload = {
          name,          // CommonTL -> menucategory.TranslatedLabel (partial) ile uyumlu
          description,   // CommonTL -> menucategory.TranslatedLabel (partial) ile uyumlu
          order: Number(order) || 0,
        };
        await onSubmit(payload, editingItem._id);
      }
    } else {
      if (shouldUseFD) {
        const fd = new FormData();
        fd.append("code", code.trim());
        fd.append("name", JSON.stringify(name));
        fd.append("description", JSON.stringify(description));
        fd.append("order", String(Number(order) || 0));
        newFiles.forEach((f) => fd.append("images", f));
        await onSubmit(fd);
      } else {
        const payload: MenuCategoryCreatePayload = {
          code: code.trim(),
          name,          // CommonTL -> menucategory.TranslatedLabel (partial) ile uyumlu
          description,   // CommonTL -> menucategory.TranslatedLabel (partial) ile uyumlu
          order: Number(order) || 0,
        };
        await onSubmit(payload);
      }
    }

    onClose();
  };

  /* ---------- early return AFTER hooks ---------- */
  if (!isOpen) return null;

  return (
    <Form onSubmit={submit}>
      {/* Mode toggle */}
      <ModeRow role="radiogroup" aria-label={t("editMode", "Edit Mode")}>
        <ModeBtn
          type="button"
          aria-pressed={editMode === "simple"}
          $active={editMode === "simple"}
          onClick={() => setEditMode("simple")}
        >
          {t("simpleMode", "Basit")}
        </ModeBtn>
        <ModeBtn
          type="button"
          aria-pressed={editMode === "json"}
          $active={editMode === "json"}
          onClick={() => setEditMode("json")}
        >
          {t("jsonMode", "JSON Editor")}
        </ModeBtn>
      </ModeRow>

      {/* SIMPLE */}
      {editMode === "simple" && (
        <>
          <Row>
            <Col>
              <Label>{t("code", "Code")}</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={isEdit} />
            </Col>
            <Col>
              <Label>{t("order", "Order")}</Label>
              <Input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value) || 0)}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Label>
                {t("category_name", "Category Name")} ({lang})
              </Label>
              <Input
                value={getTLStrict(name, lang)}
                onChange={(e) => setName(setTL(name, lang, e.target.value))}
              />
            </Col>
            <Col>
              <Label>
                {t("category_desc", "Description")} ({lang})
              </Label>
              <TextArea
                rows={2}
                value={getTLStrict(description, lang)}
                onChange={(e) => setDescription(setTL(description, lang, e.target.value))}
              />
            </Col>
          </Row>

          {/* Images */}
          <SectionTitle>{t("images", "Images")}</SectionTitle>
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
            helpText={t("uploader.help", "jpg/png/webp • keeps order")}
          />
        </>
      )}

      {/* JSON */}
      {editMode === "json" && (
        <JSONEditor
          label={t("advanced_json", "Full JSON (advanced)")}
          value={fullJSONValue}
          onChange={onFullJSONChange}
          placeholder={jsonPlaceholder}
        />
      )}

      <Actions>
        <Secondary type="button" onClick={onClose}>
          {t("cancel", "Cancel")}
        </Secondary>
        <Primary type="submit">
          {isEdit ? t("update", "Update") : t("create", "Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* ---------------- styled ---------------- */
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
  min-width: 360px;
`;
const ModeRow = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacings.xs};
`;
const ModeBtn = styled.button<{ $active: boolean }>`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.inputBackgroundLight};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
`;
const SectionTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;
const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;
const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;
const TextArea = styled.textarea`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;
const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: flex-end;
`;
const Primary = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;
const Secondary = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;
