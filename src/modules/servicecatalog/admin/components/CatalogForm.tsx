"use client";
import styled from "styled-components";
import { useState, useMemo, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/servicecatalog";
import { createCatalog, updateCatalog } from "@/modules/servicecatalog/slice/serviceCatalogSlice";
import type {
  IServiceCatalog,
  IServiceCatalogImage,
  TranslatedLabel,
} from "@/modules/servicecatalog/types";
import type { SupportedLocale } from "@/types/common";
import { JSONEditor } from "@/modules/scheduling";
import ImageUploader from "./ImageUploader";

/* FE tarafında BE ile aynı normalize */
const toUpperSnake = (s: string) =>
  s?.toString().trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_]/g, "").toUpperCase();

/* Tip güvenli yardımcılar */
const toTL = (lang: SupportedLocale, text: string): TranslatedLabel =>
  text.trim() ? ({ [lang]: text.trim() } as TranslatedLabel) : {};

const pickTL = (obj: TranslatedLabel | undefined, lang: SupportedLocale): string =>
  (obj?.[lang] ?? obj?.en ?? obj?.tr ?? "") || "";

export default function CatalogForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: IServiceCatalog;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { t, i18n } = useI18nNamespace("servicecatalog", translations);
  const dispatch = useAppDispatch();
  const isEdit = !!initial?._id;

  /* ---- primitive fields ---- */
  const [code, setCode] = useState(initial?.code || "");
  const [defaultDurationMin, setDefaultDurationMin] = useState<number>(initial?.defaultDurationMin || 30);
  const [defaultTeamSize, setDefaultTeamSize] = useState<number>(initial?.defaultTeamSize || 1);
  const [suggestedPrice, setSuggestedPrice] = useState<string>(initial?.suggestedPrice?.toString() ?? "");
  const [tags, setTags] = useState<string>((initial?.tags || []).join(", "));
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  /* ---- images ---- */
  const [existingImages, setExistingImages] = useState<IServiceCatalogImage[]>(initial?.images || []);
  const [removedExisting, setRemovedExisting] = useState<IServiceCatalogImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  /* ---- i18n input mode: "simple" (aktif dilde tek alan) | "json" ---- */
  const [i18nMode, setI18nMode] = useState<"simple" | "json">("simple");

  // Aktif dili SupportedLocale olarak daralt
  const currentLang = (i18n?.language || "en").split("-")[0] as SupportedLocale;

  // JSON mode state
  const [nameJson, setNameJson] = useState<TranslatedLabel>(initial?.name || {});
  const [descJson, setDescJson] = useState<TranslatedLabel>(initial?.description || {});

  // SIMPLE mode state (aktif dile tek alan) — tip güvenli pick
  const [nameSingle, setNameSingle] = useState<string>(pickTL(initial?.name, currentLang));
  const [descSingle, setDescSingle] = useState<string>(pickTL(initial?.description, currentLang));

  const effectiveName: TranslatedLabel = useMemo(
    () => (i18nMode === "json" ? nameJson || {} : toTL(currentLang, nameSingle)),
    [i18nMode, nameJson, nameSingle, currentLang]
  );

  const effectiveDesc: TranslatedLabel = useMemo(
    () => (i18nMode === "json" ? descJson || {} : toTL(currentLang, descSingle)),
    [i18nMode, descJson, descSingle, currentLang]
  );

  const hasAnyName = (obj?: TranslatedLabel) =>
    !!obj && Object.values(obj).some((v) => String(v || "").trim().length > 0);

  /* code boşsa, isimden otomatik üret */
  useEffect(() => {
    if (code?.trim()) return;
    const best =
      effectiveName[currentLang] ||
      effectiveName.en ||
      effectiveName.tr ||
      (Object.values(effectiveName || {}).find((v) => String(v || "").trim()) as string | undefined) ||
      "";
    if (best) setCode(toUpperSnake(best));
  }, [effectiveName, code, currentLang]);

  const canSubmit = useMemo(
    () => hasAnyName(effectiveName) && defaultDurationMin >= 1 && defaultTeamSize >= 1,
    [effectiveName, defaultDurationMin, defaultTeamSize]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const data: Partial<IServiceCatalog> = {
      code: code || undefined,
      name: effectiveName,
      description: effectiveDesc,
      defaultDurationMin,
      defaultTeamSize,
      suggestedPrice: suggestedPrice === "" ? undefined : Number(suggestedPrice),
      tags: tags ? tags.split(",").map((x) => x.trim()).filter(Boolean) : [],
      isActive,
    };

    if (isEdit) {
      await dispatch(
        updateCatalog({
          id: initial!._id,
          data,
          files: newFiles,
          removedImages: removedExisting,
        })
      ).unwrap().catch(() => {});
    } else {
      await dispatch(createCatalog({ data, files: newFiles })).unwrap().catch(() => {});
    }
    onSaved?.();
  }

  return (
    <Form onSubmit={submit}>
      <Row>
        <Col>
          <Label htmlFor="svc-code">{t("form.code", "Code")}</Label>
          <Input
            id="svc-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={(e) => e.target.value && setCode(toUpperSnake(e.target.value))}
            placeholder={t("form.codePlaceholder", "auto from name if empty")}
            aria-describedby="code-help"
            autoComplete="off"
          />
          <Help id="code-help">{t("form.codeHelp", "Will be normalized to UPPER_SNAKE")}</Help>
        </Col>

        <Col>
          <Label htmlFor="svc-active">{t("form.active", "Active")}</Label>
          <Switch
            role="switch"
            aria-checked={isActive}
            tabIndex={0}
            data-on={isActive}
            onClick={() => setIsActive((v) => !v)}
          >
            <SwitchTrack data-on={isActive} />
            <SwitchThumb data-on={isActive} />
            <SwitchText>{isActive ? t("common.yes", "Yes") : t("common.no", "No")}</SwitchText>
          </Switch>
        </Col>

        {/* Mode Switch */}
        <Col>
          <Label>{t("form.i18nMode", "i18n Input Mode")}</Label>
          <Segmented>
            <SegBtn
              type="button"
              data-active={i18nMode === "simple"}
              onClick={() => setI18nMode("simple")}
            >
              {t("form.simpleMode", "Simple")}
            </SegBtn>
            <SegBtn
              type="button"
              data-active={i18nMode === "json"}
              onClick={() => setI18nMode("json")}
            >
              {t("form.jsonMode", "JSON")}
            </SegBtn>
          </Segmented>
        </Col>
      </Row>

      {/* ==== Name (aktif dil) / JSON ==== */}
      {i18nMode === "json" ? (
        <Card>
          <Sub>
            {t("form.nameI18n", "Name (i18n JSON)")} <Req>*</Req>
          </Sub>
          <JSONEditor
            label={t("form.nameI18n", "Name (i18n JSON)")}
            value={nameJson}
            onChange={setNameJson}
            placeholder={`{ "en": "Carpet Cleaning", "tr": "Halı Yıkama" }`}
          />
          {!hasAnyName(effectiveName) && (
            <Warn>{t("form.nameRequired", "At least one language is required.")}</Warn>
          )}
        </Card>
      ) : (
        <Card>
          <Sub>
            {t("form.nameSimple", "Name")} ({currentLang}) <Req>*</Req>
          </Sub>
          <Input
            value={nameSingle}
            onChange={(e) => setNameSingle(e.target.value)}
            placeholder={t("form.namePlaceholder", "Service name")}
          />
          {!hasAnyName(effectiveName) && (
            <Warn>{t("form.nameRequired", "At least one language is required.")}</Warn>
          )}
        </Card>
      )}

      {/* ==== Description (aktif dil) / JSON ==== */}
      {i18nMode === "json" ? (
        <Card>
          <Sub>{t("form.descI18n", "Description (i18n JSON)")}</Sub>
          <JSONEditor
            label={t("form.descI18n", "Description (i18n JSON)")}
            value={descJson}
            onChange={setDescJson}
          />
        </Card>
      ) : (
        <Card>
          <Sub>
            {t("form.descSimple", "Description")} ({currentLang})
          </Sub>
          <Textarea
            rows={3}
            value={descSingle}
            onChange={(e) => setDescSingle(e.target.value)}
            placeholder={t("form.descPlaceholder", "Description")}
          />
        </Card>
      )}

      <Row>
        <Col>
          <Label htmlFor="svc-duration">
            {t("form.defaultDuration", "Default Duration (min)")} <Req>*</Req>
          </Label>
        <Input
            id="svc-duration"
            type="number"
            min={1}
            value={defaultDurationMin}
            onChange={(e) => setDefaultDurationMin(Math.max(1, Number(e.target.value) || 1))}
            required
          />
        </Col>

        <Col>
          <Label htmlFor="svc-team">
            {t("form.defaultTeam", "Default Team Size")} <Req>*</Req>
          </Label>
          <Input
            id="svc-team"
            type="number"
            min={1}
            value={defaultTeamSize}
            onChange={(e) => setDefaultTeamSize(Math.max(1, Number(e.target.value) || 1))}
            required
          />
        </Col>

        <Col>
          <Label htmlFor="svc-price">{t("form.suggestedPrice", "Suggested Price")}</Label>
          <Input
            id="svc-price"
            type="number"
            min={0}
            step="0.01"
            value={suggestedPrice}
            onChange={(e) => setSuggestedPrice(e.target.value)}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <Label htmlFor="svc-tags">{t("form.tags", "Tags (comma)")}</Label>
          <Input
            id="svc-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t("form.tagsPlaceholder", "cleaning, carpet, deep")}
          />
        </Col>
      </Row>

      <Card>
        <Sub>{t("form.images", "Images")}</Sub>
        <ImageUploader
          existing={existingImages}
          onRemoveExisting={(img) => {
            setRemovedExisting((r) => [...r, img]);
            setExistingImages((e) => e.filter((x) => x.url !== img.url));
          }}
          newFiles={newFiles}
          onAddFiles={(files) => setNewFiles((s) => [...s, ...files])}
          onRemoveNewFile={(idx) => setNewFiles((s) => s.filter((_, i) => i !== idx))}
          max={5}
        />
      </Card>

      <Actions>
        <Ghost type="button" onClick={onClose}>
          {t("form.cancel", "Cancel")}
        </Ghost>
        <CTA type="submit" disabled={!canSubmit} aria-disabled={!canSubmit}>
          {isEdit ? t("form.update", "Update") : t("form.create", "Create")}
        </CTA>
      </Actions>
    </Form>
  );
}

