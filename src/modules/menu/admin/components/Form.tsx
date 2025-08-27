"use client";
import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/menu/locales";

import type { SupportedLocale } from "@/types/common";
import { getUILang } from "@/i18n/getUILang";
import { getMultiLang } from "@/types/common";

import type {
  IMenu,
  IMenuCategoryRef,
  TranslatedLabel,
  MenuCreatePayload,
  MenuUpdatePayload,
} from "@/modules/menu/types/menu";

/* redux */
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMenuCategoriesAdmin,
  selectMenuCategoriesAdmin,
} from "@/modules/menu/slice/menucategorySlice";

/* --- helpers --- */
type TL = Partial<Record<SupportedLocale, string>>;
const setTL = (obj: TL | undefined, l: SupportedLocale, val: string): TL => ({ ...(obj || {}), [l]: val });
const getTLStrict = (obj?: TL, l?: SupportedLocale) => (l ? obj?.[l] ?? "" : "");

const toISOOrNull = (localVal?: string | null) => {
  if (!localVal) return null;
  const d = new Date(localVal);
  return isNaN(d.getTime()) ? null : d.toISOString();
};
const toLocalInput = (iso?: string | Date | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/* category id güvenli çıkarım */
const getCatId = (raw: any): string => {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") {
    // populated ise { _id, code, slug, ... }
    return String(raw._id || raw.id || "");
  }
  return "";
};

type Props = {
  initial?: IMenu | null;
  lang?: SupportedLocale;
  onSubmit: (payload: MenuCreatePayload | MenuUpdatePayload, id?: string) => void | Promise<void>;
  onCancel: () => void;
};

type CatRow = { category: string; order: number; isFeatured: boolean };

