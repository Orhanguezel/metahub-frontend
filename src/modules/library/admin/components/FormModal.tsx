// src/modules/library/admin/components/FormModal.tsx
"use client";

import styled from "styled-components";
import { useState, useEffect, useMemo } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/library/locales";
import { useAppSelector } from "@/store/hooks";
import { JSONEditor, ImageUploader } from "@/shared";
import type { LibraryCategory, ILibrary } from "@/modules/library/types";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/types/common";
import { toast } from "react-toastify";

/* === helpers for TL + UI lang (same pattern) === */
type TL = Partial<Record<SupportedLocale, string>>;
type UploadImage = { _id?: string; url: string; thumbnail?: string; webp?: string; publicId?: string };

const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two)
    ? (two as SupportedLocale)
    : ("tr" as SupportedLocale);
};
const setTL = (obj: TL | undefined, l: SupportedLocale, val: string): TL => ({ ...(obj || {}), [l]: val });
const getTLStrict = (obj?: TL, l?: SupportedLocale) => (l ? (obj?.[l] ?? "") : "");
const toTL = (v: any, lang: SupportedLocale): TL =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as TL) : v ? ({ [lang]: String(v) } as TL) : {};

// URL normalizasyonu (http/https, query/hash ve trailing slash farklılıklarını tolere et)
const normalizeUrl = (u?: string) => {
  if (!u) return "";
  try {
    const url = new URL(u, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/+$/, "");
  } catch {
    return (u || "").replace(/\/+$/, "");
  }
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: ILibrary | null;
  onSubmit: (formData: FormData, id?: string) => Promise<void>;
}

