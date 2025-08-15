// src/modules/scheduling/ui/components/PlanForm.tsx
"use client";
import styled, { css } from "styled-components";
import { useMemo, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createPlan, updatePlan } from "@/modules/scheduling/slice/schedulingSlice";
import type {
  ISchedulePlan, PlanStatus, RecurrencePattern,
  IScheduleAnchor, ITimeWindow, IGenerationPolicy, IBlackoutRange,
  TranslatedLabel,
} from "@/modules/scheduling/types";
import { AnchorEditor, PatternEditor, WindowPolicyEditor, BlackoutsEditor } from "@/modules/scheduling"; // ← JSONEditor kaldırıldı
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/scheduling";

type Option = { value: string; label: string; [k: string]: any };
const STATUSES: PlanStatus[] = ["active", "paused", "archived"];

export default function PlanForm({
  initial, onClose, onSaved
}: { initial?: ISchedulePlan; onClose: ()=>void; onSaved?: ()=>void; }) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useI18nNamespace("scheduling", translations);
  const isEdit = !!initial?._id;

  // t çıktısını her zaman string yapan, stable helper
  const T = useCallback((key: string, fallback: string) => {
    const v = t(key, fallback as any);
    if (v && typeof v === "object") {
      const lang = i18n.language?.split("-")[0] || "en";
      const tl = v as TranslatedLabel;
      return tl[lang] ?? tl.en ?? tl.tr ?? fallback;
    }
    return String(v ?? fallback);
  }, [t, i18n.language]);

  // aktif kısa dil kodu (tr, en, de…)
  const lang = useMemo(() => (i18n.language?.split("-")[0] || "en"), [i18n.language]);

  // ---------- Local form state ----------
  const [code, setCode] = useState(initial?.code || "");
  const [title, setTitle] = useState<TranslatedLabel | undefined>(initial?.title);
  const [description, setDescription] = useState<TranslatedLabel | undefined>(initial?.description);
  const [anchor, setAnchor] = useState<IScheduleAnchor>(initial?.anchor || ({ apartmentRef: "" } as IScheduleAnchor));
  const [timezone, setTimezone] = useState(initial?.timezone || "Europe/Istanbul");
  const [pattern, setPattern] = useState<RecurrencePattern>(initial?.pattern || { type:"weekly", every:1, daysOfWeek:[1] });
  const [windowValue, setWindowValue] = useState<ITimeWindow>(initial?.window || {});
  const [policyValue, setPolicyValue] = useState<IGenerationPolicy>(initial?.policy || { leadTimeDays:3, lockAheadPeriods:1 });
  const [startDate, setStartDate] = useState<string>(() => toDate(initial?.startDate) || new Date().toISOString().slice(0,10));
  const [endDate, setEndDate] = useState<string>(() => toDate(initial?.endDate) || "");
  const [skipDates, setSkipDates] = useState<string[]>(
    (initial?.skipDates as any)?.map((d:any)=>toDate(d))?.filter(Boolean) || []
  );
  const [blackouts, setBlackouts] = useState<IBlackoutRange[]>( initial?.blackouts || [] );
  const [status, setStatus] = useState<PlanStatus>(initial?.status || "active");
  const [tags, setTags] = useState((initial?.tags || []).join(","));

  // ---------- Store slices ----------
  const apartmentSlice     = useAppSelector((s) => (s as any).apartment);
  const employeesSlice     = useAppSelector((s) => (s as any).employees);
  const serviceCatalogList = useAppSelector((s) => (s as any).servicecatalog);
  const opsTemplatesSlice  = useAppSelector((s) => (s as any).opstemplates);
  const contractsSlice     = useAppSelector((s) => (s as any).contracts);
  const neighborhoodSlice  = useAppSelector((s) => (s as any).neighborhood); // category = neighborhood (mahalle)

  // ---------- Helpers ----------
  const tl = useCallback((lbl?: TranslatedLabel) =>
    (lbl && (lbl[i18n.language] || lbl.en || lbl.tr)) || ""
  , [i18n.language]);

  // Aktif dilde görüntülenecek metinler
  const titleText = useMemo(() => (title?.[lang] ?? title?.en ?? title?.tr ?? ""), [title, lang]);
  const descText  = useMemo(() => (description?.[lang] ?? description?.en ?? description?.tr ?? ""), [description, lang]);

  // Aktif dilin değerini düzenleyen setter’lar (boşsa key’i siler)
  const setTitleForLang = useCallback((val: string) => {
    setTitle(prev => {
      const next: Record<string,string> = { ...(prev as any) };
      if (val?.trim()) next[lang] = val;
      else delete next[lang];
      return Object.keys(next).length ? (next as TranslatedLabel) : undefined;
    });
  }, [lang]);

  const setDescForLang = useCallback((val: string) => {
    setDescription(prev => {
      const next: Record<string,string> = { ...(prev as any) };
      if (val?.trim()) next[lang] = val;
      else delete next[lang];
      return Object.keys(next).length ? (next as TranslatedLabel) : undefined;
    });
  }, [lang]);

  // Apartments → options
  const apartmentOptions: Option[] = useMemo(() => {
    const list = apartmentSlice?.apartmentAdmin ?? [];
    return list.map((apt: any) => ({
      value: String(apt._id),
      label: tl(apt.title) || apt.slug || String(apt._id).slice(-6),
    }));
  }, [apartmentSlice?.apartmentAdmin, tl]);

  // Neighborhoods (category) → options
  const categoryOptions: Option[] = useMemo(() => {
    const list = neighborhoodSlice?.items ?? [];
    return list.map((n: any) => ({
      value: String(n._id),
      label: tl(n.title) || n.name || n.slug || String(n._id).slice(-6),
    }));
  }, [neighborhoodSlice?.items, tl]);

  // Services → options
  const serviceOptions: Option[] = useMemo(() => {
    const items = serviceCatalogList?.items ?? [];
    return items.map((svc: any) => {
      const name = tl(svc.name);
      return {
        value: String(svc._id),
        label: name ? `${name} (${svc.code})` : String(svc.code ?? svc._id),
        code: svc.code,
      };
    });
  }, [serviceCatalogList?.items, tl]);

  // Operation templates → filter by apartment + (optional) service
  const templateOptions: Option[] = useMemo(() => {
    const items = opsTemplatesSlice?.items ?? [];
    if (!anchor?.apartmentRef) return [];
    const get = (o:any, keys:string[]) => keys.reduce<any>((acc,k)=>acc ?? o?.[k], undefined);
    return items
      .filter((tpl: any) => {
        const aptId = get(tpl, ["apartmentRef","apartmentId","apartment"]);
        const srvId = get(tpl, ["serviceRef","serviceId","service"]);
        const okApt = String(aptId || "") === String(anchor.apartmentRef || "");
        const okSrv = anchor.serviceRef ? String(srvId || "") === String(anchor.serviceRef) : true;
        return okApt && okSrv;
      })
      .map((tpl:any) => ({
        value: String(tpl._id),
        label: tl(tpl.name) || tpl.code || String(tpl._id).slice(-6),
        apartmentRef: get(tpl, ["apartmentRef","apartmentId","apartment"]),
        serviceRef: get(tpl, ["serviceRef","serviceId","service"]),
      }));
  }, [opsTemplatesSlice?.items, anchor?.apartmentRef, anchor?.serviceRef, tl]);

  // Contracts → flexible apartment matching
  const contractOptions: Option[] = useMemo(() => {
    const all = (contractsSlice?.contractsAdmin ?? contractsSlice?.items ?? []) as any[];
    if (!all.length || !anchor?.apartmentRef) return [];

    const getAptId = (c: any): string | undefined => {
      const v =
        c?.apartmentRef ??
        c?.apartmentId ??
        (typeof c?.apartment === "string" ? c.apartment : undefined) ??
        (typeof c?.apartment === "object" ? (c.apartment?._id ?? c.apartment?.id) : undefined);
      return v ? String(v) : undefined;
    };

    return all
      .filter((c:any) => String(getAptId(c) || "") === String(anchor.apartmentRef))
      .map((c:any) => ({
        value: String(c._id),
        label: c.code || `${T("contract", "Contract")} · ${String(c._id).slice(-6)}`,
        status: c.status,
      }));
  }, [contractsSlice?.contractsAdmin, contractsSlice?.items, anchor?.apartmentRef, T]);

  // Employees (preferred list) → only active
  const employeeOptions: Option[] = useMemo(() => {
    const items = employeesSlice?.employeesAdmin ?? employeesSlice?.items ?? [];
    return items
      .filter((e:any)=> e.isActive !== false)
      .map((e:any) => ({ value: String(e._id), label: e.fullName || e.email || String(e._id).slice(-6) }));
  }, [employeesSlice?.employeesAdmin, employeesSlice?.items]);

  // ---------- Submit ----------
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // boş kalan dilleri sil
    const cleanObj = (o?: TranslatedLabel) => {
      if (!o) return undefined;
      const entries = Object.entries(o).filter(([,v]) => !!String(v || "").trim());
      return entries.length ? Object.fromEntries(entries) as TranslatedLabel : undefined;
    };

    const payload: Partial<ISchedulePlan> = {
      code: code || undefined,
      title: cleanObj(title),
      description: cleanObj(description),
      anchor,
      timezone,
      pattern,
      window: windowValue,
      policy: policyValue,
      startDate,
      endDate: endDate || undefined,
      skipDates: skipDates.filter(Boolean),
      blackouts,
      status,
      tags: tags ? tags.split(",").map(s=>s.trim()).filter(Boolean) : [],
    };

    try {
      if (isEdit && initial?._id) {
        await dispatch(updatePlan({ id: initial._id, changes: payload })).unwrap();
      } else {
        await dispatch(createPlan(payload)).unwrap();
      }
      onSaved?.();
    } catch {
      /* slice hataları toast’lıyor */
    }
  };

  const submitDisabled = !anchor?.apartmentRef;

  return (
    <Form onSubmit={submit} aria-describedby="plan-form-desc">
      <SrOnly id="plan-form-desc">{T("form.a11y", "Create or update a schedule plan.")}</SrOnly>

      <Row>
        <Col>
          <Label htmlFor="pl-code">{T("form.fields.code", "Code")}</Label>
          <Input
            id="pl-code"
            value={code}
            onChange={(e)=>setCode(e.target.value)}
            placeholder={T("form.codePh", "auto if empty")}
          />
        </Col>

        <Col>
          <Label htmlFor="pl-tz">{T("form.fields.timezone", "Time Zone")}</Label>
          <Input
            id="pl-tz"
            value={timezone}
            onChange={(e)=>setTimezone(e.target.value)}
            placeholder="Europe/Istanbul"
          />
        </Col>

        <Col>
          <Label htmlFor="pl-status">{T("form.fields.status", "Status")}</Label>
          <Select
            id="pl-status"
            value={status}
            onChange={(e)=>setStatus(e.target.value as PlanStatus)}
            aria-label={T("form.fields.status", "Status")}
          >
            {STATUSES.map(s=>(
              <option key={s} value={s}>{T(`status.${s}`, s)}</option>
            ))}
          </Select>
        </Col>

        <Col>
          <Label htmlFor="pl-tags">{T("form.fields.tags", "Tags (comma)")}</Label>
          <Input
            id="pl-tags"
            value={tags}
            onChange={(e)=>setTags(e.target.value)}
            placeholder={T("form.tagsPh", "cleaning, weekly, ...")}
          />
        </Col>
      </Row>

      {/* Title & Description — aktif dilde */}
      <Card>
        <Sub>{T("form.fields.title", "Title")} ({lang.toUpperCase()})</Sub>
        <Input
          id="pl-title"
          value={titleText}
          onChange={(e)=>setTitleForLang(e.target.value)}
          placeholder={T("form.titlePh", "e.g. Weekly cleaning")}
          aria-label={T("form.fields.title", "Title")}
        />
      </Card>

      <Card>
        <Sub>{T("form.fields.description", "Description")} ({lang.toUpperCase()})</Sub>
        <Textarea
          id="pl-description"
          value={descText}
          onChange={(e)=>setDescForLang(e.target.value)}
          placeholder={T("form.descPh", "Short description")}
          rows={4}
          aria-label={T("form.fields.description", "Description")}
        />
      </Card>

      {/* AnchorEditor’a opsiyonlar: apartment, neighborhood(category), service, template, contract */}
      <Card>
        <Sub>{T("form.sections.anchor", "Context (Anchor)")}</Sub>
        <AnchorEditor
          value={anchor}
          onChange={setAnchor}
          {...({
            apartmentOptions,
            categoryOptions,
            serviceOptions,
            templateOptions,
            contractOptions,
          } as any)}
        />
      </Card>

      <Card>
        <Sub>{T("form.sections.pattern", "Recurrence Rule")}</Sub>
        <PatternEditor value={pattern} onChange={setPattern} />
      </Card>

      <Card>
        <Sub>{T("form.sections.window", "Time Window")} & {T("form.sections.policy", "Generation Policy")}</Sub>
        <WindowPolicyEditor
          windowValue={windowValue}
          policyValue={policyValue}
          onWindowChange={setWindowValue}
          onPolicyChange={setPolicyValue}
          {...({ employeeOptions } as any)}
        />
      </Card>

      <Row>
        <Col>
          <Label htmlFor="pl-start">{T("form.fields.startDate", "Start Date")}</Label>
          <Input
            id="pl-start"
            type="date"
            value={startDate}
            onChange={(e)=>setStartDate(e.target.value)}
            required
          />
        </Col>
        <Col>
          <Label htmlFor="pl-end">{T("form.fields.endDate", "End Date")}</Label>
          <Input
            id="pl-end"
            type="date"
            value={endDate}
            onChange={(e)=>setEndDate(e.target.value)}
          />
        </Col>
      </Row>

      <Card>
        <Sub>{T("form.sections.exceptions", "Exceptions (Skip/Blackout)")}</Sub>
        <BlackoutsEditor
          skipDates={skipDates}
          blackouts={blackouts}
          onChange={({ skipDates, blackouts })=>{
            setSkipDates(skipDates);
            setBlackouts(blackouts);
          }}
        />
      </Card>

      <Actions>
        <Secondary type="button" onClick={onClose}>
          {T("form.actions.cancel", "Cancel")}
        </Secondary>
        <Primary type="submit" disabled={submitDisabled}>
          {isEdit ? T("form.actions.update", "Update") : T("form.actions.save", "Save")}
        </Primary>
      </Actions>
    </Form>
  );
}