export default function MenuForm({ initial, onSubmit, onCancel, lang: langProp }: Props) {
  const { t, i18n } = useI18nNamespace("menu", translations);
  const uiLang = useMemo<SupportedLocale>(() => langProp || getUILang(i18n?.language), [langProp, i18n?.language]);
  const isEdit = Boolean(initial?._id);

  /* redux: categories */
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectMenuCategoriesAdmin);

  /* redux: branches (parent fetch ediyor; buradan sadece select) */
  const branches = useAppSelector((s) => s.branch?.adminList ?? []);
  const branchesLoading = useAppSelector((s) => s.branch?.loading);
  const branchesError = useAppSelector((s) => s.branch?.error);

  const branchLabel = (b: any) =>
    getMultiLang(b?.name as any, uiLang) || b?.code || b?.slug || String(b?._id || "");

  useEffect(() => {
    if (!categories?.length) dispatch(fetchMenuCategoriesAdmin({}) as any);
  }, [dispatch, categories?.length]);

  const categoriesSorted = useMemo(() => {
    const arr = Array.isArray(categories) ? categories : [];
    return [...arr].sort((a: any, b: any) => {
      const ao = a?.order ?? Number.MAX_SAFE_INTEGER;
      const bo = b?.order ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      const la = getMultiLang(a?.name as any, uiLang) || a?.slug || a?.code || "";
      const lb = getMultiLang(b?.name as any, uiLang) || b?.slug || b?.code || "";
      return la.localeCompare(lb);
    });
  }, [categories, uiLang]);

  /* basic fields */
  const [code, setCode] = useState<string>(initial?.code ?? "");
  const [name, setName] = useState<TL>((initial?.name as TL) || {});
  const [description, setDescription] = useState<TL>((initial?.description as TL) || {});
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [isPublished, setIsPublished] = useState<boolean>(initial?.isPublished ?? false);

  /* dates */
  const [effectiveFrom, setEffectiveFrom] = useState<string>(toLocalInput(initial?.effectiveFrom || null));
  const [effectiveTo, setEffectiveTo] = useState<string>(toLocalInput(initial?.effectiveTo || null));

  /* --- BRANCHES: çoklu seçim --- */
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    Array.isArray(initial?.branches) ? initial!.branches!.map(String) : []
  );

  /* categories rows */
  const toCatRows = (menu?: IMenu | null): CatRow[] => {
    const src = Array.isArray(menu?.categories) ? (menu!.categories as any[]) : [];
    if (!src.length) return [{ category: "", order: 0, isFeatured: false }];
    return src.map((c: any) => ({
      category: getCatId(c?.category),
      order: Number(c?.order ?? 0),
      isFeatured: Boolean(c?.isFeatured),
    }));
  };

  const [catRows, setCatRows] = useState<CatRow[]>(toCatRows(initial));

  /* initial değişince formu senkronize et */
  useEffect(() => {
    setCode(initial?.code ?? "");
    setName((initial?.name as TL) || {});
    setDescription((initial?.description as TL) || {});
    setIsActive(initial?.isActive ?? true);
    setIsPublished(initial?.isPublished ?? false);
    setEffectiveFrom(toLocalInput(initial?.effectiveFrom || null));
    setEffectiveTo(toLocalInput(initial?.effectiveTo || null));
    setSelectedBranches(Array.isArray(initial?.branches) ? initial!.branches!.map(String) : []);
    setCatRows(toCatRows(initial));
  }, [initial]);

  const addCatRow = () => setCatRows((r) => [...r, { category: "", order: 0, isFeatured: false }]);
  const delCatRow = (idx: number) => setCatRows((r) => r.filter((_, i) => i !== idx));
  const setCatField = (idx: number, patch: Partial<CatRow>) =>
    setCatRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  /* submit */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: MenuCreatePayload | MenuUpdatePayload = {
      code: (code || "").trim(),
      name: (name || {}) as TranslatedLabel,
      description: (description || {}) as TranslatedLabel,
      isActive,
      isPublished,
      effectiveFrom: toISOOrNull(effectiveFrom) || undefined,
      effectiveTo: toISOOrNull(effectiveTo) || undefined,

      // 🔽 Branch seçimleri artık string[] olarak gidiyor
      branches: selectedBranches,

      categories: catRows
        .filter((r) => !!getCatId(r.category))
        .map<IMenuCategoryRef>((r) => ({
          category: getCatId(r.category) as any,
          order: Number(r.order) || 0,
          isFeatured: Boolean(r.isFeatured),
        })),
    };

    if (isEdit && initial?._id) onSubmit(payload, String(initial._id));
    else onSubmit(payload);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* BASIC */}
      <BlockTitle>{t("basic", "Basic")}</BlockTitle>
      <Row>
        <Col>
          <Label>{t("code", "Code")}</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="M-2025-01" />
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("name", "Name")} ({uiLang})</Label>
          <Input
            value={getTLStrict(name, uiLang)}
            onChange={(e) => setName(setTL(name, uiLang, e.target.value))}
            placeholder="Main Menu"
          />
        </Col>
        <Col style={{ gridColumn: "span 3" }}>
          <Label>{t("description", "Description")} ({uiLang})</Label>
          <TextArea
            rows={2}
            value={getTLStrict(description, uiLang)}
            onChange={(e) => setDescription(setTL(description, uiLang, e.target.value))}
            placeholder="Current menu"
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("active", "Active?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>{isActive ? t("yes","Yes") : t("no","No")}</span>
          </CheckRow>
        </Col>
        <Col>
          <Label>{t("published", "Published?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            <span>{isPublished ? t("yes","Yes") : t("no","No")}</span>
          </CheckRow>
        </Col>
      </Row>

      {/* DATES */}
      <BlockTitle>{t("window", "Window")}</BlockTitle>
      <Row>
        <Col>
          <Label>{t("effectiveFrom", "Effective From")}</Label>
          <Input type="datetime-local" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("effectiveTo", "Effective To")}</Label>
          <Input type="datetime-local" value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
        </Col>
      </Row>

      {/* BRANCHES */}
      <BlockTitle>{t("branches", "Branches")}</BlockTitle>
      <Row>
        <Col style={{ gridColumn: "span 2" }}>
          {branchesError && <small style={{ color: "#e06b6b" }}>{String(branchesError)}</small>}
          <Label>{t("selectBranches", "Select Branches")}</Label>
          <Select
            multiple
            value={selectedBranches}
            onChange={(e) => {
              const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
              setSelectedBranches(vals);
            }}
            size={Math.min(10, Math.max(3, branches.length || 3))}
            aria-busy={!!branchesLoading}
          >
            {branches.map((b: any) => (
              <option key={String(b._id)} value={String(b._id)}>
                {branchLabel(b)}
              </option>
            ))}
          </Select>
          <small style={{ opacity: 0.8 }}>
            {t("multiSelectHelp", "Çoklu seçim için Ctrl/Cmd tuşunu basılı tutun")}
          </small>
        </Col>
      </Row>

      {/* CATEGORIES */}
      <BlockTitle>{t("categories", "Categories")}</BlockTitle>
      <CatTable>
        <thead>
          <tr>
            <th style={{ width: "50%" }}>{t("category", "Category")}</th>
            <th style={{ width: "20%" }}>{t("order", "Order")}</th>
            <th style={{ width: "20%" }}>{t("featured", "Featured")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {catRows.map((row, idx) => {
            const selected = getCatId(row.category);
            return (
              <tr key={idx}>
                <td>
                  <Select
                    value={selected}
                    onChange={(e) => setCatField(idx, { category: e.target.value })}
                  >
                    <option value="">{t("selectCategory", "Select category…")}</option>
                    {categoriesSorted.map((c) => {
                      const label = getMultiLang(c.name as any, uiLang) || c.slug || c.code || String(c._id);
                      return (
                        <option key={String(c._id)} value={String(c._id)}>
                          {label}
                        </option>
                      );
                    })}
                  </Select>
                </td>
                <td>
                  <Input
                    type="number"
                    min={0}
                    value={row.order}
                    onChange={(e) => setCatField(idx, { order: Number(e.target.value) || 0 })}
                  />
                </td>
                <td>
                  <CheckRow>
                    <input
                      type="checkbox"
                      checked={row.isFeatured}
                      onChange={(e) => setCatField(idx, { isFeatured: e.target.checked })}
                    />
                    <span>{row.isFeatured ? t("yes", "Yes") : t("no", "No")}</span>
                  </CheckRow>
                </td>
                <td style={{ textAlign: "right" }}>
                  <SmallBtn type="button" onClick={() => delCatRow(idx)}>{t("delete", "Delete")}</SmallBtn>
                </td>
              </tr>
            );
          })}
        </tbody>
      </CatTable>
      <ActionsLeft>
        <Secondary type="button" onClick={addCatRow}>+ {t("addCategoryRow", "Add Category Row")}</Secondary>
      </ActionsLeft>

      {/* ACTIONS */}
      <Actions>
        <Secondary type="button" onClick={onCancel}>{t("cancel", "Cancel")}</Secondary>
        <Primary type="submit">{isEdit ? t("update", "Update") : t("create", "Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* ---------- styled ---------- */
const Form = styled.form`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
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
const Select = styled.select`
  padding:15px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  width:100%;
`;
const TextArea = styled.textarea`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const CheckRow = styled.label`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;`;
const ActionsLeft = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-start;`;
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
const SmallBtn = styled(Secondary)`padding:6px 10px;`;
const CatTable = styled.table`
  width:100%;border-collapse:collapse;
  thead th{
    background:${({theme})=>theme.colors.tableHeader};
    color:${({theme})=>theme.colors.textSecondary};
    font-weight:${({theme})=>theme.fontWeights.semiBold};
    font-size:${({theme})=>theme.fontSizes.sm};
    padding:${({theme})=>theme.spacings.sm};text-align:left;white-space:nowrap;
  }
  td{
    padding:${({theme})=>theme.spacings.sm};
    border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright};
    vertical-align:middle;
  }
`;
