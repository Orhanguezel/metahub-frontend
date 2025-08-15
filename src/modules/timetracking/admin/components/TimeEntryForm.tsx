"use client";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/timetracking";
import { createTimeEntry, updateTimeEntry } from "@/modules/timetracking/slice/timeEntrySlice";
import type {
  ITimeEntry,
  IBreakEntry,
  IPayCode,
  IRoundingRule,
  IGeoPoint,
  IDeviceInfo,
} from "@/modules/timetracking/types";
import { DateTimeInput, BreaksEditor, JSONEditor } from "@/modules/timetracking";

export default function TimeEntryForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: ITimeEntry;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const dispatch = useAppDispatch();
  const isEdit = !!initial?._id;
  const { t } = useI18nNamespace("timetracking", translations);

  const [employeeRef, setEmployeeRef] = useState(initial?.employeeRef ?? "");
  const [jobRef, setJobRef] = useState(initial?.jobRef ?? "");
  const [serviceRef, setServiceRef] = useState(initial?.serviceRef ?? "");
  const [apartmentRef, setApartmentRef] = useState(initial?.apartmentRef ?? "");
  const [date, setDate] = useState<string>(toDateOnly(initial?.date) || toDateOnly(new Date()));
  const [clockInAt, setClockInAt] = useState<string>(toLocal(initial?.clockInAt));
  const [clockOutAt, setClockOutAt] = useState<string>(toLocal(initial?.clockOutAt));

  const [geoIn, setGeoIn] = useState<IGeoPoint | undefined>(initial?.geoIn);
  const [geoOut, setGeoOut] = useState<IGeoPoint | undefined>(initial?.geoOut);
  const [deviceIn, setDeviceIn] = useState<IDeviceInfo | undefined>(initial?.deviceIn);
  const [deviceOut, setDeviceOut] = useState<IDeviceInfo | undefined>(initial?.deviceOut);

  const [breaks, setBreaks] = useState<IBreakEntry[]>(initial?.breaks || []);
  const [notes, setNotes] = useState(initial?.notes || "");

  const [payCode, setPayCode] = useState<IPayCode | undefined>(initial?.payCode || { kind: "regular", billable: true });
  const [rounding, setRounding] = useState<IRoundingRule | undefined>(initial?.rounding);

  const [costRate, setCostRate] = useState<string>(initial?.costRateSnapshot?.toString() ?? "");
  const [billRate, setBillRate] = useState<string>(initial?.billRateSnapshot?.toString() ?? "");

  const [status, setStatus] = useState<ITimeEntry["status"]>(initial?.status ?? "open");
  const [source] = useState<ITimeEntry["source"]>(initial?.source ?? "manual");

  const canSubmit = useMemo(() => !!employeeRef && !!date, [employeeRef, date]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const data: Partial<ITimeEntry> = {
      employeeRef,
      jobRef: jobRef || undefined,
      serviceRef: serviceRef || undefined,
      apartmentRef: apartmentRef || undefined,
      date,
      clockInAt: clockInAt || undefined,
      clockOutAt: clockOutAt || undefined,
      geoIn,
      geoOut,
      deviceIn,
      deviceOut,
      breaks,
      notes,
      payCode,
      rounding,
      costRateSnapshot: costRate === "" ? undefined : Number(costRate),
      billRateSnapshot: billRate === "" ? undefined : Number(billRate),
      status,
      source,
    };
    try {
      if (isEdit) {
        await dispatch(updateTimeEntry({ id: initial!._id, data })).unwrap();
      } else {
        await dispatch(createTimeEntry({ data })).unwrap();
      }
      onSaved?.();
    } catch {
      /* errors toast'lanıyor slice içinde */
    }
  }

  return (
    <Form onSubmit={submit} aria-describedby="tt-form-desc">
      <VisuallyHidden id="tt-form-desc">{t("form.a11yDesc")}</VisuallyHidden>

      {/* Meta */}
      <Row>
        <Col>
          <Label>{t("form.employeeId")} *</Label>
          <Input value={employeeRef} onChange={(e) => setEmployeeRef(e.target.value)} required />
        </Col>
        <Col>
          <Label>{t("form.jobId")}</Label>
          <Input value={jobRef || ""} onChange={(e) => setJobRef(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("form.serviceId")}</Label>
          <Input value={serviceRef || ""} onChange={(e) => setServiceRef(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("form.apartmentId")}</Label>
          <Input value={apartmentRef || ""} onChange={(e) => setApartmentRef(e.target.value)} />
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("form.date")} *</Label>
          <DateTimeInput type="date" value={date} onChange={setDate} />
        </Col>
        <Col>
          <Label>{t("form.clockIn")}</Label>
          <DateTimeInput value={clockInAt} onChange={setClockInAt} />
          <Tiny type="button" onClick={() => setClockInAt(nowLocal())}>{t("form.now")}</Tiny>
        </Col>
        <Col>
          <Label>{t("form.clockOut")}</Label>
          <DateTimeInput value={clockOutAt} onChange={setClockOutAt} />
          <Tiny type="button" onClick={() => setClockOutAt(nowLocal())}>{t("form.now")}</Tiny>
        </Col>
        <Col>
          <Label>{t("form.status")}</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            {["open","submitted","approved","rejected","locked","exported"].map((s) => (
              <option key={s} value={s}>{t(`status.${s}`)}</option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* Geo & Device */}
      <Card>
        <Sub>{t("form.geoDevice")}</Sub>
        <Grid2>
          <JSONEditor label={t("form.geoIn")} value={geoIn} onChange={setGeoIn} placeholder={`{"type":"Point","coordinates":[29.0,41.0]}`} />
          <JSONEditor label={t("form.geoOut")} value={geoOut} onChange={setGeoOut} />
          <JSONEditor label={t("form.deviceIn")} value={deviceIn} onChange={setDeviceIn} placeholder={`{"kind":"mobile","platform":"iOS 17"}`} />
          <JSONEditor label={t("form.deviceOut")} value={deviceOut} onChange={setDeviceOut} />
        </Grid2>
      </Card>

      {/* Breaks */}
      <Card>
        <Sub>{t("form.breaks")}</Sub>
        <BreaksEditor value={breaks} onChange={setBreaks} />
      </Card>

      {/* Rates & Pay */}
      <Row>
        <Col>
          <Label>{t("form.costRateHour")}</Label>
          <Input
            type="number" min={0} step="0.01"
            value={costRate}
            onChange={(e) => setCostRate(e.target.value)}
            inputMode="decimal"
          />
        </Col>
        <Col>
          <Label>{t("form.billRateHour")}</Label>
          <Input
            type="number" min={0} step="0.01"
            value={billRate}
            onChange={(e) => setBillRate(e.target.value)}
            inputMode="decimal"
          />
        </Col>
        <Col>
          <Label>{t("form.payCode")}</Label>
          <Row2>
            <Select
              value={payCode?.kind || "regular"}
              onChange={(e) => setPayCode({ ...(payCode || {}), kind: e.target.value as any })}
            >
              {["regular","overtime","holiday","sick","vacation","other"].map((k) => (
                <option key={k} value={k}>{t(`paycode.${k}`)}</option>
              ))}
            </Select>
            <Check>
              <input
                type="checkbox"
                checked={payCode?.billable !== false}
                onChange={(e) => setPayCode({ ...(payCode || { kind: "regular" }), billable: e.target.checked })}
              />
              <span>{t("form.billable")}</span>
            </Check>
          </Row2>
        </Col>
        <Col>
          <Label>{t("form.rounding")}</Label>
          <Row2>
            <Input
              type="number"
              min={1}
              placeholder={t("form.roundToMinutes")}
              value={rounding?.roundToMinutes ?? ""}
              onChange={(e) =>
                setRounding((v) => ({ ...(v || {}), roundToMinutes: e.target.value === "" ? undefined : Number(e.target.value) }))
              }
            />
            <Select
              value={rounding?.strategy || "nearest"}
              onChange={(e) => setRounding((v) => ({ ...(v || {}), strategy: e.target.value as any }))}
            >
              {["nearest", "up", "down"].map((x) => (
                <option key={x} value={x}>{t(`round.${x}`)}</option>
              ))}
            </Select>
          </Row2>
        </Col>
      </Row>

      <Card>
        <Label>{t("form.notes")}</Label>
        <Area value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Card>

      <Actions>
        <Secondary type="button" onClick={onClose}>{t("form.cancel")}</Secondary>
        <Primary type="submit" disabled={!canSubmit}>
          {isEdit ? t("form.update") : t("form.create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* utils */
function toLocal(d?: string | Date) {
  if (!d) return "";
  const dt = new Date(d);
  const off = dt.getTimezoneOffset();
  return new Date(dt.getTime() - off * 60000).toISOString().slice(0, 16);
}
function nowLocal() {
  const dt = new Date();
  const off = dt.getTimezoneOffset();
  return new Date(dt.getTime() - off * 60000).toISOString().slice(0, 16);
}
function toDateOnly(d?: string | Date) {
  if (!d) return "";
  const dt = new Date(d);
  const off = dt.getTimezoneOffset();
  return new Date(dt.getTime() - off * 60000).toISOString().slice(0, 10);
}

/* styled */
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.md};
`;

const Row = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
  grid-template-columns: repeat(4, 1fr);

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }
  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Row2 = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Grid2 = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: repeat(2, 1fr);
  ${({ theme }) => theme.media.mobile} { grid-template-columns: 1fr; }
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const inputBase = `
  padding: 10px 12px;
  border-radius: var(--r-md);
  border: var(--b-thin) var(--c-input-border);
  background: var(--c-input-bg);
  color: var(--c-input-text);
  transition: box-shadow var(--t-fast), border-color var(--t-fast);
  &:focus {
    outline: none;
    border-color: var(--c-input-focus);
    box-shadow: var(--shadow-focus);
  }
`;

const Input = styled.input`
  --b-thin: ${({ theme }) => theme.borders.thin};
  --c-input-border: ${({ theme }) => theme.colors.inputBorder};
  --c-input-bg: ${({ theme }) => theme.inputs.background};
  --c-input-text: ${({ theme }) => theme.inputs.text};
  --c-input-focus: ${({ theme }) => theme.colors.inputBorderFocus};
  --shadow-focus: ${({ theme }) => theme.colors.shadowHighlight};
  --r-md: ${({ theme }) => theme.radii.md};
  --t-fast: ${({ theme }) => theme.durations.fast};
  ${inputBase}
`;

const Select = styled.select`
  --b-thin: ${({ theme }) => theme.borders.thin};
  --c-input-border: ${({ theme }) => theme.colors.inputBorder};
  --c-input-bg: ${({ theme }) => theme.inputs.background};
  --c-input-text: ${({ theme }) => theme.inputs.text};
  --c-input-focus: ${({ theme }) => theme.colors.inputBorderFocus};
  --shadow-focus: ${({ theme }) => theme.colors.shadowHighlight};
  --r-md: ${({ theme }) => theme.radii.md};
  --t-fast: ${({ theme }) => theme.durations.fast};
  ${inputBase}
`;

const Area = styled.textarea`
  --b-thin: ${({ theme }) => theme.borders.thin};
  --c-input-border: ${({ theme }) => theme.colors.inputBorder};
  --c-input-bg: ${({ theme }) => theme.inputs.background};
  --c-input-text: ${({ theme }) => theme.inputs.text};
  --c-input-focus: ${({ theme }) => theme.colors.inputBorderFocus};
  --shadow-focus: ${({ theme }) => theme.colors.shadowHighlight};
  --r-md: ${({ theme }) => theme.radii.md};
  --t-fast: ${({ theme }) => theme.durations.fast};
  min-height: 90px;
  ${inputBase}
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
`;

const Sub = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const Tiny = styled.button`
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.8;
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.link};
  &:hover { color: ${({ theme }) => theme.colors.linkHover}; }
`;

const Check = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  user-select: none;
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const Primary = styled.button`
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  border: ${({ theme }) => theme.borders.thin} transparent;
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.buttons.primary.backgroundHover}; }
  &:disabled { opacity: ${({ theme }) => theme.opacity.disabled}; cursor: not-allowed; }
`;

const Secondary = styled.button`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.buttons.secondary.backgroundHover}; color: ${({ theme }) => theme.buttons.secondary.textHover}; }
`;

/* a11y helper */
const VisuallyHidden = styled.span`
  position: absolute !important;
  height: 1px; width: 1px;
  overflow: hidden; clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap; border: 0; padding: 0; margin: -1px;
`;
