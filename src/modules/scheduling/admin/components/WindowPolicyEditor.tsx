// src/modules/scheduling/ui/components/WindowPolicyEditor.tsx
"use client";
import styled, { css } from "styled-components";
import { IGenerationPolicy, ITimeWindow } from "@/modules/scheduling/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/scheduling";

type Option = { value: string; label: string };

export default function WindowPolicyEditor({
  windowValue,
  policyValue,
  onWindowChange,
  onPolicyChange,
  employeeOptions, // ❗ parent (PlanForm) store'dan geçiriyor
}: {
  windowValue?: ITimeWindow;
  policyValue?: IGenerationPolicy;
  onWindowChange: (v: ITimeWindow) => void;
  onPolicyChange: (v: IGenerationPolicy) => void;
  employeeOptions?: Option[];
}) {
  const { t } = useI18nNamespace("scheduling", translations);

  const w = windowValue || {};
  const p = policyValue || {};
  const ew = (patch: Partial<ITimeWindow>) => onWindowChange({ ...w, ...patch });
  const ep = (patch: Partial<IGenerationPolicy>) => onPolicyChange({ ...p, ...patch });

  // ---- helpers ----
  const clampNum = (n: number, min = 0, max?: number) => {
    let x = Number.isFinite(n) ? n : min;
    if (x < min) x = min;
    if (typeof max === "number" && x > max) x = max;
    return x;
  };
  const parseHHMM = (s?: string) => {
    if (!s || !/^\d{2}:\d{2}$/.test(s)) return null;
    const [hh, mm] = s.split(":").map(Number);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
    return hh * 60 + mm;
  };

  const startMin = parseHHMM(w.startTime);
  const endMin = parseHHMM(w.endTime);
  const invalidTimeRange = startMin != null && endMin != null && endMin <= startMin;

  // min/max ekip büyüklüğü: auto-fix
  const onMinCrew = (val: string) => {
    const minCrew = val === "" ? undefined : clampNum(Number(val), 1);
    let maxCrew = p.maxCrewSize;
    if (minCrew != null && maxCrew != null && minCrew > maxCrew) {
      maxCrew = minCrew;
    }
    ep({ minCrewSize: minCrew, maxCrewSize: maxCrew });
  };
  const onMaxCrew = (val: string) => {
    const maxCrew = val === "" ? undefined : clampNum(Number(val), 1);
    let minCrew = p.minCrewSize;
    if (minCrew != null && maxCrew != null && minCrew > maxCrew) {
      minCrew = maxCrew;
    }
    ep({ minCrewSize: minCrew, maxCrewSize: maxCrew });
  };

  const onLead = (val: string) => ep({ leadTimeDays: clampNum(Number(val), 0) });
  const onLock = (val: string) => ep({ lockAheadPeriods: clampNum(Number(val), 0) });

  const onPreferredMulti = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ids = Array.from(e.target.selectedOptions).map((o) => o.value).filter(Boolean);
    ep({ preferredEmployees: ids });
  };

  const onPreferredText = (val: string) => {
    const ids = val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    ep({ preferredEmployees: ids });
  };

  return (
    <Wrap>
      {/* ---- Time Window ---- */}
      <Card as="fieldset" role="group" aria-label={t("window.title", "Time Window")}>
        <Legend>{t("window.title", "Time Window")}</Legend>
        <Row>
          <Field>
            <Label htmlFor="tw-start">{t("window.start", "Start")}</Label>
            <Input
              id="tw-start"
              type="time"
              value={w.startTime || ""}
              onChange={(e) => ew({ startTime: e.target.value || undefined })}
            />
          </Field>
          <Field>
            <Label htmlFor="tw-end">{t("window.end", "End")}</Label>
            <Input
              id="tw-end"
              type="time"
              value={w.endTime || ""}
              onChange={(e) => ew({ endTime: e.target.value || undefined })}
              data-invalid={invalidTimeRange || undefined}
              aria-invalid={invalidTimeRange || undefined}
            />
            {invalidTimeRange && (
              <Error role="status" aria-live="polite">
                {t("window.err.range", "End time must be after start time.")}
              </Error>
            )}
          </Field>
          <Field>
            <Label htmlFor="tw-dur">{t("window.duration", "Duration (min)")}</Label>
            <Input
              id="tw-dur"
              type="number"
              min={0}
              value={pInt(w.durationMinutes) ?? ""}
              onChange={(e) =>
                ew({
                  durationMinutes:
                    e.target.value === "" ? undefined : clampNum(Number(e.target.value), 0),
                })
              }
              placeholder="30"
            />
          </Field>
        </Row>
      </Card>

      {/* ---- Generation Policy ---- */}
      <Card as="fieldset" role="group" aria-label={t("policy.title", "Generation Policy")}>
        <Legend>{t("policy.title", "Generation Policy")}</Legend>

        <Row>
          <Field>
            <Label htmlFor="pol-lead">{t("policy.leadTimeDays", "Lead Time (days)")}</Label>
            <Input
              id="pol-lead"
              type="number"
              min={0}
              value={pInt(p.leadTimeDays) ?? 3}
              onChange={(e) => onLead(e.target.value)}
            />
          </Field>

          <Field>
            <Label htmlFor="pol-lock">{t("policy.lockAhead", "Lock Ahead Periods")}</Label>
            <Input
              id="pol-lock"
              type="number"
              min={0}
              value={pInt(p.lockAheadPeriods) ?? 1}
              onChange={(e) => onLock(e.target.value)}
            />
          </Field>

          <Field>
            <Label>{t("policy.autoAssign", "Auto Assign")}</Label>
            <Check>
              <input
                type="checkbox"
                checked={!!p.autoAssign}
                onChange={(e) => ep({ autoAssign: e.target.checked })}
                aria-label={t("policy.autoAssign", "Auto Assign")}
              />
              <span>{p.autoAssign ? t("common.yes", "Yes") : t("common.no", "No")}</span>
            </Check>
          </Field>
        </Row>

        <Row>
          {/* Preferred employees: options varsa multi-select, yoksa text fallback */}
          <Field style={{ gridColumn: "span 2" }}>
            <Label htmlFor="pol-pref">
              {t("policy.preferredEmployees", "Preferred Employees")}
            </Label>

            {Array.isArray(employeeOptions) && employeeOptions.length > 0 ? (
              <Select
                id="pol-pref"
                multiple
                size={Math.min(8, Math.max(3, employeeOptions.length))}
                value={(p.preferredEmployees || []).map(String)}
                onChange={onPreferredMulti}
                aria-describedby="pref-help"
              >
                {employeeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id="pol-pref"
                value={(p.preferredEmployees || []).join(",")}
                onChange={(e) => onPreferredText(e.target.value)}
                placeholder="64b9...,64c0...,..."
                aria-describedby="pref-help"
              />
            )}
            <Hint id="pref-help">
              {t(
                "policy.preferredHint",
                "Hold Ctrl/Cmd to select multiple. If the list is empty, enter comma-separated IDs."
              )}
            </Hint>
          </Field>

          <Field>
            <Label htmlFor="pol-min">{t("policy.minCrew", "Min Crew")}</Label>
            <Input
              id="pol-min"
              type="number"
              min={1}
              value={pInt(p.minCrewSize) ?? ""}
              onChange={(e) => onMinCrew(e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="pol-max">{t("policy.maxCrew", "Max Crew")}</Label>
            <Input
              id="pol-max"
              type="number"
              min={1}
              value={pInt(p.maxCrewSize) ?? ""}
              onChange={(e) => onMaxCrew(e.target.value)}
            />
          </Field>
        </Row>
      </Card>
    </Wrap>
  );
}

/* utils */
function pInt(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/* styled */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
`;

const Legend = styled.legend`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 6px;
`;

const Row = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: repeat(3, 1fr);
  ${({ theme }) => theme.media.tablet} { grid-template-columns: repeat(2, 1fr); }
  ${({ theme }) => theme.media.mobile} { grid-template-columns: 1fr; }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

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

  &[data-invalid="true"] {
    border-color: ${({ theme }) => theme.colors.danger};
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  ${focusable}
`;

const Check = styled.label`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Hint = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Error = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.danger};
  margin-top: 2px;
`;
