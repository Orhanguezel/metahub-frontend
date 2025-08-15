"use client";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/billing/locales";
import { useAppDispatch } from "@/store/hooks";
import { createPlan, updatePlan } from "@/modules/billing/slice/billingSlice";
import type { IBillingPlan, DueRule, BillingPeriod } from "@/modules/billing/types";

interface Props {
  initial?: IBillingPlan;
  onClose: () => void;
  onSaved?: () => void;
}

type Mode = "fixed" | "perLine";

export default function BillingPlanForm({ initial, onClose, onSaved }: Props) {
  const { t } = useI18nNamespace("billing", translations);
  const dispatch = useAppDispatch();

  /* ---- form state ---- */
  const [code, setCode] = useState(initial?.code || "");
  const [mode, setMode] = useState<Mode>(initial?.source.mode || "fixed");
  const [contract, setContract] = useState<string>(initial?.source.contract || "");
  const [contractLine, setContractLine] = useState<string>(initial?.source.contractLine || "");

  const [amount, setAmount] = useState<number>(Number(initial?.schedule.amount ?? 0));
  const [currency, setCurrency] = useState<string>(initial?.schedule.currency || "EUR");
  const [period, setPeriod] = useState<BillingPeriod>(initial?.schedule.period || "monthly");

  const [dueType, setDueType] = useState<DueRule["type"]>(
    initial?.schedule.dueRule?.type || "dayOfMonth"
  );
  const [day, setDay] = useState<number>((initial?.schedule.dueRule as any)?.day ?? 1);
  const [nth, setNth] = useState<number>((initial?.schedule.dueRule as any)?.nth ?? 1);
  const [weekday, setWeekday] = useState<number>((initial?.schedule.dueRule as any)?.weekday ?? 1);

  const [startDate, setStartDate] = useState<string>(
    initial?.schedule.startDate ? new Date(initial.schedule.startDate).toISOString().slice(0, 10) : ""
  );
  const [endDate, setEndDate] = useState<string>(
    initial?.schedule.endDate ? new Date(initial.schedule.endDate).toISOString().slice(0, 10) : ""
  );
  const [graceDays, setGraceDays] = useState<number>(Number(initial?.schedule.graceDays ?? 0));

  const isEdit = Boolean(initial?._id);

  useEffect(() => {
    if (!initial) return;
    setCode(initial.code || "");
  }, [initial]);

  const dueRule: DueRule = useMemo(() => {
    return dueType === "dayOfMonth"
      ? { type: "dayOfMonth", day: Number(day) || 1 }
      : {
          type: "nthWeekday",
          nth: (Number(nth) as 1 | 2 | 3 | 4 | 5) || 1,
          weekday: (Number(weekday) as 0 | 1 | 2 | 3 | 4 | 5 | 6) ?? 1,
        };
  }, [dueType, day, nth, weekday]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<IBillingPlan> = {
      code: code || undefined, // backend boşsa kendisi üretir
      source: { mode, contract, contractLine: contractLine || undefined },
      schedule: {
        amount: Number(amount),
        currency,
        period,
        dueRule,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        graceDays: Number(graceDays) || 0,
      },
    };

    try {
      if (isEdit && initial) {
        await dispatch(updatePlan({ id: initial._id, changes: payload })).unwrap();
      } else {
        await dispatch(createPlan(payload)).unwrap();
      }
      onSaved?.();
    } catch {
      // hata mesajları slice içinde toast'lanıyor
    }
  };

  /* weekday etiketleri */
  const weekdayLabel = (w: number) =>
    t(`weekdays.${w}`, String(w)); // 0..6 için çeviri, yoksa numerik

  const weekdayOptions = [0, 1, 2, 3, 4, 5, 6].map((w) => (
    <option key={w} value={w}>
      {weekdayLabel(w)}
    </option>
  ));

  return (
    <Form onSubmit={onSubmit} role="form" aria-label={t("form.title", "Billing Plan Form")}>
      {/* ROW 1 */}
      <Row>
        <Col>
          <Label htmlFor="bp-code">{t("form.code", "Code")}</Label>
          <Input
            id="bp-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("form.codePlaceholder", "(auto if empty)")}
            aria-label={t("form.code", "Code")}
          />
        </Col>

        <Col>
          <Label htmlFor="bp-mode">{t("form.mode", "Mode")}</Label>
          <Select id="bp-mode" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="fixed">{t("mode.fixed", "fixed")}</option>
            <option value="perLine">{t("mode.perLine", "perLine")}</option>
          </Select>
        </Col>

        <Col>
          <Label htmlFor="bp-contract">{t("form.contract", "Contract (ObjectId)")}</Label>
          <Input
            id="bp-contract"
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            required
          />
        </Col>

        <Col>
          <Label htmlFor="bp-contractLine">{t("form.contractLine", "Contract Line (optional)")}</Label>
          <Input
            id="bp-contractLine"
            value={contractLine}
            onChange={(e) => setContractLine(e.target.value)}
          />
        </Col>
      </Row>

      {/* ROW 2 */}
      <Row>
        <Col>
          <Label htmlFor="bp-amount">{t("form.amount", "Amount")}</Label>
          <Input
            id="bp-amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
            inputMode="decimal"
          />
        </Col>

        <Col>
          <Label htmlFor="bp-currency">{t("form.currency", "Currency")}</Label>
          {/* serbest bıraktık ama sık kullanılanlar için datalist verdik */}
          <Input
            id="bp-currency"
            list="bp-currency-list"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="EUR"
          />
          <datalist id="bp-currency-list">
            <option value="EUR" />
            <option value="USD" />
            <option value="TRY" />
          </datalist>
        </Col>

        <Col>
          <Label htmlFor="bp-period">{t("form.period", "Period")}</Label>
          <Select
            id="bp-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as BillingPeriod)}
          >
            <option value="weekly">{t("period.weekly", "weekly")}</option>
            <option value="monthly">{t("period.monthly", "monthly")}</option>
            <option value="quarterly">{t("period.quarterly", "quarterly")}</option>
            <option value="yearly">{t("period.yearly", "yearly")}</option>
          </Select>
        </Col>

        <Col>
          <Label htmlFor="bp-grace">{t("form.graceDays", "Grace Days")}</Label>
          <Input
            id="bp-grace"
            type="number"
            min={0}
            value={graceDays}
            onChange={(e) => setGraceDays(Number(e.target.value))}
            inputMode="numeric"
          />
        </Col>
      </Row>

      {/* ROW 3 - Due Rule */}
      <Row>
        <Col>
          <Label htmlFor="bp-dueType">{t("form.dueType", "Due Type")}</Label>
          <Select
            id="bp-dueType"
            value={dueType}
            onChange={(e) => setDueType(e.target.value as DueRule["type"])}
          >
            <option value="dayOfMonth">{t("due.dayOfMonth", "dayOfMonth")}</option>
            <option value="nthWeekday">{t("due.nthWeekday", "nthWeekday")}</option>
          </Select>
        </Col>

        {dueType === "dayOfMonth" ? (
          <Col>
            <Label htmlFor="bp-day">{t("form.day", "Day")}</Label>
            <Input
              id="bp-day"
              type="number"
              min={1}
              max={31}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              inputMode="numeric"
            />
          </Col>
        ) : (
          <>
            <Col>
              <Label htmlFor="bp-nth">{t("form.nth", "Nth")}</Label>
              <Select id="bp-nth" value={nth} onChange={(e) => setNth(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Col>
            <Col>
              <Label htmlFor="bp-weekday">{t("form.weekday", "Weekday")}</Label>
              <Select
                id="bp-weekday"
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
              >
                {weekdayOptions}
              </Select>
            </Col>
          </>
        )}
      </Row>

      {/* ROW 4 - Dates */}
      <Row>
        <Col>
          <Label htmlFor="bp-start">{t("form.startDate", "Start Date")}</Label>
          <Input
            id="bp-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </Col>

        <Col>
          <Label htmlFor="bp-end">{t("form.endDate", "End Date")}</Label>
          <Input id="bp-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </Col>
      </Row>

      <Actions>
        <SecondaryBtn type="button" onClick={onClose}>
          {t("actions.cancel", "Cancel")}
        </SecondaryBtn>
        <PrimaryBtn type="submit">
          {isEdit ? t("actions.update", "Update") : t("actions.create", "Create")}
        </PrimaryBtn>
      </Actions>
    </Form>
  );
}

/* ---- styled (classicTheme-compliant) ---- */
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacings.sm};
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
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

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: border-color ${({ theme }) => theme.transition.fast}, box-shadow ${({ theme }) =>
  theme.transition.fast};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }
  &::placeholder { color: ${({ theme }) => theme.inputs.placeholder}; }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: border-color ${({ theme }) => theme.transition.fast}, box-shadow ${({ theme }) =>
  theme.transition.fast};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacings.xs};
`;

const BaseBtn = styled.button`
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  border: ${({ theme }) => theme.borders.thin} transparent;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: opacity ${({ theme }) => theme.transition.fast}, transform ${({ theme }) =>
  theme.transition.fast};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  &:hover { opacity: ${({ theme }) => theme.opacity.hover}; }
  &:disabled { opacity: ${({ theme }) => theme.opacity.disabled}; cursor: not-allowed; }
  &:active { transform: translateY(1px); }
`;

const PrimaryBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border-color: ${({ theme }) => theme.buttons.primary.background};
`;

const SecondaryBtn = styled(BaseBtn)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border-color: ${({ theme }) => theme.colors.border};
`;