/* ===================== styled ===================== */
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Row = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
  grid-template-columns: repeat(3, 1fr);
  ${({ theme }) => theme.media.tablet} { grid-template-columns: repeat(2, 1fr); }
  ${({ theme }) => theme.media.mobile} { grid-template-columns: 1fr; }
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

const Help = styled.small`
  color: ${({ theme }) => theme.colors.textMuted};
`;
const Warn = styled.small`
  color: ${({ theme }) => theme.colors.danger};
`;
const Req = styled.span`
  color: ${({ theme }) => theme.colors.danger};
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  transition: ${({ theme }) => theme.transition.normal};
  &::placeholder { color: ${({ theme }) => theme.colors.placeholder}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  resize: vertical;
  min-height: 72px;
  transition: ${({ theme }) => theme.transition.normal};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cards.background};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.md};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const Sub = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
  color: ${({ theme }) => theme.colors.textAlt};
`;

/* Buttons — classic look */
const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: flex-end;
`;

const CTA = styled.button`
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.buttonBorder};
  color: ${({ theme }) => theme.buttons.primary.text};
  background: ${({ theme }) => theme.buttons.primary.background};
  box-shadow: ${({ theme }) => theme.shadows.button};
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transition.fast}, opacity ${({ theme }) => theme.transition.fast}, background ${({ theme }) => theme.transition.fast};
  &:hover:enabled { background: ${({ theme }) => theme.buttons.primary.backgroundHover}; transform: translateY(-1px); }
  &:active:enabled { transform: translateY(0); }
  &:disabled { opacity: ${({ theme }) => theme.opacity.disabled}; cursor: not-allowed; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.colors.shadowHighlight}; }
