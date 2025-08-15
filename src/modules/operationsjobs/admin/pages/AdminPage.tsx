"use client";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { clearOpsJobsMessages } from "@/modules/operationsjobs/slice/opsjobsSlice";
import type { IOperationJob } from "@/modules/operationsjobs/types";
import { JobList, JobForm } from "@/modules/operationsjobs";
import { translations } from "@/modules/operationsjobs";
import {
  type SupportedLocale,
  SUPPORTED_LOCALES,
  getMultiLang,
} from "@/types/common";

/* ---------------- helpers ---------------- */
type Opt = { id: string; label: string; sub?: string };

const pickArray = (slice: any, candidates: string[]) => {
  // doğrudan dizi
  for (const k of candidates) {
    const v = slice?.[k];
    if (Array.isArray(v)) return v;
  }
  // nested şekiller (items/list/data)
  for (const k of candidates) {
    const v = slice?.[k];
    if (Array.isArray(v?.items)) return v.items;
    if (Array.isArray(v?.list)) return v.list;
    if (Array.isArray(v?.data)) return v.data;
  }
  return [];
};

const getUILang = (i18nLang?: string): SupportedLocale | undefined => {
  const two = (i18nLang || "").slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(two) ? (two as SupportedLocale) : undefined;
};

/* ---------------- page ---------------- */
export default function AdminOpsJobsPage() {
  const { t, i18n } = useI18nNamespace("opsjobs", translations);
  const lang = getUILang(i18n?.language);

  const dispatch = useAppDispatch();
  const { items, loading, error, successMessage, meta } = useAppSelector((s) => s.opsjobs);

  /* 🔹 İlişkili modül state’leri (parent fetch ediyor) */
  const apartments =
    useAppSelector((s) => (s as any).apartment?.apartmentAdmin ?? (s as any).apartment?.apartment ?? []) as any[];

  const services =
    useAppSelector((s) => (s as any).servicecatalog?.items ?? (s as any).services?.items ?? []) as any[];

  const contracts =
    useAppSelector((s) => (s as any).contracts?.contractsAdmin ?? []) as any[];

  const { employeesAdmin = [] } = useAppSelector((s) => (s as any).employees ?? {});

  const opsTemplatesSlice = useAppSelector((s) => (s as any).opstemplates);
  const categoriesSlice = useAppSelector((s) => (s as any).jobcategories ?? (s as any).categories);

  /* 🔹 Opsiyonlar (sadece store'daki veriden) */
  const apartmentOpts: Opt[] = useMemo(
    () =>
      (apartments || []).map((a: any) => ({
        id: String(a._id),
        label: getMultiLang(a?.title, lang) || a?.slug || String(a._id),
        sub:
          a?.address?.fullText ||
          [a?.address?.city, a?.address?.country].filter(Boolean).join(", "),
      })),
    [apartments, lang]
  );

  const serviceOpts: Opt[] = useMemo(
    () =>
      (services || []).map((s: any) => ({
        id: String(s._id),
        label: (typeof s?.name === "string" ? s?.name : getMultiLang(s?.name, lang)) || s?.code || String(s._id),
        sub: s?.code,
      })),
    [services, lang]
  );

const tStr = (key: string, fallback?: string): string => {
   const v = t(key, fallback ?? key);
   return typeof v === "string" ? v : (fallback ?? key);
 };

 const contractOpts: Opt[] = useMemo(
   () =>
      (contracts || []).map((c: any) => {
        const statusKey = `statuses.${String(c?.status ?? "")}`;
        const statusLabel = c?.status ? tStr(statusKey, String(c.status)) : undefined;
        return {
          id: String(c?._id),
          label: String(c?.code ?? c?._id), // her durumda string
          sub: statusLabel,                 // string | undefined
        };
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
    [contracts, t]
  );

  const employeeOpts: Opt[] = useMemo(
    () =>
      (employeesAdmin || []).map((e: any) => ({
        id: String(e._id),
        label:
          e?.fullName?.trim?.() ||
          [e?.firstName, e?.lastName].filter(Boolean).join(" ").trim() ||
          e?.email ||
          String(e._id),
        sub: [e?.email, e?.phone].filter(Boolean).join(" • "),
      })),
    [employeesAdmin]
  );

  const templateItems = useMemo(
    () => pickArray(opsTemplatesSlice, ["items", "templates", "list", "data"]),
    [opsTemplatesSlice]
  );
  const templateOpts: Opt[] = useMemo(
    () =>
      (templateItems || []).map((o: any) => ({
        id: String(o._id),
        label: o?.name || o?.title || String(o._id),
      })),
    [templateItems]
  );

  const categoryItems = useMemo(
    () => pickArray(categoriesSlice, ["items", "list", "data", "categories"]),
    [categoriesSlice]
  );
  const categoryOpts: Opt[] = useMemo(
    () =>
      (categoryItems || []).map((c: any) => ({
        id: String(c._id),
        label: c?.name || c?.title || String(c._id),
      })),
    [categoryItems]
  );

  /* 🔹 Label map’leri (ID→isim) */
  const apLabelById = useMemo(() => new Map(apartmentOpts.map((o) => [o.id, o.label])), [apartmentOpts]);
  const svcLabelById = useMemo(() => new Map(serviceOpts.map((o) => [o.id, o.label])), [serviceOpts]);
  const conLabelById = useMemo(() => new Map(contractOpts.map((o) => [o.id, o.label])), [contractOpts]);
  const empLabelById = useMemo(() => new Map(employeeOpts.map((o) => [o.id, o.label])), [employeeOpts]);
  const catLabelById = useMemo(() => new Map(categoryOpts.map((o) => [o.id, o.label])), [categoryOpts]);

  /* 🔹 JobList için label resolver’lar (çok dilli fallback common.ts üstünden) */
  const getApartmentLabel = (ref: any) =>
    typeof ref === "object" && ref
      ? getMultiLang(ref?.title as any, lang) || ref?.slug || apLabelById.get(String(ref?._id)) || "-"
      : apLabelById.get(String(ref)) || "-";

  const getServiceLabel = (ref: any) =>
    typeof ref === "object" && ref
      ? (typeof ref?.name === "string" ? ref?.name : getMultiLang(ref?.name as any, lang)) || ref?.code || svcLabelById.get(String(ref?._id)) || "-"
      : svcLabelById.get(String(ref)) || "-";

  const getContractLabel = (ref: any) =>
    typeof ref === "object" && ref ? ref?.code || conLabelById.get(String(ref?._id)) || "-" : conLabelById.get(String(ref)) || "-";

  const getEmployeeLabel = (ref: any) =>
    typeof ref === "object" && ref ? ref?.name || empLabelById.get(String(ref?._id)) || "-" : empLabelById.get(String(ref)) || "-";

  const getCategoryLabel = (ref: any) =>
    typeof ref === "object" && ref ? ref?.name || catLabelById.get(String(ref?._id)) || "-" : catLabelById.get(String(ref)) || "-";

  /* ---- toasts ---- */
  useEffect(() => {
    if (successMessage) toast.success(t(successMessage, successMessage));
    if (error) toast.error(error);
    if (successMessage || error) dispatch(clearOpsJobsMessages());
  }, [successMessage, error, dispatch, t]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<IOperationJob | null>(null);

  const count = useMemo(() => items?.length ?? 0, [items]);

  return (
    <PageWrap>
      <Header>
        <h1>{t("title", "Operations Jobs")}</h1>
        <Right>
          <Counter aria-label="jobs-count">{count}</Counter>
          <PrimaryBtn onClick={() => { setEditing(null); setShowForm(true); }}>
            + {t("new", "New Job")}
          </PrimaryBtn>
        </Right>
      </Header>

      {showForm && (
        <Card>
          <JobForm
            initial={editing || undefined}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); }}
            /* 🔹 FE state’ten gelen opsiyonlar */
            apartmentOpts={apartmentOpts}
            serviceOpts={serviceOpts}
            contractOpts={contractOpts}
            employeeOpts={employeeOpts}
            templateOpts={templateOpts}
            categoryOpts={categoryOpts}
          />
        </Card>
      )}

      <Section>
        <SectionHead>
          <h2>{t("list", "Jobs")}</h2>
          {/* Parent fetch ediyor → burada fetch tetiklemiyoruz */}
          <SmallBtn disabled={loading}>
            {t("refresh", "Refresh")}
          </SmallBtn>
        </SectionHead>
        <Card>
          <JobList
            items={items || []}
            loading={loading}
            meta={meta || undefined}
            onEdit={(j) => { setEditing(j); setShowForm(true); }}
            /* 🔹 ID→etiket dönüştürücüler */
            getApartmentLabel={getApartmentLabel}
            getServiceLabel={getServiceLabel}
            getContractLabel={getContractLabel}
            getEmployeeLabel={getEmployeeLabel}
            getCategoryLabel={getCategoryLabel}
          />
        </Card>
      </Section>
    </PageWrap>
  );
}

/* ---- styled ---- */
const PageWrap = styled.div`
  max-width:${({theme})=>theme.layout.containerWidth};
  margin:0 auto;
  padding:${({theme})=>theme.spacings.xl};
`;
const Header = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.lg};
  ${({theme})=>theme.media.mobile}{flex-direction:column;align-items:flex-start;gap:${({theme})=>theme.spacings.sm};}
`;
const Right = styled.div`display:flex;gap:${({theme})=>theme.spacings.sm};align-items:center;`;
const Counter = styled.span`
  padding:6px 10px;border-radius:${({theme})=>theme.radii.pill};
  background:${({theme})=>theme.colors.backgroundAlt};
  font-weight:${({theme})=>theme.fontWeights.medium};
`;
const Section = styled.section`margin-top:${({theme})=>theme.spacings.xl};`;
const SectionHead = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:${({theme})=>theme.spacings.sm};
`;
const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.lg};
`;
const PrimaryBtn = styled.button`
  background:${({theme})=>theme.buttons.primary.background};
  color:${({theme})=>theme.buttons.primary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.buttons.primary.backgroundHover};
  padding:8px 12px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
const SmallBtn = styled.button`
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};cursor:pointer;
`;
