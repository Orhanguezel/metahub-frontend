"use client";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { JSONEditor } from "@/shared";
import type { IOpeningHour } from "@/modules/branch/types";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/branch/locales";

/* Redux */
import { useDispatch, useSelector } from "react-redux";
import { selectBranchSelected, updateBranch } from "@/modules/branch/slice";

type Props = {
  isOpen: boolean;
  tenant?: string;
  value?: IOpeningHour[];
  branchId?: string; // <-- önemli
  onClose?: () => void;
  onSave?: (rows: IOpeningHour[]) => void;
  onSubmit?: (rows: IOpeningHour[]) => Promise<void> | void;
};

const isHHmm = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export default function OpeningHoursForm({
  isOpen,
  tenant,
  value,
  branchId,
  onClose,
  onSave,
  onSubmit,
}: Props) {
  const { t } = useI18nNamespace("branch", translations);

  const dispatch = useDispatch<any>();
  const selected = useSelector(selectBranchSelected);
  const selectedId = selected?._id as string | undefined;
  const initialFromStore = selected?.openingHours as IOpeningHour[] | undefined;

  const dayOpts = useMemo(
    () => [
      { v: 0, label: `0 — ${t("days.sun", "Sun")}` },
      { v: 1, label: `1 — ${t("days.mon", "Mon")}` },
      { v: 2, label: `2 — ${t("days.tue", "Tue")}` },
      { v: 3, label: `3 — ${t("days.wed", "Wed")}` },
      { v: 4, label: `4 — ${t("days.thu", "Thu")}` },
      { v: 5, label: `5 — ${t("days.fri", "Fri")}` },
      { v: 6, label: `6 — ${t("days.sat", "Sat")}` },
    ],
    [t]
  );

  const [mode, setMode] = useState<"simple" | "json">("simple");
  const [rows, setRows] = useState<IOpeningHour[]>([]);
  const [open, setOpen] = useState<boolean>(!!isOpen);

  useEffect(() => setOpen(!!isOpen), [isOpen]);

  // 1) prop.value  2) store.selected.openingHours  3) fallback
  useEffect(() => {
    const src = (Array.isArray(value) ? value : initialFromStore) ?? [];
    const normalized = (src.length ? src : [{ day: 1, open: "09:00", close: "18:00" }])
      .map((r) => ({ day: Number(r.day), open: String(r.open ?? ""), close: String(r.close ?? "") }))
      .sort((a, b) => a.day - b.day);
    setRows(normalized);
  }, [value, initialFromStore, isOpen]);

  const stop = (e?: React.MouseEvent) => { e?.preventDefault(); e?.stopPropagation(); };

  const addRow = (e?: React.MouseEvent) => { stop(e); setRows((r) => [...r, { day: 1, open: "09:00", close: "18:00" }]); };
  const removeRow = (idx: number, e?: React.MouseEvent) => { stop(e); setRows((r) => r.filter((_, i) => i !== idx)); };
  const update = (idx: number, patch: Partial<IOpeningHour>) =>
    setRows((r) => r.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const errors = useMemo(() => {
    const e: string[] = [];
    rows.forEach((r, i) => {
      if (r.day < 0 || r.day > 6) e.push(t("oh.error.day", `Row ${i + 1}: day must be 0..6`));
      if (!isHHmm(r.open)) e.push(t("oh.error.open", `Row ${i + 1}: open must be HH:mm`));
      if (!isHHmm(r.close)) e.push(t("oh.error.close", `Row ${i + 1}: close must be HH:mm`));
      if (isHHmm(r.open) && isHHmm(r.close) && r.open >= r.close)
        e.push(t("oh.error.order", `Row ${i + 1}: open must be before close`));
    });
    return e;
  }, [rows, t]);

  const handleSave = async (e?: React.MouseEvent) => {
    stop(e);
    if (errors.length) return alert(errors.join("\n"));

    const normalized = rows
      .map((r) => ({ day: Number(r.day), open: r.open, close: r.close }))
      .sort((a, b) => a.day - b.day);

    onSave?.(normalized);

    if (onSubmit) {
      await onSubmit(normalized);
    } else {
      const id = branchId ?? selectedId;
      if (!id) {
        alert("Branch id bulunamadı. Parent’tan branchId geç veya store’da selected’ı set et.");
        return;
      }
      await dispatch(updateBranch({ id, patch: { openingHours: normalized } })).unwrap();
    }

    onClose?.();
    setOpen(false);
  };

  const handleClose = (e?: React.MouseEvent) => { stop(e); onClose?.(); setOpen(false); };

  if (!open) {
    return (
      <Collapsed>
        <span>{t("oh.title", "Opening Hours")}{tenant ? ` — ${tenant}` : ""}</span>
        <Primary onClick={(e) => { stop(e); setOpen(true); }}>{t("edit", "Edit")}</Primary>
      </Collapsed>
    );
  }

  return (
    <Wrap role="group" aria-label={t("oh.title", "Opening Hours")} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
      <Header>
        <h3>{t("oh.title", "Opening Hours")}{tenant ? ` — ${tenant}` : ""}</h3>
        <ModeSwitch>
          <ModeBtn $active={mode === "simple"} onClick={(e) => { stop(e); setMode("simple"); }}>{t("mode.simple", "Simple")}</ModeBtn>
          <ModeBtn $active={mode === "json"} onClick={(e) => { stop(e); setMode("json"); }}>{t("mode.json", "JSON")}</ModeBtn>
        </ModeSwitch>
      </Header>

      {mode === "simple" ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>{t("oh.day", "Day")}</th>
                <th>{t("oh.open", "Open")}</th>
                <th>{t("oh.close", "Close")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>
                    <Select value={r.day} onChange={(e) => update(i, { day: Number(e.target.value) })}>
                      {dayOpts.map((d) => <option key={d.v} value={d.v}>{d.label}</option>)}
                    </Select>
                  </td>
                  <td><Input value={r.open} onChange={(e) => update(i, { open: e.target.value })} placeholder={t("oh.open_ph", "09:00")} /></td>
                  <td><Input value={r.close} onChange={(e) => update(i, { close: e.target.value })} placeholder={t("oh.close_ph", "18:00")} /></td>
                  <td style={{ textAlign: "right" }}><Danger onClick={(e) => removeRow(i, e)}>{t("remove", "Remove")}</Danger></td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Row><Secondary onClick={addRow}>{t("oh.add", "+ Add")}</Secondary></Row>
          {!!errors.length && <ErrorBox role="alert">{errors.join(" • ")}</ErrorBox>}
        </>
      ) : (
        <JSONEditor
          label={t("oh.json_label", "Opening Hours JSON")}
          value={rows}
          onChange={(v: any) => setRows(Array.isArray(v) ? v : [])}
          placeholder={`[
  { "day": 1, "open": "09:00", "close": "22:00" },
  { "day": 2, "open": "09:00", "close": "22:00" }
]`}
        />
      )}

      <Actions>
        <Secondary onClick={handleClose}>{t("close", "Close")}</Secondary>
        <Primary onClick={handleSave}>{t("save", "Save")}</Primary>
      </Actions>
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`display:flex;flex-direction:column;gap:12px;min-width:360px;`;
const Collapsed = styled.div`display:flex;align-items:center;gap:8px;`;
const Header = styled.div`display:flex;justify-content:space-between;align-items:center;`;
const ModeSwitch = styled.div`display:flex;gap:6px;`;
const ModeBtn = styled.button.attrs({ type: "button" })<{ $active:boolean }>`
  padding:6px 10px;border-radius:${({theme})=>theme.radii.pill};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({$active,theme})=>$active?theme.colors.primaryLight:theme.colors.cardBackground};
`;
const Table = styled.table`
  width:100%;border-collapse:collapse;
  th, td{ padding:8px; border-bottom:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderBright}; }
  th{ text-align:left; color:${({theme})=>theme.colors.textSecondary}; }
`;
const Select = styled.select`
  padding:8px 10px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;
const Input = styled.input`
  padding:8px 10px; border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};
`;
const Row = styled.div`display:flex;justify-content:flex-end;`;
const Actions = styled.div`display:flex;gap:8px;justify-content:flex-end;`;
const Primary = styled.button.attrs({ type: "button" })`
  background:${({theme})=>theme.buttons.primary.background}; color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const Secondary = styled.button.attrs({ type: "button" })`
  background:${({theme})=>theme.buttons.secondary.background}; color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px; border-radius:${({theme})=>theme.radii.md}; cursor:pointer;
`;
const Danger = styled(Secondary)``;
const ErrorBox = styled.div`
  color:${({theme})=>theme.colors.danger};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.danger};
  padding:8px; border-radius:${({theme})=>theme.radii.md};
`;