`;

const Ghost = styled.button`
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast}, color ${({ theme }) => theme.transition.fast};
  &:hover { background: ${({ theme }) => theme.buttons.secondary.backgroundHover}; color: ${({ theme }) => theme.buttons.secondary.textHover}; }
  &:focus-visible { outline: none; box-shadow: ${({ theme }) => theme.colors.shadowHighlight}; }
`;

/* Toggle switch — classic */
const Switch = styled.div<{ "data-on"?: boolean }>`
  position: relative;
  width: 64px; height: 32px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  display: inline-flex; align-items: center;
  cursor: pointer; user-select: none;
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
`;

const SwitchTrack = styled.span<{ "data-on": boolean }>`
  position: absolute; inset: 0;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, ["data-on"]: on }) => (on ? theme.colors.primaryTransparent : theme.colors.inputBackgroundLight)};
  transition: background ${({ theme }) => theme.transition.fast};
`;

const SwitchThumb = styled.span<{ "data-on": boolean }>`
  position: relative; z-index: 1;
  width: 28px; height: 28px; margin-left: 2px;
  border-radius: ${({ theme }) => theme.radii.circle};
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  transform: translateX(${({ ["data-on"]: on }) => (on ? "32px" : "0")});
  transition: transform ${({ theme }) => theme.transition.fast};
`;

const SwitchText = styled.span`
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* Segmented control */
const Segmented = styled.div`
  display: inline-flex; padding: 2px;
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  gap: 2px;
`;

const SegBtn = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: none; cursor: pointer;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: background ${({ theme }) => theme.transition.fast}, color ${({ theme }) => theme.transition.fast};
  &[data-active="true"] {
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.textPrimary};
    box-shadow: ${({ theme }) => theme.shadows.xs};
  }
  &:hover { background: ${({ theme }) => theme.colors.hoverBackground}; }
`;
