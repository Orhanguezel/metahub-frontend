// modules/recipes/CategoryForm.tsx
"use client";
import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/recipes/locales";
import type { RecipeCategory } from "@/modules/recipes/types";

import type { SupportedLocale } from "@/types/recipes/common";
import { SUPPORTED_LOCALES } from "@/types/recipes/common";
import { getUILang, setTL, getTLStrict, toTL } from "@/i18n/recipes/getUILang";
import { JSONEditor } from "@/shared";

/** Types */
type TL = Partial<Record<SupportedLocale, string>>;
type Mode = "simple" | "json";

type Props = {
  /** RecipesForm gibi inline kullanılır */
  initial?: RecipeCategory | null;
  onSubmit: (
    data: { name: Record<SupportedLocale, string>; order?: number; isActive?: boolean },
    id?: string
  ) => Promise<void> | void;
  onCancel: () => void;
};

const extractId = (v: any): string | undefined =>
  typeof v === "string" ? v : v?.$oid ? String(v.$oid) : v?._id ? String(v._id) : undefined;

export default function CategoryForm({ initial = null, onSubmit, onCancel }: Props) {
  const { t, i18n } = useI18nNamespace("recipes", translations);
  const uiLang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const [editLang, setEditLang] = useState<SupportedLocale>(uiLang);
  const [mode, setMode] = useState<Mode>("simple");

  const [name, setName] = useState<TL>({});
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const isEdit = !!(initial as any)?._id;

  useEffect(() => { setEditLang(uiLang); }, [uiLang]);
  useEffect(() => {
    setName(toTL((initial?.name as any) || {}));
    setOrder(initial?.order ?? 0);
    setIsActive(initial?.isActive ?? true);
  }, [initial]);

  const canSubmit =
    Object.values(name || {}).some((v) => typeof v === "string" && v.trim().length > 0) &&
    (getTLStrict(name as any, editLang)?.trim().length ?? 0) >= 1;

  const normalizeOrder = (v: unknown) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return undefined;
    const r = Math.round(n);
    if (r < 0) return 0;
    if (r > 100000) return 100000;
    return r;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const payload = {
      name: (name || {}) as Record<SupportedLocale, string>,
      order: normalizeOrder(order),
      isActive,
    };
    const id = extractId(initial?._id) || extractId(initial);
    if (isEdit && id) await onSubmit(payload, id);
    else await onSubmit(payload);
  };

  const jsonValue = { _id: (initial as any)?._id, slug: (initial as any)?.slug, name, order, isActive };
  const applyJsonToState = (v: any) => {
    if (!v || typeof v !== "object") return;
    if (v.name) setName(toTL(v.name));
    if (typeof v.order === "number") setOrder(v.order);
    if (typeof v.isActive === "boolean") setIsActive(v.isActive);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <TopBar>
        <LangGroup role="group" aria-label={t("language","Language")}>
          {(SUPPORTED_LOCALES as readonly SupportedLocale[]).map((l) => (
            <LangBtn
              key={l}
              type="button"
              aria-pressed={editLang === l}
              $active={editLang === l}
              onClick={() => setEditLang(l)}
              title={l.toUpperCase()}
            >
              {l.toUpperCase()}
            </LangBtn>
          ))}
        </LangGroup>

        <ModeRow role="radiogroup" aria-label={t("editMode","Edit Mode")}>
          <ModeBtn type="button" aria-pressed={mode==="simple"} $active={mode==="simple"} onClick={()=>setMode("simple")}>
            {t("simpleMode","Basit")}
          </ModeBtn>
          <ModeBtn type="button" aria-pressed={mode==="json"} $active={mode==="json"} onClick={()=>setMode("json")}>
            {t("jsonMode","JSON Editor")}
          </ModeBtn>
        </ModeRow>
      </TopBar>

      {mode === "simple" ? (
        <Grid>
          <Field>
            <Label>{t("category_name","Category Name")} ({editLang})</Label>
            <Input
              value={getTLStrict(name as any, editLang)}
              onChange={(e) => setName(setTL(name as any, editLang, e.target.value) as any)}
              required
            />
            <Help>{t("category.help.name","Aktif dil için zorunlu.")}</Help>
          </Field>

          <Field>
            <Label>{t("order","Order")}</Label>
            <Input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value) || 0)}
              inputMode="numeric"
            />
            <Help>{t("category.help.order","Liste sırası için (0..100000).")}</Help>
          </Field>

          <Field>
            <Label>{t("isActive","Active?")}</Label>
            <CheckRow>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <span>{isActive ? t("yes","Yes") : t("no","No")}</span>
            </CheckRow>
            <Help>{t("category.help.active","Pasif olanlar sitede gizlenir.")}</Help>
          </Field>
        </Grid>
      ) : (
        <JSONWrap>
          <JSONEditor
            label={t("category_json_full","Kategori (JSON)")}
            value={jsonValue}
            onChange={applyJsonToState}
            placeholder={`{
  "name": { "tr": "Sebzeler", "en": "Vegetables" },
  "order": 0,
  "isActive": true
}`}
          />
        </JSONWrap>
      )}

      <Actions>
        <Secondary type="button" onClick={onCancel}>{t("cancel","Cancel")}</Secondary>
        <Primary type="submit" disabled={!canSubmit}>
          {isEdit ? t("update","Update") : t("create","Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* styled – kart içi (RecipesForm ile tutarlı) */
const Form = styled.form`
  display:flex;flex-direction:column;gap:${({ theme }) => theme.spacings.md};
`;
const TopBar = styled.div`
  display:flex;align-items:center;gap:${({ theme }) => theme.spacings.sm};
  justify-content:space-between;flex-wrap:wrap;
`;
const LangGroup = styled.div`display:flex;gap:6px;flex-wrap:wrap;`;
const LangBtn = styled.button<{ $active?: boolean }>`
  padding:6px 10px;border-radius:${({ theme }) => theme.radii.pill};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ $active, theme }) => $active ? theme.colors.primaryLight : theme.colors.cardBackground};
  color:${({ theme }) => theme.colors.text}; cursor:pointer; font-size:${({ theme }) => theme.fontSizes.xsmall};
`;
const ModeRow = styled.div`display:flex;gap:6px;align-items:center;`;
const ModeBtn = styled.button<{ $active?: boolean }>`
  padding:6px 10px;border-radius:${({ theme }) => theme.radii.pill};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ $active, theme }) => $active ? theme.colors.primaryLight : theme.colors.cardBackground};
  color:${({ theme }) => theme.colors.text}; cursor:pointer; font-size:${({ theme }) => theme.fontSizes.xsmall};
`;

const Grid = styled.div`
  display:grid; grid-template-columns: 1fr 1fr 1fr; gap:${({ theme }) => theme.spacings.md};
  ${({ theme }) => theme.media.tablet}{ grid-template-columns: 1fr 1fr; }
  ${({ theme }) => theme.media.mobile}{ grid-template-columns: 1fr; }
`;

const Field = styled.div`display:flex;flex-direction:column;gap:${({ theme }) => theme.spacings.xs};`;
const Label = styled.label`font-size:${({ theme }) => theme.fontSizes.xsmall};color:${({ theme }) => theme.colors.textSecondary};`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background:${({ theme }) => theme.inputs.background};color:${({ theme }) => theme.inputs.text};
`;
const Help = styled.small`color:${({ theme }) => theme.colors.textSecondary};`;
const CheckRow = styled.label`display:flex;gap:${({ theme }) => theme.spacings.xs};align-items:center;`;
const JSONWrap = styled.div`margin-top:${({ theme }) => theme.spacings.sm};`;

const Actions = styled.div`
  display:flex;gap:${({ theme }) => theme.spacings.sm};justify-content:flex-end;
  margin-top:${({ theme }) => theme.spacings.lg};
  flex-wrap:wrap;
`;
const Primary = styled.button<{disabled?: boolean}>`
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding:10px 14px;border-radius:${({ theme }) => theme.radii.md};cursor:pointer;
  opacity:${({disabled})=>disabled?0.6:1};pointer-events:${({disabled})=>disabled?'none':'auto'};
`;
const Secondary = styled.button`
  background:${({ theme }) => theme.buttons.secondary.background};
  color:${({ theme }) => theme.buttons.secondary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding:10px 14px;border-radius:${({ theme }) => theme.radii.md};cursor:pointer;
`;
