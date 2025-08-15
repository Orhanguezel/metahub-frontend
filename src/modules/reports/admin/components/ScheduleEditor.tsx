"use client";
import styled, { css } from "styled-components";
import { useEffect, useState } from "react";
import type { IReportSchedule, ScheduleFreq } from "@/modules/reports/types";
import { SCHEDULE_FREQS } from "@/modules/reports/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/reports";

export default function ScheduleEditor({
  value,
  onChange,
}: {
  value?: IReportSchedule;
  onChange: (v: IReportSchedule | undefined) => void;
}) {
  const { t } = useI18nNamespace("reports", translations);

  const [val, setVal] = useState<IReportSchedule>(() => value || { isEnabled: false, frequency: "monthly" });

  useEffect(() => {
    if (value) setVal(value);
  }, [value]);

  const emit = (next: Partial<IReportSchedule>) => {
    const merged = { ...(val || {}), ...next };
    setVal(merged);
    onChange(merged);
  };

  const removeRecip = (i: number) => {
    const list = [...(val?.recipients || [])];
    list.splice(i, 1);
    emit({ recipients: list });
  };
  const addRecip = () => {
    const list = [
      ...(val?.recipients || []),
      { channel: "email" as const, target: "", format: "csv" as const },
    ];
    emit({ recipients: list });
  };
  const updateRecip = (
    i: number,
    patch: Partial<NonNullable<IReportSchedule["recipients"]>[number]>
  ) => {
    const list = [...(val?.recipients || [])];
    list[i] = { ...list[i], ...patch };
    emit({ recipients: list });
  };

  // helper: string -> 0..6 | undefined (type-safe)
type DayOfWeek = Exclude<IReportSchedule["dayOfWeek"], undefined>;
const toDayOfWeek = (v: string): DayOfWeek | undefined => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? (n as DayOfWeek) : undefined;
};


  return (
    <Wrap>
      <Row>
        <Check>
          <input
            type="checkbox"
            checked={!!val?.isEnabled}
            onChange={(e) => emit({ isEnabled: e.target.checked })}
            aria-label={t("schedule.enabled", "Enable Schedule")}
          />
          <span>{t("schedule.enabled", "Enable Schedule")}</span>
        </Check>

        <Field>
          <Label htmlFor="sch-freq">{t("schedule.frequency", "Frequency")}</Label>
          <Select
            id="sch-freq"
            value={val?.frequency || "monthly"}
            onChange={(e) => emit({ frequency: e.target.value as ScheduleFreq })}
          >
            {SCHEDULE_FREQS.map((f) => (
              <option key={f} value={f}>
                {t(`schedule.freq.${f}`, f)}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          <Label htmlFor="sch-tz">{t("schedule.timezone", "Timezone")}</Label>
          <Input
            id="sch-tz"
            value={val?.timezone || ""}
            onChange={(e) => emit({ timezone: e.target.value })}
            placeholder="Europe/Istanbul"
          />
        </Field>

        <Field>
          <Label htmlFor="sch-tod">{t("schedule.timeOfDay", "Time of Day")}</Label>
          <Input
            id="sch-tod"
            type="time"
            value={val?.timeOfDay || ""}
            onChange={(e) => emit({ timeOfDay: e.target.value })}
          />
        </Field>
      </Row>

      {val?.frequency === "weekly" && (
  <Row>
    <Field>
      <Label htmlFor="sch-dow">{t("schedule.dayOfWeek", "Day of Week")}</Label>
      <Input
        id="sch-dow"
        type="number"
        min={0}
        max={6}
        step={1}
        value={val?.dayOfWeek ?? ""}
        onChange={(e) =>
          emit({
            dayOfWeek: e.target.value === "" ? undefined : toDayOfWeek(e.target.value),
          })
        }
      />
    </Field>
  </Row>
)}


      {(val?.frequency === "monthly" ||
        val?.frequency === "quarterly" ||
        val?.frequency === "yearly") && (
        <Row>
          <Field>
            <Label htmlFor="sch-dom">{t("schedule.dayOfMonth", "Day of Month")}</Label>
            <Input
              id="sch-dom"
              type="number"
              min={1}
              max={31}
              value={val?.dayOfMonth ?? ""}
              onChange={(e) =>
                emit({ dayOfMonth: e.target.value === "" ? undefined : Number(e.target.value) })
              }
            />
          </Field>
        </Row>
      )}

      {val?.frequency === "cron" && (
        <Row>
          <Field style={{ flex: 1 }}>
            <Label htmlFor="sch-cron">{t("schedule.cron", "CRON")}</Label>
            <Input
              id="sch-cron"
              value={val?.cron || ""}
              onChange={(e) => emit({ cron: e.target.value })}
              placeholder="0 9 * * MON"
            />
          </Field>
        </Row>
      )}

      <Block role="group" aria-label={t("schedule.recipients", "Recipients")}>
        <SubTitle>{t("schedule.recipients", "Recipients")}</SubTitle>
        <RecipList>
          {(val?.recipients || []).map((r, i) => (
            <RecipRow key={`${r.channel}-${i}`}>
              <Select
                value={r.channel}
                onChange={(e) => updateRecip(i, { channel: e.target.value as "email" | "webhook" })}
                aria-label={t("schedule.recipient.channel", "Channel")}
              >
                <option value="email">email</option>
                <option value="webhook">webhook</option>
              </Select>

              <Input
                style={{ flex: 1 }}
                placeholder={r.channel === "email" ? "name@company.com" : "https://..."}
                value={r.target}
                onChange={(e) => updateRecip(i, { target: e.target.value })}
                aria-label={t("schedule.recipient.target", "Target")}
              />

              <Select
                value={r.format || "csv"}
                onChange={(e) => updateRecip(i, { format: e.target.value as "csv" | "xlsx" | "pdf" | "json" })}
                aria-label={t("schedule.recipient.format", "Format")}
              >
                {["csv", "xlsx", "pdf", "json"].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>

              <SmallBtn type="button" onClick={() => removeRecip(i)}>
                {t("actions.remove", "Remove")}
              </SmallBtn>
            </RecipRow>
          ))}

          <SmallBtn type="button" onClick={addRecip}>
            + {t("actions.addRecipient", "Add Recipient")}
          </SmallBtn>
        </RecipList>
      </Block>
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;
const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  flex-wrap: wrap;
`;
const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 200px;
`;
const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const focusable = css`
  transition: border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast};
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
const Check = styled.label`
  display: flex;
  gap: 8px;
  align-items: center;
`;
const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: ${({ theme }) => theme.spacings.sm};
`;
const SubTitle = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;
const RecipList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.xs};
`;
const RecipRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  align-items: center;
`;
const SmallBtn = styled.button`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
`;