/* helpers */
function toDate(v:any){ if(!v) return ""; const s=String(v); return s.length>10?s.slice(0,10):s; }

/* styled */
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
  transition: border-color ${({theme})=>theme.transition.fast}, box-shadow ${({theme})=>theme.transition.fast};
  &:focus { outline:none; border-color:${({theme})=>theme.colors.inputBorderFocus};
    box-shadow:${({theme})=>theme.colors.shadowHighlight}; }
`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;
const Textarea = styled.textarea`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  resize:vertical; min-height:96px;
  ${focusable}
`;
const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  ${focusable}
`;
const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
`;
const Sub = styled.div`
  font-weight:${({theme})=>theme.fontWeights.semiBold};
  margin-bottom:6px;
`;
const Actions = styled.div`
  display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;
`;
const buttonBase = css`
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  ${focusable}
  &:disabled{opacity:${({theme})=>theme.opacity.disabled};cursor:not-allowed;}
`;
const Primary = styled.button`
  ${buttonBase}
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  &:hover{background:${({theme})=>theme.buttons.primary.backgroundHover};}
`;
const Secondary = styled.button`
  ${buttonBase}
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  &:hover{background:${({theme})=>theme.buttons.secondary.backgroundHover};
    color:${({theme})=>theme.buttons.secondary.textHover};}
`;