export default function FormModal({ isOpen, onClose, editingItem, onSubmit }: Props) {
  const { i18n, t } = useI18nNamespace("library", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const categories = useAppSelector((s) => s.libraryCategory.categories);
  const successMessage = useAppSelector((s) => s.library.successMessage);
  const error = useAppSelector((s) => s.library.error);
  const currentUser = useAppSelector((s) => s.account.profile);

  const emptyTL = useMemo(
    () => SUPPORTED_LOCALES.reduce((a, l) => ({ ...a, [l]: "" }), {} as Record<SupportedLocale, string>),
    []
  );

  // --- Edit mode (simple/json) ---
  const [editMode, setEditMode] = useState<"simple" | "json">("simple");

  // --- STATE (multilang) ---
  const [titles, setTitles] = useState<TL>(emptyTL);
  const [summaries, setSummaries] = useState<TL>(emptyTL);
  const [contents, setContents] = useState<TL>(emptyTL);

  // --- misc fields ---
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");

  // --- images (ImageUploader pattern) ---
  const originalExisting = useMemo(
    () =>
      (editingItem?.images || []).map((img) => ({
        _id: img._id,
        url: img.url,
        thumbnail: img.thumbnail,
        webp: img.webp,
        publicId: img.publicId,
      })) as UploadImage[],
    [editingItem?.images]
  );
  const [existingUploads, setExistingUploads] = useState<UploadImage[]>(originalExisting);
  const [removedExisting, setRemovedExisting] = useState<UploadImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // (url/publicId) ⇒ _id fallback haritası
  const idBySig = useMemo(() => {
    const m = new Map<string, string>();
    (editingItem?.images || []).forEach((img) => {
      if (!img._id) return;
      if (img.publicId) m.set(`pid:${img.publicId}`, img._id);
      if (img.url) m.set(`url:${normalizeUrl(img.url)}`, img._id);
    });
    return m;
  }, [editingItem?.images]);

  // --- PDF ---
  const existingPdf = useMemo(
    () => (editingItem?.files && editingItem.files.length > 0 ? editingItem.files[0] : null),
    [editingItem?.files]
  );
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]); // existing pdf urls to remove

  // --- fill form ---
  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      const toTLAll = (obj: any) =>
        SUPPORTED_LOCALES.reduce((acc, l) => ({ ...acc, [l]: obj?.[l] || "" }), {} as TL);

      setTitles(toTLAll(editingItem.title));
      setSummaries(toTLAll(editingItem.summary));
      setContents(toTLAll(editingItem.content));

      setAuthor(editingItem.author || currentUser?.name || "");
      setTags(editingItem.tags?.join(", ") || "");
      setCategory(typeof editingItem.category === "string" ? editingItem.category : editingItem.category?._id || "");

      setExistingUploads(originalExisting);
      setRemovedExisting([]);
      setNewFiles([]);

      setSelectedPdf(null);
      setRemovedFiles([]);
    } else {
      setTitles(emptyTL);
      setSummaries(emptyTL);
      setContents(emptyTL);

      setAuthor(currentUser?.name || "");
      setTags("");
      setCategory("");

      setExistingUploads([]);
      setRemovedExisting([]);
      setNewFiles([]);

      setSelectedPdf(null);
      setRemovedFiles([]);
    }
  }, [editingItem, isOpen, currentUser, emptyTL, originalExisting]);

  // --- toasts + close on success ---
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      onClose();
    } else if (error) {
      toast.error(error);
    }
  }, [successMessage, error, onClose]);

  // --- JSON editor combined value ---
  const combinedJSONValue = useMemo(
    () => ({ title: titles, summary: summaries, content: contents }),
    [titles, summaries, contents]
  );
  const onCombinedJSONChange = (v: any) => {
    setTitles(toTL(v?.title, lang));
    setSummaries(toTL(v?.summary, lang));
    setContents(toTL(v?.content, lang));
  };

  // --- handlers ---
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error(t("admin.library.only_pdf", "Yalnızca PDF dosyası seçebilirsiniz."));
      e.currentTarget.value = "";
      return;
    }
    setSelectedPdf(f);
    setRemovedFiles([]); // new pdf picked → clear removal
  };
  const handleRemoveExistingPdf = () => {
    if (existingPdf) setRemovedFiles([existingPdf.url]);
    setSelectedPdf(null);
  };
  const handleRemoveSelectedPdf = () => setSelectedPdf(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();

    // --- i18n alanları (JSON) ---
    fd.append("title", JSON.stringify(titles || {}));
    fd.append("summary", JSON.stringify(summaries || {}));
    fd.append("content", JSON.stringify(contents || {}));

    // --- basit alanlar ---
    fd.append("author", (author || "").trim());
    if (category) fd.append("category", category);

    // --- tags: hem simple ('tags[]'), hem JSON ('tags') ---
    const tagsArr = (tags || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    tagsArr.forEach((tg) => fd.append("tags[]", tg));
    fd.append("tags", JSON.stringify(tagsArr));

    // ✅ Yeni görseller (multer array('images')) ile uyumlu
    newFiles.forEach((f) => fd.append("images", f));

    // ✅ Silinecek görseller: öncelik _id; yoksa publicId/url fallback
    const removeIds: string[] = [];
    const removeFallback: Array<{ publicId?: string; url?: string }> = [];

    removedExisting.forEach((img) => {
      if (img._id) {
        removeIds.push(img._id);
        return;
      }
      const byPid = img.publicId && idBySig.get(`pid:${img.publicId}`);
      const byUrl = img.url && idBySig.get(`url:${normalizeUrl(img.url)}`);
      if (byPid || byUrl) {
        removeIds.push((byPid || byUrl) as string);
      } else {
        removeFallback.push({ publicId: img.publicId, url: img.url });
      }
    });

    // --- SİLME: hem simple (tekrar eden field), hem JSON ---
    if (removeIds.length) {
      removeIds.forEach((id) => fd.append("removeImageIds[]", id));        // simple
      fd.append("removeImageIds", JSON.stringify(removeIds));              // json (mevcut backend alışkanlığı)
      // Alternatif isim isteyen backend'ler için (opsiyonel ama faydalı)
      fd.append("removedImageIds", JSON.stringify(removeIds));             // json (alternatif)
    }
    if (removeFallback.length) {
      fd.append("removedImages", JSON.stringify(removeFallback));          // (objeler için JSON tek doğru yol)
    }

    // ✅ Sıralama: id’ler varsa existingImagesOrderIds, yoksa existingImagesOrder (signature)
    const orderIds = existingUploads.map((x) => x._id).filter(Boolean) as string[];
    if (orderIds.length) {
      // hem simple hem json
      orderIds.forEach((id) => fd.append("existingImagesOrderIds[]", id)); // simple
      fd.append("existingImagesOrderIds", JSON.stringify(orderIds));       // json
    } else if (existingUploads.length) {
      const orderSig = existingUploads
        .map((x) => x.publicId || x.url)
        .filter(Boolean) as string[];
      if (orderSig.length) {
        fd.append("existingImagesOrder", JSON.stringify(orderSig));        // signature listesi (JSON)
      }
    }

    // ✅ PDF
    if (selectedPdf) fd.append("files", selectedPdf);

    // PDF silme bilgisi: hem simple (dizi), hem JSON
    if (removedFiles.length) {
      removedFiles.forEach((u) => fd.append("removedFiles[]", u));         // simple
      fd.append("removedFiles", JSON.stringify(removedFiles));             // json
    }

    // create → default publish (eski davranış)
    if (!editingItem) fd.append("isPublished", "true");

    await onSubmit(fd, editingItem?._id);
  };

  if (!isOpen) return null;

  return (
    <Form onSubmit={handleSubmit}>
      {/* Top row */}
      <Row>
        <Col>
          <Label htmlFor="category">{t("admin.library.category", "Category")}</Label>
          <FlexRow>
            <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="" disabled>
                {t("admin.library.select_category", "Select a category")}
              </option>
              {categories.map((c: LibraryCategory) => (
                <option key={c._id} value={c._id}>
                  {c.name?.[lang] || c.name?.en || Object.values(c.name || {})[0] || c.slug}
                </option>
              ))}
            </Select>
          </FlexRow>
        </Col>

        <Col>
          <Label htmlFor="author">{t("admin.library.author", "Author")}</Label>
          <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </Col>

        <Col style={{ gridColumn: "span 2" }}>
          <Label htmlFor="tags">{t("admin.library.tags", "Tags (comma separated)")}</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2, tag3" />
        </Col>
      </Row>

      {/* Mode switch */}
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

      {editMode === "simple" ? (
        <>
          <Row>
            <Col style={{ gridColumn: "span 2" }}>
              <Label>
                {t("admin.library.title", "Title")} ({lang.toUpperCase()})
              </Label>
              <Input
                value={getTLStrict(titles, lang)}
                onChange={(e) => setTitles(setTL(titles, lang, e.target.value))}
              />
            </Col>
            <Col style={{ gridColumn: "span 2" }}>
              <Label>
                {t("admin.library.summary", "Summary")} ({lang.toUpperCase()})
              </Label>
              <TextArea
                rows={2}
                value={getTLStrict(summaries, lang)}
                onChange={(e) => setSummaries(setTL(summaries, lang, e.target.value))}
              />
            </Col>
          </Row>
          <Row>
            <Col style={{ gridColumn: "span 4" }}>
              <Label>
                {t("admin.library.content", "Content")} ({lang.toUpperCase()})
              </Label>
              <TextArea
                rows={8}
                value={getTLStrict(contents, lang)}
                onChange={(e) => setContents(setTL(contents, lang, e.target.value))}
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
                  title: SUPPORTED_LOCALES.reduce((a, l) => ({ ...a, [l]: "" }), {} as Record<SupportedLocale, string>),
                  summary: SUPPORTED_LOCALES.reduce((a, l) => ({ ...a, [l]: "" }), {} as Record<SupportedLocale, string>),
                  content: SUPPORTED_LOCALES.reduce((a, l) => ({ ...a, [l]: "" }), {} as Record<SupportedLocale, string>),
                },
                null,
                2
              )}
            />
          </Col>
        </Row>
      )}

      {/* Images (new uploader) */}
      <BlockTitle>{t("admin.library.image", "Images")}</BlockTitle>
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

      {/* PDF */}
      <BlockTitle>{t("admin.library.pdf", "PDF File")}</BlockTitle>
      <Input type="file" accept="application/pdf" onChange={handlePdfChange} />
      {existingPdf && !selectedPdf && removedFiles.length === 0 && (
        <InlineFile>
          <a href={existingPdf.url} target="_blank" rel="noopener noreferrer">
            {existingPdf.name || "PDF"}
          </a>
          <IconBtn
            type="button"
            onClick={handleRemoveExistingPdf}
            title={t("admin.remove", "Remove PDF")}
            aria-label={t("admin.remove", "Remove PDF")}
          >
            ×
          </IconBtn>
        </InlineFile>
      )}
      {selectedPdf && (
        <InlineFile>
          <span>{selectedPdf.name}</span>
          <IconBtn
            type="button"
            onClick={handleRemoveSelectedPdf}
            title={t("admin.remove", "Remove PDF")}
            aria-label={t("admin.remove", "Remove PDF")}
          >
            ×
          </IconBtn>
        </InlineFile>
      )}

      <Actions>
        <Secondary type="button" onClick={onClose}>
          {t("admin.cancel", "Cancel")}
        </Secondary>
        <Primary type="submit">
          {editingItem ? t("admin.update", "Update") : t("admin.create", "Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled (Activity/About pattern) ---- */
const Form = styled.form`
  display:flex;
  flex-direction:column;
  gap:${({theme})=>theme.spacings.md};
  max-width: 960px;
  margin: 0 auto;
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;

const Row = styled.div`
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;

const Col = styled.div`
  display:flex;
  flex-direction:column;
  gap:${({theme})=>theme.spacings.xs};
  min-width:0;
`;

const BlockTitle = styled.h3`
  font-size:${({theme})=>theme.fontSizes.md};
  margin:${({theme})=>theme.spacings.sm} 0;
  color:${({theme})=>theme.colors.title};
`;

const Label = styled.label`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
`;

const Input = styled.input`
  padding:10px 12px;
  border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};
  color:${({theme})=>theme.inputs.text};
  min-width:0;
`;

const TextArea = styled.textarea`
  padding:10px 12px;
  border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};
  color:${({theme})=>theme.inputs.text};
  resize:vertical;
`;

const Select = styled.select`
  flex:1 1 auto;
  padding:10px 12px;
  border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};
  color:${({theme})=>theme.inputs.text};
`;

const FlexRow = styled.div`
  display:flex;
  gap:${({theme})=>theme.spacings.xs};
  align-items:center;
`;

const InlineFile = styled.div`
  display:flex;
  align-items:center;
  gap:8px;
  margin-top:6px;
  a{ color:${({theme})=>theme.colors.link}; text-decoration:underline; }
`;

const IconBtn = styled.button`
  background:none;
  border:none;
  color:${({theme})=>theme.colors.danger};
  cursor:pointer;
  font-size:22px;
  line-height:1;
  font-weight:700;
`;

const Actions = styled.div`
  display:flex;
  gap:${({theme})=>theme.spacings.sm};
  justify-content:flex-end;
  margin-top:${({theme})=>theme.spacings.md};
`;

const BaseBtn = styled.button`
  padding:8px 14px;
  border-radius:${({theme})=>theme.radii.md};
  cursor:pointer;
  border:${({theme})=>theme.borders.thin} transparent;
  font-weight:${({theme})=>theme.fontWeights.medium};
`;

const Primary = styled(BaseBtn)`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  &:hover{ background:${({theme})=>theme.buttons.primary.backgroundHover}; }
`;

const Secondary = styled(BaseBtn)`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
`;

const ModeRow = styled.div`
  display:flex;
  gap:${({theme})=>theme.spacings.xs};
  align-items:center;
  margin-top:-6px;
`;

const ModeBtn = styled.button<{ $active?: boolean }>`
  padding:8px 10px;
  border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({$active,theme})=>$active?theme.colors.primaryLight:theme.colors.cardBackground};
  color:${({theme})=>theme.colors.text};
  cursor:pointer;
`;
