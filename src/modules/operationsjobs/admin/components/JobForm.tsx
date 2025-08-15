"use client";
import styled from "styled-components";
import { useState, useMemo, useEffect } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createOpsJob, updateOpsJob } from "@/modules/operationsjobs/slice/opsjobsSlice";
import type {
  IOperationJob, IJobAssignment, IJobStepResult, IMaterialUsage,
  JobSource, JobStatus, StepType,
  TranslatedLabel as OpsTranslatedLabel
} from "@/modules/operationsjobs/types";
import { translations } from "@/modules/operationsjobs";
import {
  type SupportedLocale,
  SUPPORTED_LOCALES,
  getMultiLang,
} from "@/types/common";

/* ---------------- types & helpers ---------------- */
type TL = Partial<OpsTranslatedLabel>;
type Opt = { id: string; label: string; sub?: string };

/** UI dili: i18n.language → 2-char, desteklenmiyorsa proje defaultu 'tr' */
const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two)
    ? (two as SupportedLocale)
    : ("tr" as SupportedLocale);
};

/** seçili dile yaz – fallback yok (form alanı hedef dile değer yazar) */
const getTLStrict = (obj?: TL, l?: SupportedLocale) => (l ? (obj?.[l] ?? "") : "");
/** mevcut objeyi kopyalayıp ilgili dili günceller */
const setTL = (obj: TL | undefined, l: SupportedLocale, val: string): TL => ({ ...(obj || {}), [l]: val });

/* ---------------- props ---------------- */
interface Props {
  initial?: IOperationJob;
  onClose: () => void;
  onSaved?: () => void;

  /** Parent’tan opsiyonlar gelirse onları kullan; yoksa store’dan üret */
  apartmentOpts?: Opt[];
  serviceOpts?: Opt[];
  contractOpts?: Opt[];
  employeeOpts?: Opt[];
  categoryOpts?: Opt[];
  templateOpts?: Opt[];
}

