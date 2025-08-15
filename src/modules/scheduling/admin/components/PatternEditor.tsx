// src/modules/scheduling/ui/components/PatternEditor.tsx
"use client";
import styled, { css } from "styled-components";
import { useMemo } from "react";
import type { RecurrencePattern } from "@/modules/scheduling/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/scheduling";

export default function PatternEditor({
  value,
  onChange,
}: {
  value?: RecurrencePattern;
  onChange: (v: RecurrencePattern) => void;
}) {
  const { t, i18n } = useI18nNamespace("scheduling", translations);
  const lang = (i18n.language || "en").slice(0, 2);

  const v: RecurrencePattern =
    value || ({ type: "weekly", every: 1, daysOfWeek: [1] } as RecurrencePattern);

  const set = (patch: Partial<RecurrencePattern>) =>
    onChange({ ...(v as any), ...patch } as RecurrencePattern);

  // 0..6 (Pazar..Cumartesi), yerel kısa adlarla
  const DOW = useMemo(() => getWeekdayLabels(lang), [lang]);

  const summary = useMemo(() => {
    switch (v.type) {
      case "weekly": {
        const days = ((v as any).daysOfWeek || []).join(",");
        return t("pattern.summary.weekly", "weekly/{{every}} [{{days}}]", {
          every: (v as any).every ?? 1,
          days,
        });
      }
      case "dayOfMonth":
        return t("pattern.summary.dayOfMonth", "dayOfMonth/{{every}} day={{day}}", {
          every: (v as any).every ?? 1,
          day: (v as any).day ?? 1,
        });
      case "nthWeekday":
        return t("pattern.summary.nthWeekday", "nthWeekday/{{every}} {{nth}}.{{weekday}}", {
          every: (v as any).every ?? 1,
          nth: (v as any).nth ?? 1,
          weekday: (v as any).weekday ?? 1,
        });
      case "yearly":
        return t("pattern.summary.yearly", "yearly {{month}}/{{day}}", {
          month: (v as any).month ?? 1,
          day: (v as any).day ?? 1,
        });
      default:
        return "-";
    }
  }, [v, t]);

  return (
    <Wrap role="group" aria-label={t("pattern.title", "Recurrence Pattern")}>
      <Field>
        <Label htmlFor="pat-type">{t("pattern.type", "Type")}</Label>
        <Select
          id="pat-type"
          value={v.type}
          onChange={(e) => onType(e.target.value as RecurrencePattern["type"])}
          aria-label={t("pattern.type", "Type")}
        >
          <option value="weekly">{t("pattern.types.weekly", "weekly")}</option>
          <option value="dayOfMonth">{t("pattern.types.dayOfMonth", "dayOfMonth")}</option>
          <option value="nthWeekday">{t("pattern.types.nthWeekday", "nthWeekday")}</option>
          <option value="yearly">{t("pattern.types.yearly", "yearly")}</option>
        </Select>
      </Field>

      {v.type === "weekly" && (
        <>
          <Field>
            <Label htmlFor="pat-every-w">{t("pattern.everyWeeks", "Every (weeks)")}</Label>
            <Input
              id="pat-every-w"
              type="number"
              min={1}
              value={(v as any).every ?? 1}
              onChange={(e) => set({ every: clampNum(e.target.value, 1) })}
            />
          </Field>

          <Field style={{ gridColumn: "span 2" }}>
            <Label>{t("pattern.daysOfWeek", "Days of Week")}</Label>
            <Days>
              {DOW.map((n, idx) => {
                const sel = (v as any).daysOfWeek?.includes(idx);
                return (
                  <Day
                    key={idx}
                    data-sel={String(sel)}
                    type="button"
                    onClick={() => toggleDow(idx)}
                    aria-pressed={sel}
                    aria-label={n}
                    title={n}
                  >
                    {n}
                  </Day>
                );
              })}
            </Days>
          </Field>
        </>
      )}

      {v.type === "dayOfMonth" && (
        <>
          <Field>
            <Label htmlFor="pat-every-m">{t("pattern.everyMonths", "Every (months)")}</Label>
            <Input
              id="pat-every-m"
              type="number"
              min={1}
              value={(v as any).every ?? 1}
              onChange={(e) => set({ every: clampNum(e.target.value, 1) })}
            />
          </Field>
          <Field>
            <Label htmlFor="pat-day">{t("pattern.day", "Day")}</Label>
            <Input
              id="pat-day"
              type="number"
              min={1}
              max={31}
              value={(v as any).day ?? 1}
              onChange={(e) => set({ day: toDay(e.target.value) })}
            />
          </Field>
        </>
      )}

      {v.type === "nthWeekday" && (
        <>
          <Field>
            <Label htmlFor="pat-every-m2">{t("pattern.everyMonths", "Every (months)")}</Label>
            <Input
              id="pat-every-m2"
              type="number"
              min={1}
              value={(v as any).every ?? 1}
              onChange={(e) => set({ every: clampNum(e.target.value, 1) })}
            />
          </Field>
          <Field>
            <Label htmlFor="pat-nth">{t("pattern.nth", "Nth")}</Label>
            <Input
              id="pat-nth"
              type="number"
              min={1}
              max={5}
              value={(v as any).nth ?? 1}
              onChange={(e) => set({ nth: toNth(e.target.value) })}
            />
          </Field>
          <Field>
            <Label htmlFor="pat-weekday">{t("pattern.weekday", "Weekday")}</Label>
            <Select
              id="pat-weekday"
              value={(v as any).weekday ?? 1}
              onChange={(e) => set({ weekday: toWeekday(e.target.value) as any })}
            >
              {DOW.map((n, i) => (
                <option key={i} value={i}>
                  {n}
                </option>
              ))}
            </Select>
          </Field>
        </>
      )}

      {v.type === "yearly" && (
        <>
          <Field>
            <Label htmlFor="pat-month">{t("pattern.month", "Month")}</Label>
            <Input
              id="pat-month"
              type="number"
              min={1}
              max={12}
              value={(v as any).month ?? 1}
              onChange={(e) => set({ month: toMonth(e.target.value) as any })}
            />
          </Field>
          <Field>
            <Label htmlFor="pat-day2">{t("pattern.day", "Day")}</Label>
            <Input
              id="pat-day2"
              type="number"
              min={1}
              max={31}
              value={(v as any).day ?? 1}
              onChange={(e) => set({ day: toDay(e.target.value) })}
            />
          </Field>
        </>
      )}

      {/* Özet */}
      <Preview aria-live="polite">
        <strong>{t("pattern.preview", "Preview")}:</strong> <code>{summary}</code>
      </Preview>
    </Wrap>
  );

  /* helpers */
  function onType(t: RecurrencePattern["type"]) {
    if (t === "weekly") onChange({ type: "weekly", every: 1, daysOfWeek: [1] });
    if (t === "dayOfMonth") onChange({ type: "dayOfMonth", every: 1, day: 1 });
    if (t === "nthWeekday") onChange({ type: "nthWeekday", every: 1, nth: 1, weekday: 1 });
    if (t === "yearly") onChange({ type: "yearly", month: 1, day: 1 });
  }

  function toggleDow(idx: number) {
    const days = new Set<number>((v as any).daysOfWeek || []);
    if (days.has(idx)) {
      days.delete(idx);
    } else {
      days.add(idx);
    }
    set({ daysOfWeek: Array.from(days).sort((a, b) => a - b) as any });
  }
}

