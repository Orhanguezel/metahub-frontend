"use client";
import styled from "styled-components";
import { useMemo, useState, useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/recipes/locales";
import type { RecipeCategory } from "@/modules/recipes/types";

// ✅ 10 dilli recipes common (tek kaynaktan)
import type { SupportedLocale } from "@/types/recipes/common";
import { SUPPORTED_LOCALES } from "@/types/recipes/common";

type TL = Partial<Record<SupportedLocale, string>>;

const isSupported = (s?: string): s is SupportedLocale =>
  !!s && (SUPPORTED_LOCALES as readonly string[]).includes(s);

const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return isSupported(two) ? two : "tr";
};
const setTL = (obj: TL | undefined, l: SupportedLocale, val: string): TL => ({ ...(obj || {}), [l]: val });
const getTLStrict = (obj?: TL, l?: SupportedLocale) => (l ? (obj?.[l] ?? "") : "");

type Props = {
  isOpen: boolean;
  editingItem: RecipeCategory | null;
  onClose: () => void;
  onSubmit: (
    data: { name: Record<SupportedLocale, string>; order?: number; isActive?: boolean },
    id?: string
  ) => Promise<void> | void;
};

export default function CategoryForm({ isOpen, editingItem, onClose, onSubmit }: Props) {
  const { t, i18n } = useI18nNamespace("recipes", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);

  const [name, setName] = useState<TL>({});
  const [order, setOrder] = useState<number>(editingItem?.order ?? 0);
  const [isActive, setIsActive] = useState<boolean>(editingItem?.isActive ?? true);
  const isEdit = Boolean(editingItem?._id);

  useEffect(() => {
    setName((editingItem?.name as TL) || {});
    setOrder(editingItem?.order ?? 0);
    setIsActive(editingItem?.isActive ?? true);
  }, [editingItem]);

  if (!isOpen) return null;

  const canSubmit =
    Object.values(name || {}).some((v) => typeof v === "string" && v.trim().length > 0) &&
    (getTLStrict(name, lang)?.trim().length ?? 0) >= 1;

  const normalizeOrder = (v: unknown) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return undefined;
    const r = Math.round(n);
    if (r < 0) return 0;
    if (r > 100000) return 100000;
    return r;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    const payload = {
      name: (name || {}) as Record<SupportedLocale, string>,
      order: normalizeOrder(order),
      isActive,
    };

    if (isEdit && editingItem?._id) await onSubmit(payload, editingItem._id);
    else await onSubmit(payload);

    onClose();
  };

  return (
    <Form onSubmit={submit}>
      <Row>
        <Col>
          <Label>{t("category_name", "Category Name")} ({lang})</Label>
          <Input
            value={getTLStrict(name, lang)}
            onChange={(e) => setName(setTL(name, lang, e.target.value))}
            required
          />
        </Col>
        <Col>
          <Label>{t("order", "Order")}</Label>
          <Input
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value) || 0)}
            inputMode="numeric"
          />
        </Col>
        <Col>
          <Label>{t("isActive", "Active?")}</Label>
          <CheckRow>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span>{isActive ? t("yes", "Yes") : t("no", "No")}</span>
          </CheckRow>
        </Col>
      </Row>
      <Actions>
        <Secondary type="button" onClick={onClose}>{t("cancel", "Cancel")}</Secondary>
        <Primary type="submit" disabled={!canSubmit}>
          {isEdit ? t("update", "Update") : t("create", "Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* styled */
const Form = styled.form`display:flex;flex-direction:column;gap:${({ theme }) => theme.spacings.md};min-width:320px;`;
const Row = styled.div`display:grid;grid-template-columns:1fr 1fr 1fr;gap:${({ theme }) => theme.spacings.md};`;
const Col = styled.div`display:flex;flex-direction:column;gap:${({ theme }) => theme.spacings.xs};`;
const Label = styled.label`font-size:${({ theme }) => theme.fontSizes.xsmall};color:${({ theme }) => theme.colors.textSecondary};`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({ theme }) => theme.radii.md};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background:${({ theme }) => theme.inputs.background};color:${({ theme }) => theme.inputs.text};
`;
const CheckRow = styled.label`display:flex;gap:${({ theme }) => theme.spacings.xs};align-items:center;`;
const Actions = styled.div`display:flex;gap:${({ theme }) => theme.spacings.sm};justify-content:flex-end;`;
const Primary = styled.button<{disabled?: boolean}>`
  background:${({ theme }) => theme.buttons.primary.background};
  color:${({ theme }) => theme.buttons.primary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding:8px 14px;border-radius:${({ theme }) => theme.radii.md};cursor:pointer;
  opacity:${({disabled})=>disabled?0.6:1};pointer-events:${({disabled})=>disabled?'none':'auto'};
`;
const Secondary = styled.button`
  background:${({ theme }) => theme.buttons.secondary.background};
  color:${({ theme }) => theme.buttons.secondary.text};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding:8px 14px;border-radius:${({ theme }) => theme.radii.md};cursor:pointer;
`;