export default function JobForm({
  initial,
  onClose,
  onSaved,
  apartmentOpts,
  serviceOpts,
  contractOpts,
  employeeOpts,
  categoryOpts,
}: Props) {
  const { t, i18n } = useI18nNamespace("opsjobs", translations);
  const lang = useMemo<SupportedLocale>(() => getUILang(i18n?.language), [i18n?.language]);
  const dispatch = useAppDispatch();
  const isEdit = Boolean(initial?._id);

  /* ---------- STORE’TAN YEDEK OPSİYONLAR (parent vermediyse) ---------- */
  const apartmentsStore = useAppSelector((s) => (s as any).apartment?.apartmentAdmin ?? (s as any).apartment?.apartment ?? []) as any[];
  const servicesStore   = useAppSelector((s) => (s as any).servicecatalog?.items ?? (s as any).services?.items ?? []) as any[];
  const contractsStore  = useAppSelector((s) => (s as any).contracts?.contractsAdmin ?? []) as any[];
  const employeesStore  = (useAppSelector((s) => (s as any).employees ?? {}) as any)?.employeesAdmin;
  const categoriesStore = (useAppSelector((s) => (s as any).jobcategories ?? (s as any).categories) as any);

  const fallbackApartmentOpts: Opt[] = useMemo(
    () =>
      (apartmentsStore || []).map((a: any) => ({
        id: String(a._id),
        label: getMultiLang(a?.title, lang) || a?.slug || String(a._id),
        sub: a?.address?.fullText || [a?.address?.city, a?.address?.country].filter(Boolean).join(", "),
      })),
    [apartmentsStore, lang]
  );

  const fallbackServiceOpts: Opt[] = useMemo(
    () =>
      (servicesStore || []).map((s: any) => ({
        id: String(s._id),
        label: (typeof s?.name === "string" ? s?.name : getMultiLang(s?.name, lang)) || s?.code || String(s._id),
        sub: s?.code,
      })),
    [servicesStore, lang]
  );

 const fallbackContractOptsAll: Opt[] = useMemo(
     () =>
       (contractsStore || []).map((c: any) => {
         const key = `statuses.${String(c?.status ?? "")}`;
         // t(...) bazı tanımlarda object dönebiliyor; string’e zorla
         const statusLabel: string | undefined = c?.status
           ? String(t(key, String(c.status)))
           : undefined;
         return {
           id: String(c?._id),
           label: String(c?.code ?? c?._id),
           sub: statusLabel, // her zaman string | undefined
         };
       }),
     [contractsStore, t]
   );



  const fallbackEmployeeOpts: Opt[] = useMemo(
    () =>
      (employeesStore || []).map((e: any) => ({
        id: String(e._id),
        label:
          e?.fullName?.trim?.() ||
          [e?.firstName, e?.lastName].filter(Boolean).join(" ").trim() ||
          e?.email ||
          String(e._id),
        sub: [e?.email, e?.phone].filter(Boolean).join(" • "),
      })),
    [employeesStore]
  );

  const categoriesItems = useMemo(() => {
    const s: any = categoriesStore;
    if (Array.isArray(s)) return s;
    if (Array.isArray(s?.items)) return s.items;
    if (Array.isArray(s?.data)) return s.data;
    if (Array.isArray(s?.list)) return s.list;
    if (Array.isArray(s?.categories)) return s.categories;
    return [];
  }, [categoriesStore]);

  const fallbackCategoryOpts: Opt[] = useMemo(
    () =>
      (categoriesItems || []).map((c: any) => ({
        id: String(c._id),
        label: c?.name || c?.title || String(c._id),
      })),
    [categoriesItems]
  );

  /* ---- hangisini kullanacağımıza karar ver ---- */
  const AOPTS = apartmentOpts && apartmentOpts.length ? apartmentOpts : fallbackApartmentOpts;
  const SOPTS = serviceOpts && serviceOpts.length ? serviceOpts : fallbackServiceOpts;
  const EOPTS = employeeOpts && employeeOpts.length ? employeeOpts : fallbackEmployeeOpts;
  const COPTS_ALL = contractOpts && contractOpts.length ? contractOpts : fallbackContractOptsAll;
  const CATOPTS = categoryOpts && categoryOpts.length ? categoryOpts : fallbackCategoryOpts;


  /* ---------- STATE (initial senkronizasyonu dahil) ---------- */

  // basic
  const [code, setCode] = useState<string>(initial?.code || "");
  const [title, setTitle] = useState<TL>((initial?.title as TL) || {});
  const [description, setDescription] = useState<TL>((initial?.description as TL) || {});
  const [source, setSource] = useState<JobSource>(initial?.source || "manual");
  const [status, setStatus] = useState<JobStatus>(initial?.status || "draft");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "critical">(initial?.priority || "normal");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  // refs (string id)
  const [apartmentRef, setApartmentRef] = useState<string>(
    typeof initial?.apartmentRef === "string" ? initial?.apartmentRef : (initial?.apartmentRef as any)?._id || ""
  );
  const [serviceRef, setServiceRef] = useState<string>(
    typeof initial?.serviceRef === "string" ? (initial?.serviceRef as any) : (initial?.serviceRef as any)?._id || ""
  );
  const [contractRef, setContractRef] = useState<string>(
    typeof initial?.contractRef === "string" ? (initial?.contractRef as any) : (initial?.contractRef as any)?._id || ""
  );
  const [categoryRef, setCategoryRef] = useState<string>(
    typeof initial?.categoryRef === "string" ? initial?.categoryRef : (initial?.categoryRef as any)?._id || ""
  );

  // schedule
  const [plannedStart, setPlannedStart] = useState<string>(
    initial?.schedule?.plannedStart ? new Date(initial.schedule.plannedStart).toISOString().slice(0, 16) : ""
  );
  const [plannedEnd, setPlannedEnd] = useState<string>(
    initial?.schedule?.plannedEnd ? new Date(initial.schedule.plannedEnd).toISOString().slice(0, 16) : ""
  );
  const [dueAt, setDueAt] = useState<string>(
    initial?.schedule?.dueAt ? new Date(initial.schedule.dueAt).toISOString().slice(0, 16) : ""
  );
  const [expectedDurationMinutes, setExpectedDurationMinutes] = useState<number>(
    Number(initial?.expectedDurationMinutes ?? 0)
  );

  // arrays
  const [assignments, setAssignments] = useState<IJobAssignment[]>(initial?.assignments || []);
  const [steps, setSteps] = useState<IJobStepResult[]>(initial?.steps || []);
  const [materials, setMaterials] = useState<IMaterialUsage[]>(initial?.materials || []);

  /** 🔁 initial değişirse formu yeniden doldur */
  useEffect(() => {
    setCode(initial?.code || "");
    setTitle((initial?.title as TL) || {});
    setDescription((initial?.description as TL) || {});
    setSource(initial?.source || "manual");
    setStatus(initial?.status || "draft");
    setPriority(initial?.priority || "normal");
    setIsActive(initial?.isActive ?? true);

    setApartmentRef(typeof initial?.apartmentRef === "string" ? (initial?.apartmentRef as string) : (initial?.apartmentRef as any)?._id || "");
    setServiceRef(typeof initial?.serviceRef === "string" ? (initial?.serviceRef as any) : (initial?.serviceRef as any)?._id || "");
    setContractRef(typeof initial?.contractRef === "string" ? (initial?.contractRef as any) : (initial?.contractRef as any)?._id || "");
    setCategoryRef(typeof initial?.categoryRef === "string" ? (initial?.categoryRef as string) : (initial?.categoryRef as any)?._id || "");

    setPlannedStart(initial?.schedule?.plannedStart ? new Date(initial.schedule.plannedStart).toISOString().slice(0, 16) : "");
    setPlannedEnd(initial?.schedule?.plannedEnd ? new Date(initial.schedule.plannedEnd).toISOString().slice(0, 16) : "");
    setDueAt(initial?.schedule?.dueAt ? new Date(initial.schedule.dueAt).toISOString().slice(0, 16) : "");
    setExpectedDurationMinutes(Number(initial?.expectedDurationMinutes ?? 0));

    setAssignments(initial?.assignments || []);
    setSteps(initial?.steps || []);
    setMaterials(initial?.materials || []);
  }, [initial]);

  /* ---------- türetilmiş opsiyonlar ---------- */

  // Seçilen apartmana göre sözleşme seçenekleri (varsa filtrele; yoksa tümü)
  const COPTS = useMemo(() => {
    if (!apartmentRef) return COPTS_ALL;
    // contracts store yapısı { apartmentId } ya da { apartmentRef } olarak değişebilir => her iki alanı da deneriz
    const set = new Set<string>(
      (contractsStore || [])
        .filter((c: any) => {
          const apId = String(apartmentRef);
          const m1 = String(c.apartmentId || "") === apId;
          const m2 = typeof c.apartmentRef === "string" ? c.apartmentRef === apId : String(c.apartmentRef?._id || "") === apId;
          return m1 || m2;
        })
        .map((c: any) => String(c._id))
    );
    return COPTS_ALL.filter((o) => set.has(o.id));
  }, [COPTS_ALL, contractsStore, apartmentRef]);

  /* ---------- array manipülasyonları ---------- */
  const upsertAssign = (i: number, patch: Partial<IJobAssignment>) =>
    setAssignments((arr) => arr.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  const addAssign = () => setAssignments((arr) => [...arr, { employeeRef: "", role: "member", plannedMinutes: 60 }]);
  const removeAssign = (i: number) => setAssignments((arr) => arr.filter((_, idx) => idx !== i));

  const upsertStep = (i: number, patch: Partial<IJobStepResult>) =>
    setSteps((arr) => arr.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const addStep = () => setSteps((arr) => [...arr, { type: "task", title: {}, estimatedMinutes: 30 }]);
  const removeStep = (i: number) => setSteps((arr) => arr.filter((_, idx) => idx !== i));

  const upsertMat = (i: number, patch: Partial<IMaterialUsage>) =>
    setMaterials((arr) => arr.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const addMat = () =>
    setMaterials((arr) => [...arr, { name: {}, quantity: 1, unit: "pcs", costPerUnit: 0, currency: "TRY" }]);
  const removeMat = (i: number) => setMaterials((arr) => arr.filter((_, idx) => idx !== i));

  /* ---------- submit ---------- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<IOperationJob> = {
      code: code || undefined,
      title: title as OpsTranslatedLabel,
      description: description as OpsTranslatedLabel,
      source,
      status,
      priority,
      isActive,
      apartmentRef: apartmentRef || undefined,
      serviceRef: serviceRef || undefined,
      contractRef: contractRef || undefined,
      categoryRef: categoryRef || undefined,
      schedule: {
        plannedStart: plannedStart ? new Date(plannedStart).toISOString() : undefined,
        plannedEnd: plannedEnd ? new Date(plannedEnd).toISOString() : undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      },
      expectedDurationMinutes: Number(expectedDurationMinutes) || undefined,
      assignments: assignments.filter((a) => a.employeeRef),
      steps,
      materials,
    };

    if (isEdit && initial?._id) {
      await dispatch(updateOpsJob({ id: initial._id, changes: payload }) as any).unwrap().catch(() => {});
    } else {
      await dispatch(createOpsJob(payload) as any).unwrap().catch(() => {});
    }
    onSaved?.();
  };

  /* ---------- UI ---------- */
  return (
    <Form onSubmit={onSubmit}>
      <Row>
        <Col>
          <Label>{t("source", "Source")}</Label>
          <Select value={source} onChange={(e) => setSource(e.target.value as JobSource)}>
            {["manual", "recurrence", "contract", "adhoc"].map((s) => (
              <option key={s} value={s}>{t(`source_${s}`, s)}</option>
            ))}
          </Select>
        </Col>
        <Col>
          <Label>{t("status", "Status")}</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as JobStatus)}>
            {["draft", "scheduled", "in_progress", "paused", "completed", "cancelled"].map((s) => (
              <option key={s} value={s}>{t(`status_${s}`, s)}</option>
            ))}
          </Select>
        </Col>
        <Col>
          <Label>{t("priority", "Priority")}</Label>
          <Select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            {["low", "normal", "high", "critical"].map((p) => (
              <option key={p} value={p}>{t(`priority_${p}`, p)}</option>
            ))}
          </Select>
        </Col>
        <Col>
          <Label>{t("isActive", "Active?")}</Label>
          <CheckRow>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>{isActive ? t("yes", "Yes") : t("no", "No")}</span>
          </CheckRow>
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("code", "Code")}</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("autoIfEmpty", "(auto if empty)")} />
        </Col>

        <Col>
          <Label>{t("apartment", "Apartment")}</Label>
          <Select value={apartmentRef} onChange={(e) => { setApartmentRef(e.target.value); setContractRef(""); }}>
            <option value="">{t("selectOption", "Select...")}</option>
            {AOPTS.map(o => (
              <option key={o.id} value={o.id}>
                {o.label}{o.sub ? ` — ${o.sub}` : ""}
              </option>
            ))}
          </Select>
        </Col>

        <Col>
          <Label>{t("service", "Service")}</Label>
          <Select value={serviceRef} onChange={(e) => setServiceRef(e.target.value)}>
            <option value="">{t("selectOption", "Select...")}</option>
            {SOPTS.map(o => (
              <option key={o.id} value={o.id}>
                {o.label}{o.sub ? ` — ${o.sub}` : ""}
              </option>
            ))}
          </Select>
        </Col>

        <Col>
          <Label>{t("contract", "Contract")}</Label>
          <Select value={contractRef} onChange={(e) => setContractRef(e.target.value)}>
            <option value="">{t("selectOption", "Select...")}</option>
            {(COPTS.length ? COPTS : COPTS_ALL).map(o => (
              <option key={o.id} value={o.id}>
                {o.label}{o.sub ? ` — ${o.sub}` : ""}
              </option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row>
        <Col>
          <Label>{t("category", "Category")}</Label>
          <Select value={categoryRef} onChange={(e) => setCategoryRef(e.target.value)}>
            <option value="">{t("selectOption", "Select...")}</option>
            {CATOPTS.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </Select>
        </Col>

        <Col>
          <Label>{t("titleField", "Title")} ({lang})</Label>
          <Input
            value={getTLStrict(title, lang)}
            onChange={(e) => setTitle(setTL(title, lang, e.target.value))}
          />
        </Col>

        <Col style={{ gridColumn: "span 2" }}>
          <Label>{t("description", "Description")} ({lang})</Label>
          <TextArea
            rows={2}
            value={getTLStrict(description, lang)}
            onChange={(e) => setDescription(setTL(description, lang, e.target.value))}
          />
        </Col>
      </Row>

      <BlockTitle>{t("schedule", "Schedule")}</BlockTitle>
      <Row>
        <Col>
          <Label>{t("plannedStart", "Planned Start")}</Label>
          <Input type="datetime-local" value={plannedStart} onChange={(e) => setPlannedStart(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("plannedEnd", "Planned End")}</Label>
          <Input type="datetime-local" value={plannedEnd} onChange={(e) => setPlannedEnd(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("dueAt", "Due At")}</Label>
          <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </Col>
        <Col>
          <Label>{t("expected", "Expected (min)")}</Label>
          <Input
            type="number"
            min={0}
            value={expectedDurationMinutes}
            onChange={(e) => setExpectedDurationMinutes(Number(e.target.value) || 0)}
          />
        </Col>
      </Row>

      <BlockTitle>{t("assignments", "Assignments")}</BlockTitle>
      {assignments.map((a, idx) => (
        <Row key={idx}>
          <Col>
            <Label>{t("employee", "Employee")}</Label>
            <Select
              value={a.employeeRef}
              onChange={(e) => upsertAssign(idx, { employeeRef: e.target.value })}
            >
              <option value="">{t("selectOption", "Select...")}</option>
              {EOPTS.map(o => (
                <option key={o.id} value={o.id}>
                  {o.label}{o.sub ? ` — ${o.sub}` : ""}
                </option>
              ))}
            </Select>
          </Col>
          <Col>
            <Label>{t("role", "Role")}</Label>
            <Select
              value={a.role || "member"}
              onChange={(e) => upsertAssign(idx, { role: e.target.value as "lead" | "member" })}
            >
              <option value="lead">lead</option>
              <option value="member">member</option>
            </Select>
          </Col>
          <Col>
            <Label>{t("plannedMin", "Planned (min)")}</Label>
            <Input
              type="number"
              min={0}
              value={a.plannedMinutes ?? 60}
              onChange={(e) => upsertAssign(idx, { plannedMinutes: Number(e.target.value) || 0 })}
            />
          </Col>
          <Col style={{ display: "flex", alignItems: "end" }}>
            <Small onClick={(ev) => { ev.preventDefault(); addAssign(); }}>
              + {t("assignments", "Assignments")}
            </Small>
            {assignments.length > 0 && (
              <Small onClick={(ev) => { ev.preventDefault(); removeAssign(idx); }}>
                {t("delete", "Delete")}
              </Small>
            )}
          </Col>
        </Row>
      ))}
      {assignments.length === 0 && (
        <BtnRow>
          <Small onClick={(e) => { e.preventDefault(); addAssign(); }}>
            + {t("assignments", "Assignments")}
          </Small>
        </BtnRow>
      )}

      <BlockTitle>{t("steps", "Steps")}</BlockTitle>
      {steps.map((s, idx) => (
        <Row key={idx}>
          <Col>
            <Label>{t("type", "Type")}</Label>
            <Select value={s.type || "task"} onChange={(e) => upsertStep(idx, { type: e.target.value as StepType })}>
              {["task", "inspection", "safety", "handover"].map((x) => <option key={x} value={x}>{x}</option>)}
            </Select>
          </Col>
          <Col>
            <Label>{t("titleField", "Title")} ({lang})</Label>
            <Input
              value={getTLStrict(s.title as TL, lang)}
              onChange={(e) => upsertStep(idx, { title: setTL(s.title as TL, lang, e.target.value) })}
            />
          </Col>
          <Col>
            <Label>{t("expected", "Expected (min)")}</Label>
            <Input
              type="number"
              min={0}
              value={s.estimatedMinutes ?? 30}
              onChange={(e) => upsertStep(idx, { estimatedMinutes: Number(e.target.value) || 0 })}
            />
          </Col>
          <Col style={{ display: "flex", alignItems: "end" }}>
            <Small onClick={(ev) => { ev.preventDefault(); addStep(); }}>
              + {t("steps", "Steps")}
            </Small>
            {steps.length > 0 && (
              <Small onClick={(ev) => { ev.preventDefault(); removeStep(idx); }}>
                {t("delete", "Delete")}
              </Small>
            )}
          </Col>
        </Row>
      ))}
      {steps.length === 0 && (
        <BtnRow>
          <Small onClick={(e) => { e.preventDefault(); addStep(); }}>
            + {t("steps", "Steps")}
          </Small>
        </BtnRow>
      )}

      <BlockTitle>{t("materials", "Materials")}</BlockTitle>
      {materials.map((m, idx) => (
        <Row key={idx}>
          <Col>
            <Label>{t("titleField", "Title")} ({lang})</Label>
            <Input
              value={getTLStrict(m.name as TL, lang)}
              onChange={(e) => upsertMat(idx, { name: setTL(m.name as TL, lang, e.target.value) })}
            />
          </Col>
          <Col>
            <Label>{t("qty", "Qty")}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={m.quantity ?? 1}
              onChange={(e) => upsertMat(idx, { quantity: Number(e.target.value) || 0 })}
            />
          </Col>
          <Col>
            <Label>{t("unit", "Unit")}</Label>
            <Input value={m.unit || ""} onChange={(e) => upsertMat(idx, { unit: e.target.value || undefined })} />
          </Col>
          <Col>
            <Label>{t("costPerUnit", "Cost/Unit")}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={m.costPerUnit ?? 0}
              onChange={(e) => upsertMat(idx, { costPerUnit: Number(e.target.value) || 0 })}
            />
          </Col>
          <Col>
            <Label>{t("currency", "Currency")}</Label>
            <Input
              value={m.currency || "TRY"}
              onChange={(e) => upsertMat(idx, { currency: e.target.value || "TRY" })}
            />
          </Col>
          <Col style={{ display: "flex", alignItems: "end" }}>
            <Small onClick={(ev) => { ev.preventDefault(); addMat(); }}>
              + {t("materials", "Materials")}
            </Small>
            {materials.length > 0 && (
              <Small onClick={(ev) => { ev.preventDefault(); removeMat(idx); }}>
                {t("delete", "Delete")}
              </Small>
            )}
          </Col>
        </Row>
      ))}
      {materials.length === 0 && (
        <BtnRow>
          <Small onClick={(e) => { e.preventDefault(); addMat(); }}>
            + {t("materials", "Materials")}
          </Small>
        </BtnRow>
      )}

      <Actions>
        <Secondary type="button" onClick={onClose}>{t("cancel", "Cancel")}</Secondary>
        <Primary type="submit">{isEdit ? t("update", "Update") : t("create", "Create")}</Primary>
      </Actions>
    </Form>
  );
}

/* ---- styled (responsive) ---- */
const Form = styled.form`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.md};`;
const Row = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:${({theme})=>theme.spacings.md};
  ${({theme})=>theme.media.tablet}{grid-template-columns:repeat(2,1fr);}
  ${({theme})=>theme.media.mobile}{grid-template-columns:1fr;}
`;
const Col = styled.div`display:flex;flex-direction:column;gap:${({theme})=>theme.spacings.xs};min-width:0;`;
const BlockTitle = styled.h3`font-size:${({theme})=>theme.fontSizes.md};margin:${({theme})=>theme.spacings.sm} 0;`;
const Label = styled.label`font-size:${({theme})=>theme.fontSizes.xsmall};color:${({theme})=>theme.colors.textSecondary};`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  min-width:0;
`;
const TextArea = styled.textarea`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const Select = styled.select`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.inputBorder};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;
const CheckRow = styled.label`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:center;`;
const Small = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
  margin-right:${({theme})=>theme.spacings.xs};
`;
const BtnRow = styled.div`display:flex;gap:${({theme})=>theme.spacings.xs};align-items:flex-end;`;
const Actions = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};justify-content:flex-end;`;
const Primary = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
const Secondary = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:8px 14px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
