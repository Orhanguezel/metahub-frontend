"use client";
import styled, { css } from "styled-components";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { createDefinition, updateDefinition } from "@/modules/reports/slice/reportsSlice";
import type { IReportDefinition, ReportKind } from "@/modules/reports/types";
import {ScheduleEditor,JSONEditor} from "@/modules/reports";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/reports";

const KINDS: ReportKind[] = [
  "ar_aging","ap_aging","revenue","expense","cashflow",
  "profitability","billing_forecast","invoice_collections",
  "employee_utilization","workload","service_performance",
];

export default function DefinitionForm({
  initial, onClose, onSaved
}: { initial?: IReportDefinition; onClose: () => void; onSaved?: ()=>void; }) {
  const dispatch = useAppDispatch();
  const { t } = useI18nNamespace("reports", translations);
  const isEdit = !!initial?._id;

  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [kind, setKind] = useState<ReportKind>(initial?.kind ?? "revenue");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [defaultFilters, setDefaultFilters] = useState<any>(initial?.defaultFilters || undefined);
  const [view, setView] = useState<any>(initial?.view || { type: "table" });
  const [exportFormats, setExportFormats] = useState<Array<"csv"|"xlsx"|"pdf"|"json">>(
    initial?.exportFormats || ["csv","xlsx"]
  );
  const [schedule, setSchedule] = useState<any>(initial?.schedule);
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [tags, setTags] = useState<string>((initial?.tags || []).join(","));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: Partial<IReportDefinition> = {
      code: code || undefined,
      name,
      kind,
      description: description || undefined,
      defaultFilters,
      view,
      exportFormats,
      schedule,
      isActive,
      tags: tags ? tags.split(",").map(s=>s.trim()).filter(Boolean) : [],
    };

    try {
      if (isEdit) {
        // ✅ id guard: sadece _id varsa update çağır
        const id = initial?._id;
        if (!id) return; // veya toast error
        await dispatch(updateDefinition({ id, changes: payload })).unwrap();
      } else {
        await dispatch(createDefinition(payload)).unwrap();
      }
      if (onSaved) onSaved(); // ✅ optional call güvenli
    } catch {
      /* slice zaten error mesajını yönetiyor */
    }
  };

  return (
    <Form onSubmit={submit} aria-describedby="def-form-desc">
      <SrOnly id="def-form-desc">
        {t("form.a11yDesc", "Create or update a report definition.")}
      </SrOnly>

      <Row>
        <Col>
          <Label htmlFor="def-code">{t("form.code", "Code")}</Label>
          <Input
            id="def-code"
            value={code}
            onChange={(e)=>setCode(e.target.value)}
            placeholder={t("form.codePh", "auto if empty")}
          />
        </Col>

        <Col style={{gridColumn:"span 2"}}>
          <Label htmlFor="def-name">{t("form.name", "Name")}</Label>
          <Input id="def-name" value={name} onChange={(e)=>setName(e.target.value)} required />
        </Col>

        <Col>
          <Label htmlFor="def-kind">{t("form.kind", "Kind")}</Label>
          <Select
            id="def-kind"
            value={kind}
            onChange={(e)=>setKind(e.target.value as ReportKind)}
            aria-label={t("form.kind", "Kind")}
          >
            {KINDS.map(k=>(
              <option key={k} value={k}>{t(`kinds.${k}`, k)}</option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row>
        <Col style={{gridColumn:"span 3"}}>
          <Label htmlFor="def-desc">{t("form.description", "Description")}</Label>
          <Input id="def-desc" value={description} onChange={(e)=>setDescription(e.target.value)} />
        </Col>

        <Col>
          <Label>{t("form.active", "Active?")}</Label>
          <Check>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setIsActive(e.target.checked)}
              aria-label={t("form.active", "Active?")}
            />
            <span>{isActive ? t("common.yes", "Yes") : t("common.no", "No")}</span>
          </Check>
        </Col>
      </Row>

      <Card>
        <JSONEditor
          label={t("form.defaultFilters", "Default Filters (JSON)")}
          value={defaultFilters}
          onChange={setDefaultFilters}
          placeholder={`{ "date": {"preset": "this_month"} }`}
        />
      </Card>

      <Card>
        <JSONEditor
          label={t("form.view", "View (JSON)")}
          value={view}
          onChange={setView}
          placeholder={`{ "type": "table", "columns": [] }`}
        />
      </Card>

      <Row>
        <Col>
          <Label>{t("form.exportFormats", "Export Formats")}</Label>
          <Multi role="group" aria-label={t("form.exportFormats", "Export Formats")}>
            {(["csv","xlsx","pdf","json"] as const).map((f) => (
              <Check key={f}>
                <input
                  type="checkbox"
                  checked={exportFormats.includes(f)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // ✅ if/else ile linter uyarısını kaldır
                    const next = new Set(exportFormats);
                    if (e.target.checked) {
                      next.add(f);
                    } else {
                      next.delete(f);
                    }
                    setExportFormats(Array.from(next) as Array<"csv"|"xlsx"|"pdf"|"json">);
                  }}
                  aria-label={f}
                />
                <span>{f.toUpperCase()}</span>
              </Check>
            ))}
          </Multi>
        </Col>

        <Col style={{gridColumn:"span 3"}}>
          <Label htmlFor="def-tags">{t("form.tags", "Tags (comma)")}</Label>
          <Input
            id="def-tags"
            value={tags}
            onChange={(e)=>setTags(e.target.value)}
            placeholder={t("form.tagsPh", "finance, kpi, ...")}
          />
        </Col>
      </Row>

      <Card>
        <SubTitle>{t("form.schedule", "Schedule")}</SubTitle>
        <ScheduleEditor value={schedule} onChange={setSchedule} />
      </Card>

      <Actions>
        <Secondary type="button" onClick={onClose}>
          {t("form.cancel", "Cancel")}
        </Secondary>
        <Primary type="submit">
          {isEdit ? t("form.update", "Update") : t("form.create", "Create")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* styled (aynı) */
const SrOnly = styled.span`
  position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(1px,1px,1px,1px);
`;

const Form = styled.form`
  display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};
`;

const Row = styled.div`
  display:grid;gap:${({theme})=>theme.spacings.md};
  grid-template-columns:repeat(4,1fr);
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;

const Col = styled.div`display:flex;flex-direction:column;gap:6px;`;

const Label = styled.label`
  font-size:${({theme})=>theme.fontSizes.xsmall};
  color:${({theme})=>theme.colors.textSecondary};
`;

const focusable = css`
  transition: border-color ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast}, background ${({theme})=>theme.transition.fast};
  &:focus {
    outline:none;
    border-color:${({theme})=>theme.colors.inputBorderFocus};
    box-shadow:${({theme})=>theme.colors.shadowHighlight};
  }
`;

const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;

const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;

const Check = styled.label`display:flex;gap:8px;align-items:center;`;

const Multi = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};flex-wrap:wrap;`;

const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;`;

const buttonBase = css`
  ${focusable}
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  &:disabled{opacity:${({theme})=>theme.opacity.disabled};cursor:not-allowed;}
`;

const Primary = styled.button`
  ${buttonBase}
  background:${({theme})=>theme.buttons.primary.background};color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  &:hover{background:${({theme})=>theme.buttons.primary.backgroundHover};}
`;

const Secondary = styled.button`
  ${buttonBase}
  background:${({theme})=>theme.buttons.secondary.background};color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  &:hover{background:${({theme})=>theme.buttons.secondary.backgroundHover};color:${({theme})=>theme.buttons.secondary.textHover};}
`;

const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
`;

const SubTitle = styled.div`
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  margin-bottom:4px;
`;
