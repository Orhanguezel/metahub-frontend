// src/modules/scheduling/ui/components/PlanDetail.tsx
"use client";

import styled from "styled-components";
import { useMemo, useState } from "react";
import type { ISchedulePlan, RecurrencePattern } from "@/modules/scheduling/types";
import type { SupportedLocale } from "@/types/common";
import { useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/scheduling";

/* ---------------- helpers ---------------- */

function firstLocaleValue(obj?: unknown, preferred?: SupportedLocale) {
  if (!obj) return "";
  if (typeof obj === "string") return obj.trim();
  const dict = obj as Record<string, unknown>;
  if (preferred && typeof dict[preferred] === "string" && (dict[preferred] as string).trim()) {
    return (dict[preferred] as string).trim();
  }
  for (const v of Object.values(dict)) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/** State shape değişkenlikleri için: verilen anahtar adaylarından ilk dizi olanı döndürür. */
function pickArray(src: any, candidates: string[]): any[] {
  if (!src || typeof src !== "object") return [];
  for (const key of candidates) {
    const v = (src as any)?.[key];
    if (Array.isArray(v)) return v;
  }
  // sığ iç içe nesnelerde de ara (örn: { list: { data:[...] } })
  for (const key of candidates) {
    const v = (src as any)?.[key];
    if (v && typeof v === "object") {
      const inner = pickArray(v, candidates);
      if (Array.isArray(inner)) return inner;
    }
  }
  return [];
}

/* ---------------- wrapper ---------------- */

export default function PlanDetail({
  plan,
  onClose,
}: {
  plan?: ISchedulePlan | null;
  onClose: () => void;
}) {
  if (!plan) return null;
  return <PlanDetailInner plan={plan} onClose={onClose} />;
}

/* ---------------- main ---------------- */

function PlanDetailInner({
  plan,
  onClose,
}: {
  plan: ISchedulePlan;
  onClose: () => void;
}) {
  const { t, i18n } = useI18nNamespace("scheduling", translations);
  const lang = (i18n.language || "en").slice(0, 2) as SupportedLocale;

  /* ---- slices (senin önerdiğin kaynaklar) ---- */
  const neighborhoods     = useAppSelector((s) => (s as any).neighborhood?.items ?? []) as any[];
  const customers         = useAppSelector((s) => (s as any).customer?.customerAdmin ?? []) as any[];
  const { employeesAdmin = [] } = useAppSelector((s) => (s as any).employees ?? {}) as {
    employeesAdmin?: any[];
  };
  const serviceItems      = useAppSelector(
    (s) => (s as any).servicecatalog?.items ?? (s as any).services?.items ?? []
  ) as any[];

  const opsTemplatesSlice = useAppSelector((s) => (s as any).opstemplates);
  const priceListsSlice   = useAppSelector((s) => (s as any).pricelists);

  const operationTemplateItems  = useMemo(
    () => pickArray(opsTemplatesSlice, ["items", "templates", "list", "data"]),
    [opsTemplatesSlice]
  );
  const priceListItems          = useMemo(
    () => pickArray(priceListsSlice,   ["items", "list", "data", "entries"]),
    [priceListsSlice]
  );

  /* ---- formatters ---- */
  const fmtDate = (d?: string | Date) => (d ? String(d).slice(0, 10) : "–");
  const fmtDateTime = (d?: string | Date) =>
    d
      ? new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(d))
      : "–";

  const patternSummary = (p?: RecurrencePattern) => {
    if (!p) return "-";
    switch (p.type) {
      case "weekly": {
        const days = (p.daysOfWeek || []).join(",");
        return t("pattern.summary.weekly", "weekly/{{every}} [{{days}}]", {
          every: p.every,
          days,
        });
      }
      case "dayOfMonth":
        return t("pattern.summary.dayOfMonth", "dayOfMonth/{{every}} day={{day}}", {
          every: p.every,
          day: p.day,
        });
      case "nthWeekday":
        return t("pattern.summary.nthWeekday", "nthWeekday/{{every}} {{nth}}.{{weekday}}", {
          every: p.every,
          nth: p.nth,
          weekday: p.weekday,
        });
      case "yearly":
        return t("pattern.summary.yearly", "yearly {{month}}/{{day}}", {
          month: p.month,
          day: p.day,
        });
      default:
        return "-";
    }
  };

  /* ---- ID → Label çözümleri ---- */
  const apartmentLabel = useMemo(() => {
    // plan.anchor.apartmentRef → neighborhoods
    const map = new Map(neighborhoods.map((n) => [String(n._id), n]));
    const apt = map.get(String(plan.anchor?.apartmentRef || ""));
    return apt
      ? firstLocaleValue(apt.title || apt.name, lang) ||
          apt.slug ||
          String(apt._id).slice(-6)
      : "-";
  }, [neighborhoods, plan.anchor?.apartmentRef, lang]);

  const serviceLabel = useMemo(() => {
    const map = new Map(serviceItems.map((s) => [String(s._id), s]));
    const svc = map.get(String(plan.anchor?.serviceRef || ""));
    if (!svc) return "-";
    const name = firstLocaleValue(svc.name || svc.title, lang);
    const code = svc.code || svc.slug || String(svc._id).slice(-6);
    return name ? `${name} (${code})` : code;
  }, [serviceItems, plan.anchor?.serviceRef, lang]);

  const templateLabel = useMemo(() => {
    const map = new Map(operationTemplateItems.map((t) => [String(t._id), t]));
    const tpl = map.get(String(plan.anchor?.templateRef || ""));
    if (!tpl) return "-";
    return firstLocaleValue(tpl.name || tpl.title, lang) || tpl.code || String(tpl._id).slice(-6);
  }, [operationTemplateItems, plan.anchor?.templateRef, lang]);

  const contractLabel = useMemo(() => {
    // contractRef → fiyat listesi / sözleşme listesi (env'e göre)
    const all = priceListItems.length ? priceListItems : customers; // fallback müşteriye
    const map = new Map(all.map((c: any) => [String(c._id), c]));
    const ctr = map.get(String(plan.anchor?.contractRef || ""));
    if (!ctr) return "-";
    return ctr.code || ctr.name || `${t("contract", "Contract")} · ${String(ctr._id).slice(-6)}`;
  }, [priceListItems, customers, plan.anchor?.contractRef, t]);

  const preferredEmployees = useMemo(() => {
    const ids: string[] = plan.policy?.preferredEmployees?.map(String) ?? [];
    if (!ids.length) return [];
    const map = new Map(employeesAdmin.map((e: any) => [String(e._id), e]));
    return ids.map((id) => {
      const emp = map.get(id);
      return emp ? emp.fullName || emp.email || id.slice(-6) : id.slice(-6);
    });
  }, [plan.policy?.preferredEmployees, employeesAdmin]);

  const [showJson, setShowJson] = useState(false);

  /* ---- render ---- */
  return (
    <Card role="region" aria-label={t("detail.title", "Plan details")}>
      <Head>
        <div>
          <Title>
            {t("detail.plan", "Plan")} <code>{plan.code}</code>
            <Badge data-status={plan.status}>
              {t(`status.${plan.status}`, plan.status)}
            </Badge>
          </Title>
          <Small>
            {t("detail.next", "Next")}: {fmtDateTime(plan.nextRunAt)}{" · "}
            {t("detail.last", "Last")}: {fmtDateTime(plan.lastRunAt)}
          </Small>
        </div>
        <BtnRow>
          <Btn type="button" onClick={() => setShowJson((v) => !v)}>
            {showJson ? t("actions.hideJson", "Hide JSON") : t("actions.showJson", "Show JSON")}
          </Btn>
          <Btn type="button" onClick={onClose}>{t("actions.close", "Close")}</Btn>
        </BtnRow>
      </Head>

      <Grid>
        {/* Sol kolon */}
        <Section>
          <H4>{t("detail.meta", "Meta")}</H4>
          <KV>
            <K>{t("detail.titleI18n", "Title")}</K>
            <V>{firstLocaleValue(plan.title, lang) || "–"}</V>
          </KV>
          <KV>
            <K>{t("detail.descI18n", "Description")}</K>
            <V>{firstLocaleValue(plan.description, lang) || "–"}</V>
          </KV>
          <KV>
            <K>{t("detail.timezone", "Timezone")}</K>
            <V>{plan.timezone || "Europe/Istanbul"}</V>
          </KV>
          <KV>
            <K>{t("detail.tags", "Tags")}</K>
            <V>{(plan.tags || []).join(", ") || "–"}</V>
          </KV>
        </Section>

        <Section>
          <H4>{t("detail.anchor", "Context (Anchor)")}</H4>
          <KV><K>{t("detail.apartment", "Apartment")}</K><V>{apartmentLabel}</V></KV>
          <KV><K>{t("detail.service", "Service")}</K><V>{serviceLabel}</V></KV>
          <KV><K>{t("detail.template", "Template")}</K><V>{templateLabel}</V></KV>
          <KV><K>{t("detail.contract", "Contract")}</K><V>{contractLabel}</V></KV>
        </Section>

        {/* Sağ kolon */}
        <Section>
          <H4>{t("detail.pattern", "Recurrence Pattern")}</H4>
          <Mono>{patternSummary(plan.pattern)}</Mono>
          <SmallMuted>
            {t("detail.start", "Start")}: {fmtDate(plan.startDate)}{" · "}
            {t("detail.end", "End")}: {fmtDate(plan.endDate)}
          </SmallMuted>
        </Section>

        <Section>
          <H4>{t("detail.windowPolicy", "Time Window & Policy")}</H4>
          <KV>
            <K>{t("detail.window", "Window")}</K>
            <V>
              {plan.window?.startTime || "–"} – {plan.window?.endTime || "–"}
              {" · "}
              {t("detail.duration", "Duration")}: {plan.window?.durationMinutes ?? "–"} {t("detail.min", "min")}
            </V>
          </KV>
          <KV><K>{t("detail.leadTime", "Lead time (days)")}</K><V>{plan.policy?.leadTimeDays ?? 3}</V></KV>
          <KV><K>{t("detail.lockAhead", "Lock-ahead periods")}</K><V>{plan.policy?.lockAheadPeriods ?? 1}</V></KV>
          <KV><K>{t("detail.autoAssign", "Auto-assign")}</K><V>{plan.policy?.autoAssign ? t("common.yes","Yes") : t("common.no","No")}</V></KV>
          <KV>
            <K>{t("detail.crewSize", "Crew size")}</K>
            <V>{plan.policy?.minCrewSize ?? "–"} – {plan.policy?.maxCrewSize ?? "–"}</V>
          </KV>
          <KV><K>{t("detail.preferred", "Preferred employees")}</K><V>{preferredEmployees.join(", ") || "–"}</V></KV>
        </Section>

        <Section>
          <H4>{t("detail.exceptions", "Exceptions")}</H4>
          <KV>
            <K>{t("detail.skipDates", "Skip dates")}</K>
            <V>
              {(plan.skipDates?.length || 0) > 0
                ? plan.skipDates!.map((d) => fmtDate(d as any)).join(", ")
                : "–"}
            </V>
          </KV>
          <KV>
            <K>{t("detail.blackouts", "Blackout ranges")}</K>
            <V>
              {(plan.blackouts?.length || 0) > 0
                ? plan.blackouts!
                    .map((b) => `${fmtDate(b.from as any)} – ${fmtDate(b.to as any)}`)
                    .join("  •  ")
                : "–"}
            </V>
          </KV>
        </Section>
      </Grid>

      {showJson && (
        <Pre aria-label={t("detail.json", "Plan JSON")}>
          {JSON.stringify(plan, null, 2)}
        </Pre>
      )}
    </Card>
  );
}

/* ---------------- styled ---------------- */

const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border-radius:${({theme})=>theme.radii.lg};
  padding:${({theme})=>theme.spacings.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
`;
const Head = styled.div`
  display:flex;align-items:center;justify-content:space-between;gap:${({theme})=>theme.spacings.sm};
  h3{margin:0;}
`;
const Title = styled.h3`
  display:flex;align-items:center;gap:${({theme})=>theme.spacings.xs};
  code{font-family:${({theme})=>theme.fonts.mono};}
`;
const Small = styled.div` opacity:.8;font-size:${({theme})=>theme.fontSizes.xsmall}; `;
const SmallMuted = styled(Small)` opacity:.7;margin-top:4px; `;
const BtnRow = styled.div` display:flex;gap:${({theme})=>theme.spacings.xs}; `;
const Btn = styled.button`
  padding:6px 10px;border-radius:${({theme})=>theme.radii.md};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  background:${({theme})=>theme.buttons.secondary.background};
  color:${({theme})=>theme.buttons.secondary.text};
  &:hover{background:${({theme})=>theme.buttons.secondary.backgroundHover};color:${({theme})=>theme.buttons.secondary.textHover};}
`;
const Grid = styled.div`
  display:grid;gap:${({theme})=>theme.spacings.md};
  grid-template-columns: repeat(2, minmax(0,1fr));
  ${({theme})=>theme.media.tablet}{ grid-template-columns:1fr; }
  margin-top:${({theme})=>theme.spacings.md};
`;
const Section = styled.div`
  display:flex;flex-direction:column;gap:6px;
  background:${({theme})=>theme.colors.backgroundAlt};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.borderLight};
  border-radius:${({theme})=>theme.radii.md};
  padding:${({theme})=>theme.spacings.sm};
`;
const H4 = styled.div` font-weight:${({theme})=>theme.fontWeights.semiBold}; color:${({theme})=>theme.colors.title}; `;
const KV = styled.div` display:flex;gap:${({theme})=>theme.spacings.xs}; align-items:flex-start; `;
const K = styled.div`
  min-width:140px;color:${({theme})=>theme.colors.textSecondary};
  font-size:${({theme})=>theme.fontSizes.xsmall};
`;
const V = styled.div` flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; `;
const Mono = styled.div` font-family:${({theme})=>theme.fonts.mono}; font-size:12px; `;
const Pre = styled.pre`
  max-height:420px;overflow:auto;
  font-family:${({theme})=>theme.fonts.mono};
  font-size:12px;
  background:${({theme})=>theme.colors.backgroundAlt};
  padding:${({theme})=>theme.spacings.sm};
  border-radius:${({theme})=>theme.radii.md};
  margin-top:${({theme})=>theme.spacings.sm};
`;
const Badge = styled.span`
  padding:2px 8px;border-radius:${({theme})=>theme.radii.pill};font-size:12px;
  background:${({theme})=>theme.colors.backgroundAlt};
  &[data-status="active"]   { background:${({theme})=>theme.colors.successBg}; color:${({theme})=>theme.colors.success}; }
  &[data-status="paused"]   { background:${({theme})=>theme.colors.warningBackground}; color:${({theme})=>theme.colors.textOnWarning}; }
  &[data-status="archived"] { background:${({theme})=>theme.colors.backgroundAlt}; color:${({theme})=>theme.colors.textSecondary}; }
`;