/* ---------- converters (tip güvenli) ---------- */
type Weekday0to6 = 0|1|2|3|4|5|6;
type Nth1to5     = 1|2|3|4|5;
type Day1to31    = 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31;
type Month1to12  = 1|2|3|4|5|6|7|8|9|10|11|12;

function clampNum(s: string, min = 1, max?: number) {
  let n = Number(s);
  if (!Number.isFinite(n) || n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}
function toWeekday(s: string): Weekday0to6 { return clampNum(s, 0, 6) as Weekday0to6; }
function toNth(s: string): Nth1to5 { return clampNum(s, 1, 5) as Nth1to5; }
function toDay(s: string): Day1to31 { return clampNum(s, 1, 31) as Day1to31; }
function toMonth(s: string): Month1to12 { return clampNum(s, 1, 12) as Month1to12; }

function getWeekdayLabels(locale2: string) {
  // 2021-08-01 Pazar (0). 0..6 -> Pazar..Cumartesi
  const base = new Date(Date.UTC(2021, 7, 1));
  const fmt = new Intl.DateTimeFormat(locale2, { weekday: "short", timeZone: "UTC" });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() + i);
    return fmt.format(d);
  });
}

/* styled */
const Wrap = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: repeat(2, 1fr);
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;
const Field = styled.div` display: flex; flex-direction: column; gap: 6px; `;
const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const focusable = css`
  transition: border-color ${({ theme }) => theme.transition.fast}, box-shadow ${({ theme }) => theme.transition.fast};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  ${focusable}
`;
const Select = styled.select`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  ${focusable}
`;

const Days = styled.div` display: flex; gap: 6px; flex-wrap: wrap; `;
const Day = styled.button`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transition.fast}, color ${({ theme }) => theme.transition.fast}, border-color ${({ theme }) => theme.transition.fast};
  &[data-sel="true"] {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const Preview = styled.div`
  grid-column: 1 / -1;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 8px 10px;
  font-size: 12px;
  code { font-family: ${({ theme }) => theme.fonts.mono}; }
`;
