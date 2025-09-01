"use client";
import styled from "styled-components";
import { useState, useEffect } from "react";
import type { ReactionTargetType, ReactionKind } from "@/modules/reactions/types";

type Option = { value: string; label: string };
type TargetTypeOption = { value: ReactionTargetType | ""; label: string };

type Props = {
  initial: {
    user?: string;
    targetType?: ReactionTargetType;
    targetId?: string;
    kind?: ReactionKind | "";
    emoji?: string;
    value?: number | "";       // 1..5 veya boş
    isActive?: boolean | "";   // true/false veya ""
    page?: number;
    limit?: number;
  };
  onSearch: (filters: Props["initial"]) => void;
  loading?: boolean;
  t: (k: string, d?: string) => string;

  /** yeni: dropdown verileri (opsiyonel) */
  userOptions?: Option[];
  targetTypeOptions?: TargetTypeOption[]; // ilk eleman "Tümü" olabilir (value: "")
  targetOptions?: Option[];               // ilk eleman "Tümü" olabilir (value: "")
};

// literal union’u koru
const KINDS = ["LIKE", "FAVORITE", "BOOKMARK", "EMOJI", "RATING"] as const;
type KindLiteral = (typeof KINDS)[number];

// reset defaults — tek bir const assertion
const RESET_DEFAULTS = {
  kind: "" as Props["initial"]["kind"],
  value: "" as Props["initial"]["value"],
  isActive: "" as Props["initial"]["isActive"],
  page: 1,
  limit: 50,
} as const;

const isFiniteNumber = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x);

export default function ReactionsFilters({
  initial,
  onSearch,
  loading,
  t,
  userOptions = [],
  targetTypeOptions = [],
  targetOptions = [],
}: Props) {
  const [form, setForm] = useState<Props["initial"]>(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = {} as Props["initial"];
    (Object.entries(form) as Array<[keyof Props["initial"], any]>).forEach(([k, v]) => {
      if (v === "" || v == null) return;
      (clean as any)[k] = v;
    });
    onSearch(clean);
  };

  const reset = () => {
    const next: Props["initial"] = { ...RESET_DEFAULTS };
    setForm(next);
    onSearch(next);
  };

  return (
    <Form onSubmit={submit}>
      <Row>
        {/* Kullanıcı — dropdown */}
        <Field>
          <label>{t("admin.filters.user", "User ID")}</label>
          <select
            value={form.user || ""}
            onChange={(e) => setForm((f) => ({ ...f, user: e.target.value || undefined }))}
          >
            <option value="">{t("all", "All")}</option>
            {userOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        {/* Hedef Tipi — dropdown */}
        <Field>
          <label>{t("admin.filters.targetType", "Target Type")}</label>
          <select
            value={form.targetType || ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                targetType: (e.target.value || undefined) as ReactionTargetType,
                // tip değişince hedefi sıfırla
                targetId: undefined,
              }))
            }
          >
            {targetTypeOptions.length ? (
              targetTypeOptions.map((o) => (
                <option key={`${o.label}-${o.value}`} value={o.value as string}>
                  {o.label}
                </option>
              ))
            ) : (
              <>
                <option value="">{t("all", "All")}</option>
                <option value="menuitem">menuitem</option>
                <option value="product">product</option>
                <option value="about">about</option>
                <option value="post">post</option>
                <option value="comment">comment</option>
                <option value="category">category</option>
              </>
            )}
          </select>
        </Field>

        {/* Hedef — dependent dropdown */}
        <Field>
          <label>{t("admin.filters.targetId", "Target ID")}</label>
          <select
            value={form.targetId || ""}
            onChange={(e) => setForm((f) => ({ ...f, targetId: e.target.value || undefined }))}
            disabled={!form.targetType && !(targetOptions[0]?.value === "")}
          >
            {(targetOptions.length ? targetOptions : [{ value: "", label: t("all", "All") }]).map((o) => (
              <option key={`${o.label}-${o.value}`} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        {/* Tür */}
        <Field>
          <label>{t("admin.filters.kind", "Kind")}</label>
          <select
            value={form.kind || ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                kind: ((e.target.value as KindLiteral) || "") as Props["initial"]["kind"],
              }))
            }
          >
            <option value="">{t("all", "All")}</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </Field>

        {/* Emoji */}
        <Field>
          <label>{t("admin.filters.emoji", "Emoji")}</label>
          <input
            value={form.emoji || ""}
            onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value || undefined }))}
            placeholder="😊"
          />
        </Field>

        {/* Puan (RATING) */}
        <Field>
          <label>{t("admin.filters.value", "Rating Value")}</label>
          <input
            type="number"
            min={1}
            max={5}
            // ❗ NaN uyarısını engelle: sadece sonlu sayıysa number, değilse ""
            value={isFiniteNumber(form.value) ? form.value : ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                setForm((f) => ({ ...f, value: "" }));
                return;
              }
              const n = Number(raw);
              setForm((f) => ({
                ...f,
                value: Number.isFinite(n) ? Math.max(1, Math.min(5, n)) : "",
              }));
            }}
            placeholder="1..5"
          />
        </Field>

        {/* Aktif */}
        <Field>
          <label>{t("admin.filters.isActive", "Active")}</label>
          <select
            value={form.isActive === "" ? "" : String(form.isActive)}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({ ...f, isActive: v === "" ? "" : v === "true" }));
            }}
          >
            <option value="">{t("all", "All")}</option>
            <option value="true">{t("yes", "Yes")}</option>
            <option value="false">{t("no", "No")}</option>
          </select>
        </Field>

        {/* Sayfalama */}
        <Field>
          <label>{t("page", "Page")}</label>
          <input
            type="number"
            min={1}
            value={form.page ?? 1}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                page: Math.max(1, Number(e.target.value) || 1),
              }))
            }
          />
        </Field>
        <Field>
          <label>{t("limit", "Limit")}</label>
          <input
            type="number"
            min={1}
            max={200}
            value={form.limit ?? 50}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                limit: Math.max(1, Math.min(200, Number(e.target.value) || 50)),
              }))
            }
          />
        </Field>
      </Row>

      <Actions>
        <Btn type="submit" disabled={loading}>
          {t("search", "Search")}
        </Btn>
        <Btn type="button" onClick={reset} disabled={loading}>
          {t("reset", "Reset")}
        </Btn>
      </Actions>
    </Form>
  );
}

const Form = styled.form``;
const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacings.sm};
`;
const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  input,
  select {
    padding: 8px 10px;
    border-radius: ${({ theme }) => theme.radii.md};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
  }
`;
const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  margin-top: ${({ theme }) => theme.spacings.sm};
`;
const Btn = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.buttons.primary.backgroundHover};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;
