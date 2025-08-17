"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/massage";
import type {IMassage } from "@/modules/massage/types";
import { JSONEditor, ImageUploader } from "@/shared";
import type { UploadImage as UploaderImage } from "@/shared/ImageUploader";
import type { ImageType } from "@/types/image";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: IMassage | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

type TL = Partial<Record<SupportedLocale, string>>;
const toTL = (v: any, lang: SupportedLocale): TL =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as TL) : v ? ({ [lang]: String(v) } as TL) : {};
const getTLStrict = (obj?: TL, l?: SupportedLocale) => (l ? (obj?.[l] ?? "") : "");
const setTL = (obj: TL | undefined, l: SupportedLocale, val: string): TL => ({ ...(obj || {}), [l]: val });

export default function FormModal({ isOpen, onClose, editingItem, onSubmit }: Props) {
  const { i18n, t } = useI18nNamespace("massage", translations);
  const uiLang = useMemo<SupportedLocale>(() => (i18n.language?.slice(0, 2) as SupportedLocale) || "tr", [i18n?.language]);

  // store-read only
  const categories = useAppSelector((s) => s.massageCategory.categories);
  const successMessage = useAppSelector((s) => s.massage.successMessage);
  const error = useAppSelector((s) => s.massage.error);
  const currentUser = useAppSelector((s) => s.account.profile);

  const isEdit = Boolean(editingItem?._id);
  const [editMode, setEditMode] = useState<"simple" | "json">("simple");

  // çok dilli alanlar
  const [title, setTitle] = useState<TL>((editingItem?.title as TL) || {});
  const [summary, setSummary] = useState<TL>((editingItem?.summary as TL) || {});
  const [content, setContent] = useState<TL>((editingItem?.content as TL) || {});

  // diğer alanlar
  const [author, setAuthor] = useState<string>(editingItem?.author || currentUser?.name || "");
  const [tags, setTags] = useState<string>(editingItem?.tags?.join(", ") || "");
  const [price, setPrice] = useState<number | undefined>(editingItem?.price ?? undefined);
  const [durationMinutes, setDuration] = useState<number | undefined>(editingItem?.durationMinutes ?? undefined);
  const [categoryId, setCategoryId] = useState<string>(
    typeof editingItem?.category === "string" ? editingItem?.category : (editingItem?.category as any)?._id || ""
  );
  const [isPublished, setIsPublished] = useState<boolean>(editingItem?.isPublished ?? true);

  // ImageUploader state’leri
  const [existing, setExisting] = useState<UploaderImage[]>(
    () =>
      (editingItem?.images || []).map((img) => ({
        url: img.url,
        thumbnail: img.thumbnail,
        webp: img.webp,
        publicId: img.publicId,
        type: "massage" as ImageType,
      }))
  );
  const [removedExisting, setRemovedExisting] = useState<UploaderImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  // editingItem değişince formu resetle
  useEffect(() => {
    if (!isOpen) return;

    setTitle((editingItem?.title as TL) || {});
    setSummary((editingItem?.summary as TL) || {});
    setContent((editingItem?.content as TL) || {});

    setAuthor(editingItem?.author || currentUser?.name || "");
    setTags(editingItem?.tags?.join(", ") || "");
    setPrice(editingItem?.price ?? undefined);
    setDuration(editingItem?.durationMinutes ?? undefined);
    setCategoryId(
      typeof editingItem?.category === "string" ? editingItem.category : (editingItem?.category as any)?._id || ""
    );
    setIsPublished(editingItem?.isPublished ?? true);

    setExisting(
      (editingItem?.images || []).map((img) => ({
        url: img.url,
        thumbnail: img.thumbnail,
        webp: img.webp,
        publicId: img.publicId,
        type: "massage" as ImageType,
      }))
    );
    setRemovedExisting([]);
    setFiles([]);
    setEditMode("simple");
  }, [editingItem, isOpen, currentUser]);

  // toast
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      onClose();
    } else if (error) {
      toast.error(error);
    }
  }, [successMessage, error, onClose]);

  // JSON editor — tek obje
  const combinedJSONValue = useMemo(() => ({ title, summary, content }), [title, summary, content]);
  const onCombinedJSONChange = (v: any) => {
    setTitle(toTL(v?.title, uiLang));
    setSummary(toTL(v?.summary, uiLang));
    setContent(toTL(v?.content, uiLang));
  };

  // kategori label’ları
  const catOpts = useMemo(
    () => (categories || []).map((c) => ({ id: c._id, label: c.name?.[uiLang] || c.slug || c._id })),
    [categories, uiLang]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();

    fd.append("title", JSON.stringify(title || {}));
    fd.append("summary", JSON.stringify(summary || {}));
    fd.append("content", JSON.stringify(content || {}));
    fd.append("author", (author || "").trim());
    if (typeof durationMinutes === "number") fd.append("durationMinutes", String(durationMinutes));
    if (typeof price === "number") fd.append("price", String(price));

    fd.append(
      "tags",
      JSON.stringify(
        (tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );
    if (categoryId) fd.append("category", categoryId);
    fd.append("isPublished", String(Boolean(isPublished)));

    // yeni dosyalar
    files.forEach((f) => fd.append("images", f));

    // kaldırılan mevcut görseller
    if (removedExisting.length) {
      fd.append(
        "removedImages",
        JSON.stringify(removedExisting.map((x) => ({ url: x.url, publicId: x.publicId })))
      );
      const pids = removedExisting.map((x) => x.publicId).filter(Boolean) as string[];
      if (pids.length) fd.append("removedPublicIds", JSON.stringify(pids));
    }

    await onSubmit(fd, editingItem?._id || undefined);
  };

  if (!isOpen) return null;

  return (
    <Form onSubmit={handleSubmit}>
      <h2>{isEdit ? t("admin.massage.edit", "Edit Massage") : t("admin.massage.create", "Create New Massage")}</h2>

      {/* Düzen Modu */}
      <ModeRow role="radiogroup" aria-label={t("editMode","Edit Mode")}>
        <ModeBtn type="button" aria-pressed={editMode === "simple"} $active={editMode === "simple"} onClick={() => setEditMode("simple")}>
          {t("simpleMode", "Basit")}
        </ModeBtn>
        <ModeBtn type="button" aria-pressed={editMode === "json"} $active={editMode === "json"} onClick={() => setEditMode("json")}>
          {t("jsonMode", "JSON Editor")}
        </ModeBtn>
      </ModeRow>

      {editMode === "simple" ? (
        <>
          <Row>
            <Col style={{ gridColumn: "span 2" }}>
              <Label>{t("admin.massage.title", "Title")} ({uiLang.toUpperCase()})</Label>
              <Input
                value={getTLStrict(title, uiLang)}
                onChange={(e) => setTitle(setTL(title, uiLang, e.target.value))}
              />
            </Col>
            <Col style={{ gridColumn: "span 2" }}>
              <Label>{t("admin.massage.summary", "Summary")} ({uiLang.toUpperCase()})</Label>
              <TextArea
                rows={2}
                value={getTLStrict(summary, uiLang)}
                onChange={(e) => setSummary(setTL(summary, uiLang, e.target.value))}
              />
            </Col>
          </Row>
          <Row>
            <Col style={{ gridColumn: "span 4" }}>
              <Label>{t("admin.massage.content", "Content")} ({uiLang.toUpperCase()})</Label>
              <TextArea
                rows={8}
                value={getTLStrict(content, uiLang)}
                onChange={(e) => setContent(setTL(content, uiLang, e.target.value))}
              />
            </Col>
          </Row>
        </>
      ) : (
        <Row>
          <Col style={{ gridColumn: "span 4" }}>
            <JSONEditor
              label={t("multiLangJSON", "Title + Summary + Content (JSON)")}
              value={combinedJSONValue}
              onChange={onCombinedJSONChange}
              placeholder={JSON.stringify(
                {
                  title: Object.fromEntries((SUPPORTED_LOCALES as SupportedLocale[]).map((l) => [l, ""])),
                  summary: Object.fromEntries((SUPPORTED_LOCALES as SupportedLocale[]).map((l) => [l, ""])),
                  content: Object.fromEntries((SUPPORTED_LOCALES as SupportedLocale[]).map((l) => [l, ""])),
                },
                null,
                2
              )}
            />
          </Col>
        </Row>
      )}

      <Row>
        <Col style={{ gridColumn: "span 3" }}>
          <Label>{t("admin.massage.tags", "Tags")}</Label>
          <Input
            placeholder="tag1, tag2, tag3"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </Col>
        <Col>
          <Label>{t("admin.massage.category", "Category")}</Label>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">{t("admin.massage.select_category", "Select a category")}</option>
            {catOpts.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("admin.massage.author", "Author")}</Label>
          <Input value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </Col>
        <Col>
          <Label>{t("admin.massage.durationMinutes", "Duration (min)")}</Label>
          <Input
            type="number"
            min={5}
            max={480}
            value={typeof durationMinutes === "number" ? durationMinutes : ""}
            onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : undefined)}
          />
        </Col>
        <Col>
          <Label>{t("admin.massage.price", "Price")}</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={typeof price === "number" ? price : ""}
            onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : undefined)}
          />
        </Col>
        <Col>
          <Label>{t("admin.massage.publish_status", "Published?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            <span>{isPublished ? t("yes", "Yes") : t("no", "No")}</span>
          </CheckRow>
        </Col>
      </Row>

      {/* Görseller */}
      <BlockTitle>{t("admin.massage.image", "Images")}</BlockTitle>
      <ImageUploader
        existing={existing}
        onExistingChange={setExisting}
        removedExisting={removedExisting}
        onRemovedExistingChange={setRemovedExisting}
        files={files}
        onFilesChange={setFiles}
        maxFiles={8}
        accept="image/*"
        sizeLimitMB={15}
        helpText={t("uploader.help", "jpg/png/webp • keeps order")}
      />

      <Actions>
        <Secondary type="button" onClick={onClose}>{t("admin.cancel", "Cancel")}</Secondary>
        <Primary type="submit">{isEdit ? t("admin.update", "Update") : t("admin.create", "Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* ==== styled — services/about form patern ==== */
const Form = styled.form`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};
`;
const Row = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const Col = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};min-width:0;`;
const BlockTitle = styled.h3`font-size:${({theme})=>theme.fontSizes.md};margin:${({theme})=>theme.spacings.sm} 0;`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  min-width:0;
`;
const TextArea = styled.textarea`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const CheckRow = styled.label`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;`;
const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
const ModeRow = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;margin-top:-6px;`;
const ModeBtn = styled.button<{ $active?: boolean }>`
  padding:8px 10px;border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({$active,theme})=>$active?theme.colors.primaryLight:theme.colors.cardBackground};
  color:${({theme})=>theme.colors.text};cursor:pointer;
`;
