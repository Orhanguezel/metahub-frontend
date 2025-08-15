// FE tipleri (backend ile uyumlu ve sıkı)
export type ObjectId = string;

// SupportedLocale tipiniz varsa onunla daraltabilirsiniz.
// export type TranslatedLabel = Partial<Record<SupportedLocale, string>>;
export type TranslatedLabel = Record<string, string | undefined>;

export type DayOfWeek = 0|1|2|3|4|5|6;
export type Nth = 1|2|3|4|5;
export type Month1to12 = 1|2|3|4|5|6|7|8|9|10|11|12;

export interface IScheduleAnchor {
  apartmentRef: ObjectId;      // zorunlu
  categoryRef?: ObjectId;      // neighborhood 
  serviceRef?: ObjectId;       // servicecatalog
  templateRef?: ObjectId;      // operationtemplate
  contractRef?: ObjectId;      // contract
}

export type WeeklyPattern      = { type: "weekly";     every: number; nth?: never; weekday?: never; daysOfWeek: DayOfWeek[] };
export type DayOfMonthPattern  = { type: "dayOfMonth"; every: number; day: number; nth?: never; weekday?: never; daysOfWeek?: never };
export type NthWeekdayPattern  = { type: "nthWeekday"; every: number; nth: Nth; weekday: DayOfWeek; daysOfWeek?: never };
export type YearlyPattern      = { type: "yearly";     month: Month1to12; day: number; every?: never; daysOfWeek?: never; nth?: never; weekday?: never };

export type RecurrencePattern =
  | WeeklyPattern
  | DayOfMonthPattern
  | NthWeekdayPattern
  | YearlyPattern;

export const isWeekly     = (p: RecurrencePattern): p is WeeklyPattern     => p.type === "weekly";
export const isDayOfMonth = (p: RecurrencePattern): p is DayOfMonthPattern => p.type === "dayOfMonth";
export const isNthWeekday = (p: RecurrencePattern): p is NthWeekdayPattern => p.type === "nthWeekday";
export const isYearly     = (p: RecurrencePattern): p is YearlyPattern     => p.type === "yearly";

export interface ITimeWindow {
  startTime?: string;   // "HH:mm" (lokal)
  endTime?: string;     // "HH:mm"
  durationMinutes?: number; // >= 0
}

export interface IGenerationPolicy {
  leadTimeDays?: number;       // >= 0
  lockAheadPeriods?: number;   // >= 0
  autoAssign?: boolean;
  preferredEmployees?: ObjectId[];
  minCrewSize?: number;        // >= 1
  maxCrewSize?: number;        // >= 1
}

export interface IBlackoutRange {
  from: string | Date;
  to?: string | Date;
  reason?: string;
}

export type PlanStatus = "active" | "paused" | "archived";

export interface ISchedulePlan {
  _id: ObjectId;
  tenant: string;
  code: string;
  title?: TranslatedLabel;
  description?: TranslatedLabel;

  anchor: IScheduleAnchor;
  timezone?: string; // default: "Europe/Istanbul"

  pattern: RecurrencePattern;
  window?: ITimeWindow;
  policy?: IGenerationPolicy;

  startDate: string | Date;
  endDate?: string | Date;
  skipDates?: Array<string | Date>;
  blackouts?: IBlackoutRange[];

  lastRunAt?: string | Date;
  nextRunAt?: string | Date;
  lastJobRef?: ObjectId;

  status: PlanStatus;
  tags?: string[];

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* Liste filtreleri (admin) */
export interface PlanAdminFilters {
  q?: string;
  status?: PlanStatus | "";
  apartmentRef?: ObjectId;
  serviceRef?: ObjectId;
  templateRef?: ObjectId;
  contractRef?: ObjectId;
  tag?: string;
  from?: string; // ISO
  to?: string;   // ISO
  limit?: number; // default BE: 200 (max 500)
}

/* ---------- Payload yardımcıları ---------- */
const toISO = (d?: string | Date): string | undefined =>
  d ? (typeof d === "string" ? d : new Date(d).toISOString()) : undefined;

export const normalizePlanPayload = (p: Partial<ISchedulePlan>): Partial<ISchedulePlan> => {
  const next: Partial<ISchedulePlan> = { ...p };

  // Tarihler → ISO
  if ("startDate" in next) next.startDate = toISO(next.startDate) as any;
  if ("endDate"   in next) next.endDate   = toISO(next.endDate) as any;
  if ("lastRunAt" in next) next.lastRunAt = toISO(next.lastRunAt) as any;
  if ("nextRunAt" in next) next.nextRunAt = toISO(next.nextRunAt) as any;

  if ("skipDates" in next && Array.isArray(next.skipDates)) {
    next.skipDates = next.skipDates.map(s => toISO(s) as string);
  }
  if ("blackouts" in next && Array.isArray(next.blackouts)) {
    next.blackouts = next.blackouts.map(b => ({
      ...b,
      from: toISO(b.from)!,
      to: toISO(b.to),
    }));
  }

  // Pattern mikro-normalizasyon (BE zaten doğruluyor)
  if (next.pattern && isWeekly(next.pattern)) {
    const uniq = Array.from(new Set(next.pattern.daysOfWeek)).filter(d => d >= 0 && d <= 6) as DayOfWeek[];
    next.pattern = { ...next.pattern, every: Math.max(1, next.pattern.every || 1), daysOfWeek: uniq };
  }
  if (next.pattern && (isDayOfMonth(next.pattern) || isNthWeekday(next.pattern))) {
    next.pattern = { ...next.pattern, every: Math.max(1, (next.pattern as any).every || 1) } as any;
  }

  // i18n alanlarındaki boş stringleri temizle
  if (next.title) {
    const t: TranslatedLabel = {};
    Object.entries(next.title).forEach(([k, v]) => { if (v) t[k] = v; });
    next.title = t;
  }
  if (next.description) {
    const d: TranslatedLabel = {};
    Object.entries(next.description).forEach(([k, v]) => { if (v) d[k] = v; });
    next.description = d;
  }

  // TZ boş ise backend defaultu ile uyumlu tut
  if (next.timezone === "") delete next.timezone;

  return next;
};

/* ---------- UI yardımcıları (opsiyonel) ---------- */
export const planKey = (p: Pick<ISchedulePlan, "_id"|"code">) => `${p.code} · ${p._id.slice(-6)}`;

export const initialPlanFactory = (apartmentRef: ObjectId): Partial<ISchedulePlan> => ({
  anchor: { apartmentRef },
  pattern: { type: "weekly", every: 1, daysOfWeek: [1] },
  window: { startTime: "09:00", durationMinutes: 60 },
  policy: { leadTimeDays: 2, lockAheadPeriods: 1 },
  startDate: new Date().toISOString(),
  status: "active",
});
